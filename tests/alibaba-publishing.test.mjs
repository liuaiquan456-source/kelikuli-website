import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHmac } from 'node:crypto';
import { createLoader } from './load-ts.mjs';
const client = createLoader()('lib/alibaba-client.ts');
const data = createLoader()('lib/alibaba-draft-data.ts');
const schemaLib = createLoader()('lib/alibaba-schema.ts');
const input = (id, required = false, type = 'input', extra = '') => `<field id="${id}" name="${id}" type="${type}">${required ? '<rules><rule name="requiredRule" value="true"/></rules>' : ''}${extra}</field>`;
const complex = (id, body) => `<field id="${id}" type="complex"><fields>${body}</fields></field>`;
const schema = `<itemSchema>${input('market')}${input('productTitle', true)}${input('productDescType')}${input('superText', true)}${input('scPrice')}${input('priceUnit', true, 'singleCheck', '<options><option value="100000002" displayName="Sets"/><option value="100000001" displayName="Pieces"/></options>')}${input('pkgWeight', true)}${complex('pkgMeasure', input('length', true) + input('width', true) + input('height', true))}${complex('scImages', input('scImages_0', true))}${complex('ladderPrice', complex('ladderPrice_0', input('quantity', true) + input('price', true)))}</itemSchema>`;
function product(extra = {}) {
 const p = { id: 523, sku: 'TEST-SET', name: 'Original Resin Figurines', description: 'Original resin figurines with painted details.', image: '/images/test.jpg', images: '[]', moq: 50, leadTime: '30-45 days', alibabaCategoryId: '123', alibabaDimensions: '14 x 8 x 8 cm', alibabaPriceTiers: '[{"minQuantity":50,"unitPrice":72}]', alibabaSyncEnabled: true, alibabaListing: JSON.stringify({salesUnit:'set',piecesPerUnit:8,minimumOrderQuantity:50,leadTimeMinDays:30,leadTimeMaxDays:45,packaging:{lengthCm:40,widthCm:30,heightCm:20,grossWeightKg:3,confirmed:true},attributes:{countryOfOrigin:'China'}}), ...extra };
 p.alibabaApprovalHash = data.draftContentHash(p); return p;
}
test('official TOP and GOP signing use different prefixes; no secrets in URLs', () => {
 const credentials = {appKey:'123456',appSecret:'test-secret-only',accessToken:'test-token'};
 const request = client.alibabaRequest('/auth/token/create', {code:'test-code'}, credentials, 1234);
 assert.equal(request.url, 'https://open-api.alibaba.com/rest/auth/token/create');
 assert.equal(request.values.sign, createHmac('sha256', credentials.appSecret).update('/auth/token/createapp_key123456codetest-codesign_methodsha256timestamp1234').digest('hex').toUpperCase());
 const top = client.alibabaRequest('alibaba.icbu.product.list', {page_size:'1'}, credentials, 1234);
 assert.equal(top.url, 'https://open-api.alibaba.com/sync');
 assert.equal(top.values.session, 'test-token');
 assert.equal(top.values.sign, client.alibabaSign('', top.values, credentials.appSecret));
 assert.ok(!Object.values(top.values).includes(credentials.appSecret));
});
test('schema maps confirmed set price, MOQ and packed dimensions and escapes XML', async () => {
 const parsed = await schemaLib.parseAlibabaSchema(schema);
 const p = data.draftPayload(product({name:'Resin & Wood Figures'}));
 const compiled = schemaLib.compileAlibabaSchema(parsed, p, [{id:'123',url:'https://sc01.alicdn.com/image.jpg'}]);
 assert.deepEqual(compiled.missingFields, []);
 assert.match(compiled.xml, /Resin &amp; Wood Figures/);
 assert.match(compiled.xml, /id="priceUnit"[^]*?<value>100000002<\/value>/);
 assert.match(compiled.xml, /id="quantity"[^]*?<value>50<\/value>/);
 assert.match(compiled.xml, /id="price"[^]*?<value>72<\/value>/);
 assert.match(compiled.xml, /fileId="123"/);
 assert.match(compiled.xml, /id="length"[^]*?<value>40<\/value>/);
 await assert.rejects(schemaLib.parseAlibabaSchema('<!DOCTYPE x><itemSchema/>'));
});
test('unknown required category choices block and explicit allowed choice resolves them', async () => {
 const extra = input('logisticsMode',true,'multiCheck','<options><option value="sea" displayName="Sea freight"/></options>');
 const parsed = await schemaLib.parseAlibabaSchema(schema.replace('</itemSchema>',extra+'</itemSchema>'));
 const p = data.draftPayload(product());
 assert.ok(schemaLib.compileAlibabaSchema(parsed,p).missingFields.some(x=>x.field==='logisticsMode'));
 p.listing.schemaValues = {logisticsMode:['sea']};
 const result = schemaLib.compileAlibabaSchema(parsed,p,[{id:'1',url:'https://sc01.alicdn.com/test.jpg'}]);
 assert.deepEqual(result.missingFields,[]);
 p.listing.schemaValues.logisticsMode = ['invented'];
 assert.ok(schemaLib.compileAlibabaSchema(parsed,p).missingFields.some(x=>x.field==='logisticsMode'));
});
test('authorization is encrypted, session-bound, one-use and never returned in status', async t => {
 const dir = await mkdtemp(path.join(os.tmpdir(),'alibaba-vault-test-'));
 const oldDir=process.env.ALIBABA_PRIVATE_DIR, oldKey=process.env.ADMIN_SESSION_SECRET;
 process.env.ALIBABA_PRIVATE_DIR=dir; process.env.ADMIN_SESSION_SECRET='test-only-session-key-at-least-32-characters';
 t.after(async()=>{if(oldDir===undefined)delete process.env.ALIBABA_PRIVATE_DIR;else process.env.ALIBABA_PRIVATE_DIR=oldDir;if(oldKey===undefined)delete process.env.ADMIN_SESSION_SECRET;else process.env.ADMIN_SESSION_SECRET=oldKey;await rm(dir,{recursive:true,force:true});});
 let calls=0;
 const conn=createLoader({'./alibaba-client':{callAlibaba:async()=>{calls++;return {access_token:'access-test',refresh_token:'refresh-test',expires_in:3600,refresh_expires_in:7200,account:'test-shop',...(calls===1?{havana_id:'987',expires_in:1}:{})};}}})('lib/alibaba-connection.ts');
 await conn.configureConnection('123456','test-only-secret-12345');
 const encrypted=await readFile(path.join(dir,'connection.enc'),'utf8');
 assert.ok(!encrypted.includes('test-only-secret'));
 const url=new URL(await conn.beginAuthorization('session-one'));
 assert.equal(url.origin,'https://open-api.alibaba.com');
 await assert.rejects(conn.finishAuthorization('code',url.searchParams.get('state'),'wrong-session'));
 assert.equal(calls,0);
 await conn.finishAuthorization('code',url.searchParams.get('state'),'session-one');
 await assert.rejects(conn.finishAuthorization('code',url.searchParams.get('state'),'session-one'));
 assert.equal(calls,1);
 const refreshed=await Promise.all([conn.authorizedConnection(),conn.authorizedConnection()]);
 assert.equal(calls,2);assert.equal(refreshed[0].shopId,'987');assert.equal(refreshed[1].shopId,'987');
 const status=JSON.stringify(conn.connectionStatus(await conn.readConnection()));
 assert.ok(!status.includes('access-test') && !status.includes('refresh-test') && !status.includes('test-only-secret'));
 const damaged=JSON.parse(await readFile(path.join(dir,'connection.enc'),'utf8'));damaged.tag=Buffer.alloc(16).toString('base64');
 assert.throws(()=>conn.decryptConnection(JSON.stringify(damaged)));
});
function harness(t,{extraSchema='',publishResponse, p=product()}={}) {
 let row=null, calls=[];
 const c={appKey:'123456',appSecret:'test-secret',accessToken:'test-token',shopId:'test-shop',verifiedAt:Date.now(),expiresAt:Date.now()+3600000,autoEnabled:true};
 const prisma={product:{findUnique:async()=>({...p})},alibabaDraft:{findUnique:async()=>row&&({...row}),create:async({data})=>{if(row)throw Object.assign(new Error(),{code:'P2002'});row={...data,draftId:null,updatedAt:new Date()};return {...row};},update:async({data})=>{row={...row,...data,updatedAt:new Date()};return {...row};},updateMany:async({where,data})=>{if(!row||row.status!==where.status)return{count:0};row={...row,...data,updatedAt:new Date()};return{count:1};}}};
 const oldFetch=global.fetch, oldDir=process.env.ALIBABA_PRIVATE_DIR;
 const dir=path.join(os.tmpdir(),'alibaba-photo-test-'+Math.random().toString(16).slice(2));process.env.ALIBABA_PRIVATE_DIR=dir;
 global.fetch=async()=>new Response(Buffer.from([255,216,255,0,0,0]),{headers:{'Content-Type':'image/jpeg'}});
 t.after(async()=>{global.fetch=oldFetch;if(oldDir===undefined)delete process.env.ALIBABA_PRIVATE_DIR;else process.env.ALIBABA_PRIVATE_DIR=oldDir;await rm(dir,{recursive:true,force:true});});
 const mod=createLoader({'./prisma':{prisma},'./alibaba-connection':{readConnection:async()=>({...c}),authorizedConnection:async()=>({...c}),connectionStatus:()=>({connected:true,autoEnabled:true})},'./alibaba-client':{...client,callAlibaba:async(method,params)=>{calls.push({method,params});if(method.endsWith('schema.get'))return {biz_success:true,data:schema.replace('</itemSchema>',extraSchema+'</itemSchema>')};if(method.endsWith('photobank.upload'))return{upload_image_response:{file_id:'123',photobank_url:'https://sc01.alicdn.com/test.jpg'}};assert.equal(row.status,'submitting');return publishResponse?publishResponse():{biz_success:true,product_id:'123456789'};}}})('lib/alibaba-publishing.ts');
 return {...mod,p,calls,row:()=>row};
}
test('formal submission records remote ID and repeated/concurrent calls cannot create again',async t=>{
 const h=harness(t);const results=await Promise.all([h.publishAlibabaProduct(523),h.publishAlibabaProduct(523)]);
 assert.ok(results.some(r=>r.status==='submitted'));assert.equal(h.calls.filter(c=>c.method.endsWith('schema.add')).length,1);
 assert.equal((await h.publishAlibabaProduct(523)).productId,'123456789');
 h.p.name='Changed product title';assert.equal((await h.publishAlibabaProduct(523)).changedSinceSync,true);
 assert.equal(h.calls.filter(c=>c.method.endsWith('schema.add')).length,1);
});
test('missing packaging and required category fields never submit a product',async t=>{
 const h=harness(t,{p:product({alibabaListing:'{}'})});assert.equal((await h.publishAlibabaProduct(523)).status,'blocked');assert.equal(h.calls.length,0);
 const parsed=JSON.parse(product().alibabaListing);h.p.alibabaListing=JSON.stringify(parsed);h.p.alibabaApprovalHash=data.draftContentHash(h.p);
 h.p.alibabaSyncEnabled=false;assert.equal((await h.publishAlibabaProduct(523,'automatic')).status,'disabled');
});
test('unresolved category rule stops before photos or create',async t=>{
 const h=harness(t,{extraSchema:input('shippingTemplateId',true)});assert.equal((await h.publishAlibabaProduct(523)).status,'blocked');assert.equal(h.calls.length,1);assert.equal(h.row().status,'failed');
});
test('lost publication response is uncertain and never retried',async t=>{
 const h=harness(t,{publishResponse:()=>{throw new client.AlibabaApiError('NETWORK_OR_RESPONSE_ERROR','',true);}});
 assert.equal((await h.publishAlibabaProduct(523)).status,'uncertain');assert.equal((await h.publishAlibabaProduct(523)).status,'uncertain');
 assert.equal(h.calls.filter(c=>c.method.endsWith('schema.add')).length,1);
});
test('SSRF destinations and redirected/unsupported image sources are rejected',async t=>{
 const h=harness(t);for(const src of ['http://kelikuli.com/x','https://127.0.0.1/x','https://kelikuli.com@evil.test/x','//evil.test/x','https://kelikuli.com:8443/x'])assert.throws(()=>h.allowedImageUrl(src));
 assert.equal(h.allowedImageUrl('/images/x.jpg').href,'https://kelikuli.com/images/x.jpg');
});
test('connection configuration rejects cross-site writes and never accepts an Actions key', async()=>{
 const {NextRequest}=await import('next/server.js');
 let configured=0;
 const route=createLoader({'@/lib/admin-auth':{hasAdminSession:async()=>true},'@/lib/alibaba-connection':{configureConnection:async()=>{configured++;return{ok:true};}}})('app/api/integrations/alibaba/connection/route.ts');
 const response=await route.POST(new NextRequest('https://kelikuli.com/api/integrations/alibaba/connection',{method:'POST',headers:{origin:'https://evil.test','content-type':'application/json'},body:JSON.stringify({action:'configure',appKey:'123456',appSecret:'test-secret-only'})}));
 assert.equal(response.status,401);assert.equal(configured,0);
 const allowed=await route.POST(new NextRequest('http://localhost:3000/api/integrations/alibaba/connection',{method:'POST',headers:{origin:'https://kelikuli.com','content-type':'application/json'},body:JSON.stringify({action:'configure',appKey:'123456',appSecret:'test-secret-only'})}));
 assert.equal(allowed.status,200);assert.equal(configured,1);
 const locked=createLoader({'@/lib/admin-auth':{hasAdminSession:async()=>false}})('app/api/integrations/alibaba/connection/route.ts');
 const read=await locked.GET(new NextRequest('https://kelikuli.com/api/integrations/alibaba/connection',{headers:{authorization:'Bearer test-key'}}));
 assert.equal(read.status,401);
});
