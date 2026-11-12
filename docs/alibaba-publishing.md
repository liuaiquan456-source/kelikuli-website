# Alibaba International native publishing

The native integration is separate from the legacy draft gateway. The storefront admin uses `/admin/alibaba` and `/api/integrations/alibaba/publications`. The legacy `/drafts` API remains draft-only and never silently becomes a publish API.

## Setup

1. Configure the existing Alibaba app callback as `https://kelikuli.com/api/integrations/alibaba/callback`.
2. A signed administrator saves App Key/Secret at `/admin/alibaba`, authorizes the seller account, then verifies product-list and live-schema access.
3. Enable automatic publication there. Each product also needs `alibabaSyncEnabled` and a review hash matching its exact current export data. Saving such a product submits it for review. Custom Lab intake can save facts but cannot grant review approval.
4. Complete missing live category choices from the product editor. Package dimensions and gross weight describe one selected sales unit, never the total MOQ. Unknown values remain empty and block publication.

## Security and operations

- Credentials are AES-256-GCM encrypted in `private/alibaba/connection.enc`, mode 0600. Encryption uses a domain-separated derivation of the existing `ADMIN_SESSION_SECRET`. Back up that key securely; changing it requires reconnecting Alibaba. Nothing goes to GPT or a public product projection.
- OAuth state expires in 15 minutes, is bound to the signed admin session, and is consumed before exchanging the one-use code. Tokens refresh 30 minutes before expiry when an operation needs them. Refresh-token expiry requires reauthorization.
- A filesystem lock protects refresh/configuration writes. After a process crash, inspect whether refresh succeeded before removing `private/alibaba/connection.lock`; never blindly delete it while another process is working.
- Official IOP SDK 1.3.18 signing: TOP calls `/sync` with `method`, `session`, timestamp milliseconds and SHA256 HMAC over sorted nonempty parameters. GOP `/rest/auth/token/create` and `/refresh` prefix the API path. Secrets and tokens are sent only to fixed HTTPS Alibaba endpoints in POST bodies.
- Images must originate at kelikuli.com, www.kelikuli.com, or custom.kelikuli.com, use JPG/PNG, and be <=5MB. Redirects are rejected. Content-addressed photobank cache is private and scoped to app/shop.
- Live schema is read before image upload; XML entities/DTD are rejected. Prices, set units, MOQ, confirmed attributes and package facts are mapped to the current schema. Unrecognized required fields block submission and appear in the supplemental editor. Complex unsupported category structures fail closed.
- Existing `AlibabaDraft` rows also hold native publication receipts (`submitted` plus `draftId` internally means the Alibaba product ID). Legacy `draft` rows are blocked from native creation. No destructive migration is needed.
- State transitions: preparing -> submitting -> submitted; explicit validation rejection -> failed. Unknown network/server result -> uncertain, never automatically retried. `submitting` is written BEFORE the create request, so a crash cannot silently cause another creation. Check an uncertain request in My Alibaba before any manual reconciliation.
- Native publication uses `alibaba.icbu.product.schema.add` with `param_product_top_publish_request` containing `cat_id`, `language`, `publish_type`, `xml`. A success requires `biz_success=true` AND a numeric product_id. Submission does not mean review approval.
- Product updates after submission do not create another product and do not overwrite Alibaba automatically. The existing product ID is shown for review.
- Publishing may take several minutes to import images. If a reverse proxy times out, check saved publication status before retrying; the durable receipt prevents duplicates.

## Verification

`npm test`, `npx tsc --noEmit`, `npm run build`. Test coverage includes wire signing, encrypted credential storage, one-use/session-bound OAuth, XML and set-unit mapping, category missing fields, photo source restrictions, parallel submission deduplication and lost-response protection. Live setup must still verify the actual seller authorization and schema; unit tests alone do not establish a live connection.

Official references: https://open.alibaba.com/doc/doc.htm#/?docId=72 , https://open.alibaba.com/doc/api.htm#/api?cid=20966&path=alibaba.icbu.product.schema.add&methodType=GET/POST , https://developer.alibaba.com/docs/doc.htm?articleId=119213&docType=1&treeId=456 .
