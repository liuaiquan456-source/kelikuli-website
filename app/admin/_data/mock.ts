// ─── Types ────────────────────────────────────────────────────────────────────
export interface Product {
  id: number; name: string; category: string; price: number;
  stock: number; status: "active" | "inactive"; image: string;
  createdAt: string; tags: string[];
}
export interface OrderItem {
  id: number; productName: string; category: string; qty: number;
  unitPrice: number; total: number;
  status: "pending"|"confirmed"|"sourcing"|"in_stock"|"out_of_stock"|"in_production"|"cancelled"|"shipped";
  notes: string;
}
export interface Order {
  id: string; customer: string; email: string; company: string;
  country: string; total: number; currency: string;
  status: "pending"|"confirmed"|"processing"|"shipped"|"cancelled";
  createdAt: string; items: OrderItem[];
}
export interface Keyword { keyword: string; engine: string; visits: number; landingPage: string; country: string; lastSeen: string; }
export interface PageStat { url: string; title: string; visits: number; avgTime: string; bounceRate: number; mainSource: string; }
export interface IPLog { id: number; time: string; ip: string; country: string; source: string; keyword: string; landingPage: string; device: string; pageViews: number; duration: string; }
export interface AdminUser { id: number; name: string; email: string; role: "Super Admin"|"Admin"|"Editor"; status: "active"|"inactive"; lastLogin: string; }

// ─── Products ─────────────────────────────────────────────────────────────────
export const CATEGORIES = [
  "Figurines","Christmas Series","Halloween Series","Garden Series","Resin Crafts",
  "Resin Light","Bobble Head Series","Fridge Magnet","Snow Globe","Piggy Bank",
  "Prince Series","Lucky Cat","Astronaut Series","Blind Box Series","Religious Crafts","Phone Stand",
];

export const mockProducts: Product[] = [
  { id:1,  name:"Cute Santa Claus Snowman Bear Mini Resin Statue",          category:"Christmas Series",  price:4.80,  stock:500,  status:"active",   image:"/images/products/product-001.jpg", createdAt:"2026-04-01", tags:["christmas","santa","snowman"] },
  { id:2,  name:"Resin Hand-Painted Panda Astronaut Statue",                 category:"Astronaut Series",  price:6.20,  stock:320,  status:"active",   image:"/images/products/product-002.jpg", createdAt:"2026-04-03", tags:["astronaut","panda","space"] },
  { id:3,  name:"Custom Resin Rabbit Phone Stand Figurine with Crown",       category:"Phone Stand",       price:5.50,  stock:200,  status:"active",   image:"/images/products/product-003.jpg", createdAt:"2026-04-05", tags:["phone stand","rabbit"] },
  { id:4,  name:"Cute Cartoon Hand-painted Resin Animal Figurine",           category:"Figurines",         price:3.80,  stock:0,    status:"inactive", image:"/images/products/product-004.jpg", createdAt:"2026-04-06", tags:["animal","figurine"] },
  { id:5,  name:"Resin Beach Fat Lady Swimsuit Figurine Desktop Decoration", category:"Figurines",         price:7.50,  stock:150,  status:"active",   image:"/images/products/product-009.jpg", createdAt:"2026-04-08", tags:["figurine","beach","funny"] },
  { id:6,  name:"Little Prince Resin Figurine Gift Set",                      category:"Prince Series",     price:12.00, stock:80,   status:"active",   image:"/images/products/product-013.jpg", createdAt:"2026-04-10", tags:["prince","gift","couple"] },
  { id:7,  name:"Halloween Pumpkin Ghost Resin Decoration Set",               category:"Halloween Series",  price:8.50,  stock:400,  status:"active",   image:"/images/products/product-020.jpg", createdAt:"2026-04-11", tags:["halloween","pumpkin","ghost"] },
  { id:8,  name:"Garden Gnome Mushroom Outdoor Resin Decoration",             category:"Garden Series",     price:9.00,  stock:260,  status:"active",   image:"/images/products/product-025.jpg", createdAt:"2026-04-12", tags:["garden","gnome","outdoor"] },
  { id:9,  name:"Classic Snow Globe Music Box Water Ball",                    category:"Snow Globe",        price:15.00, stock:120,  status:"active",   image:"/images/products/product-030.jpg", createdAt:"2026-04-13", tags:["snow globe","music box"] },
  { id:10, name:"Lucky Cat Fortune Resin Figurine Gold Color",                category:"Lucky Cat",         price:5.00,  stock:350,  status:"active",   image:"/images/products/product-035.jpg", createdAt:"2026-04-14", tags:["lucky cat","fortune","gold"] },
  { id:11, name:"Cute Animal Piggy Bank Resin Coin Saving Box",               category:"Piggy Bank",        price:6.80,  stock:0,    status:"inactive", image:"/images/products/product-040.jpg", createdAt:"2026-04-15", tags:["piggy bank","coin","saving"] },
  { id:12, name:"Blind Box Mystery Figurine Series 6 Designs",                category:"Blind Box Series",  price:10.00, stock:600,  status:"active",   image:"/images/products/product-045.jpg", createdAt:"2026-04-16", tags:["blind box","mystery","collectible"] },
  { id:13, name:"Bobble Head Cartoon Character Resin Nodding Doll",           category:"Bobble Head Series",price:7.20,  stock:180,  status:"active",   image:"/images/products/product-050.jpg", createdAt:"2026-04-17", tags:["bobble head","nodding","car"] },
  { id:14, name:"Fridge Magnet Resin Souvenir Decorative Set of 4",           category:"Fridge Magnet",     price:3.50,  stock:800,  status:"active",   image:"/images/products/product-055.jpg", createdAt:"2026-04-18", tags:["fridge magnet","souvenir"] },
  { id:15, name:"Angel Wings Religious Cross Resin Statue Home Decor",        category:"Religious Crafts",  price:8.00,  stock:90,   status:"active",   image:"/images/products/product-060.jpg", createdAt:"2026-04-19", tags:["religious","angel","cross"] },
];

// ─── Orders ───────────────────────────────────────────────────────────────────
const ITEM_STATUSES = ["pending","confirmed","sourcing","in_stock","out_of_stock","in_production","cancelled","shipped"] as const;

export const mockOrders: Order[] = [
  {
    id:"ORD-2026-001", customer:"James Wilson", email:"james@toystrade.com", company:"Toys Trade LLC",
    country:"United States", total:4250.00, currency:"USD", status:"confirmed", createdAt:"2026-05-01T09:15:00",
    items:[
      { id:1, productName:"Cute Santa Claus Snowman Bear Mini Resin Statue", category:"Christmas Series", qty:500, unitPrice:4.80, total:2400, status:"confirmed", notes:"" },
      { id:2, productName:"Little Prince Resin Figurine Gift Set",           category:"Prince Series",    qty:150, unitPrice:12.00,total:1800, status:"sourcing",  notes:"Check stock" },
      { id:3, productName:"Fridge Magnet Resin Souvenir Set",                category:"Fridge Magnet",   qty:50,  unitPrice:1.00, total:50,   status:"pending",   notes:"" },
    ],
  },
  {
    id:"ORD-2026-002", customer:"Sophie Martin", email:"sophie@deco-paris.fr", company:"Deco Paris",
    country:"France", total:1980.00, currency:"USD", status:"processing", createdAt:"2026-04-28T14:30:00",
    items:[
      { id:1, productName:"Garden Gnome Mushroom Outdoor Resin Decoration",  category:"Garden Series",    qty:220, unitPrice:9.00, total:1980, status:"in_production", notes:"Custom color: green" },
    ],
  },
  {
    id:"ORD-2026-003", customer:"Ahmed Al-Rashid", email:"ahmed@gulfimport.ae", company:"Gulf Import Co.",
    country:"UAE", total:6800.00, currency:"USD", status:"shipped", createdAt:"2026-04-20T08:00:00",
    items:[
      { id:1, productName:"Lucky Cat Fortune Resin Figurine Gold Color",     category:"Lucky Cat",        qty:800, unitPrice:5.00, total:4000, status:"shipped", notes:"" },
      { id:2, productName:"Classic Snow Globe Music Box Water Ball",          category:"Snow Globe",       qty:180, unitPrice:15.00,total:2700, status:"shipped", notes:"Fragile packaging" },
      { id:3, productName:"Angel Wings Religious Resin Statue",               category:"Religious Crafts", qty:25,  unitPrice:4.00, total:100,  status:"shipped", notes:"" },
    ],
  },
  {
    id:"ORD-2026-004", customer:"Maria Garcia", email:"maria@tiendas.es", company:"Tiendas España",
    country:"Spain", total:2600.00, currency:"USD", status:"pending", createdAt:"2026-05-02T11:45:00",
    items:[
      { id:1, productName:"Blind Box Mystery Figurine Series",                category:"Blind Box Series", qty:200, unitPrice:10.00,total:2000, status:"pending",  notes:"" },
      { id:2, productName:"Bobble Head Cartoon Character Resin Doll",         category:"Bobble Head Series",qty:80, unitPrice:7.50, total:600,  status:"pending",  notes:"Car decoration" },
    ],
  },
  {
    id:"ORD-2026-005", customer:"Kenji Tanaka", email:"kenji@japan-gifts.jp", company:"Japan Gifts Import",
    country:"Japan", total:3150.00, currency:"USD", status:"confirmed", createdAt:"2026-04-25T07:20:00",
    items:[
      { id:1, productName:"Cute Cartoon Resin Animal Figurine",               category:"Figurines",        qty:500, unitPrice:3.80, total:1900, status:"in_stock", notes:"" },
      { id:2, productName:"Resin Beach Fat Lady Swimsuit Figurine",           category:"Figurines",        qty:150, unitPrice:7.50, total:1125, status:"confirmed",notes:"" },
      { id:3, productName:"Halloween Pumpkin Ghost Resin Set",                category:"Halloween Series", qty:25,  unitPrice:5.00, total:125,  status:"cancelled",notes:"Customer changed mind" },
    ],
  },
  {
    id:"ORD-2026-006", customer:"Lisa Chen", email:"lisa@hkgifts.hk", company:"HK Gifts Trading",
    country:"Hong Kong", total:1440.00, currency:"USD", status:"cancelled", createdAt:"2026-04-15T16:00:00",
    items:[
      { id:1, productName:"Cute Animal Piggy Bank Resin Coin Box",            category:"Piggy Bank",       qty:200, unitPrice:6.80, total:1360, status:"cancelled",notes:"Out of budget" },
      { id:2, productName:"Fridge Magnet Resin Souvenir Set",                 category:"Fridge Magnet",   qty:80,  unitPrice:1.00, total:80,   status:"cancelled",notes:"" },
    ],
  },
];

// ─── Traffic Sources ──────────────────────────────────────────────────────────
export const mockSources = [
  { source:"Google Search",   icon:"google",   visits:8420, percentage:47.2, change:+12.3, color:"#4285F4" },
  { source:"Direct",          icon:"link",     visits:3850, percentage:21.6, change:+5.1,  color:"#6366F1" },
  { source:"Facebook",        icon:"facebook", visits:2180, percentage:12.2, change:-3.4,  color:"#1877F2" },
  { source:"Instagram",       icon:"instagram",visits:1560, percentage:8.7,  change:+18.9, color:"#E1306C" },
  { source:"Bing Search",     icon:"search",   visits:980,  percentage:5.5,  change:+2.1,  color:"#00809D" },
  { source:"Email Marketing", icon:"mail",     visits:540,  percentage:3.0,  change:+0.8,  color:"#F59E0B" },
  { source:"Other Websites",  icon:"globe",    visits:310,  percentage:1.7,  change:-1.2,  color:"#94A3B8" },
];

// ─── Keywords ─────────────────────────────────────────────────────────────────
export const mockKeywords: Keyword[] = [
  { keyword:"custom resin toys manufacturer",    engine:"Google", visits:342, landingPage:"/",               country:"United States", lastSeen:"2026-05-04 09:12" },
  { keyword:"resin figurines wholesale",          engine:"Google", visits:289, landingPage:"/products",       country:"United Kingdom", lastSeen:"2026-05-04 08:45" },
  { keyword:"OEM ODM resin crafts factory",       engine:"Google", visits:215, landingPage:"/custom-oem-odm", country:"Australia",      lastSeen:"2026-05-04 08:30" },
  { keyword:"blind box figurines manufacturer",   engine:"Bing",   visits:178, landingPage:"/products",       country:"Canada",         lastSeen:"2026-05-04 07:55" },
  { keyword:"kelikuli resin toys",                engine:"Google", visits:156, landingPage:"/",               country:"China",          lastSeen:"2026-05-04 07:40" },
  { keyword:"christmas resin ornaments bulk",     engine:"Google", visits:134, landingPage:"/products",       country:"Germany",        lastSeen:"2026-05-04 07:20" },
  { keyword:"halloween resin decoration factory", engine:"Google", visits:122, landingPage:"/products",       country:"France",         lastSeen:"2026-05-03 22:15" },
  { keyword:"snow globe manufacturer china",      engine:"Bing",   visits:98,  landingPage:"/products",       country:"Spain",          lastSeen:"2026-05-03 21:30" },
  { keyword:"custom lucky cat figurine OEM",      engine:"Google", visits:87,  landingPage:"/custom-oem-odm", country:"Japan",          lastSeen:"2026-05-03 20:45" },
  { keyword:"resin craft wholesale supplier",     engine:"Google", visits:76,  landingPage:"/products",       country:"UAE",            lastSeen:"2026-05-03 19:00" },
  { keyword:"bobble head manufacturer china",     engine:"Google", visits:65,  landingPage:"/products",       country:"United States",  lastSeen:"2026-05-03 18:20" },
  { keyword:"garden gnome resin statue bulk",     engine:"Bing",   visits:54,  landingPage:"/products",       country:"Netherlands",    lastSeen:"2026-05-03 17:45" },
];

// ─── Page Stats ───────────────────────────────────────────────────────────────
export const mockPageStats: PageStat[] = [
  { url:"/",               title:"Home - Kelikuli Resin Toys",          visits:6842, avgTime:"2:34", bounceRate:38.2, mainSource:"Google" },
  { url:"/products",       title:"Products - Kelikuli",                  visits:4215, avgTime:"3:12", bounceRate:28.5, mainSource:"Google" },
  { url:"/custom-oem-odm", title:"Custom OEM/ODM Service - Kelikuli",    visits:2680, avgTime:"4:05", bounceRate:22.1, mainSource:"Direct" },
  { url:"/about-us",       title:"About Us - Kelikuli",                  visits:1420, avgTime:"1:48", bounceRate:45.3, mainSource:"Google" },
  { url:"/contact",        title:"Contact - Kelikuli",                   visits:1180, avgTime:"2:15", bounceRate:32.8, mainSource:"Direct" },
  { url:"/news",           title:"News - Kelikuli",                      visits:890,  avgTime:"3:42", bounceRate:41.6, mainSource:"Google" },
  { url:"/products/1",     title:"Santa Resin Statue - Kelikuli",        visits:645,  avgTime:"2:58", bounceRate:35.0, mainSource:"Google" },
  { url:"/products/6",     title:"Little Prince Figurine - Kelikuli",    visits:512,  avgTime:"3:20", bounceRate:30.2, mainSource:"Instagram" },
  { url:"/products/9",     title:"Snow Globe Music Box - Kelikuli",      visits:487,  avgTime:"2:45", bounceRate:33.5, mainSource:"Google" },
  { url:"/products/12",    title:"Blind Box Mystery Series - Kelikuli",  visits:423,  avgTime:"4:10", bounceRate:25.8, mainSource:"Facebook" },
];

// ─── IP Logs ──────────────────────────────────────────────────────────────────
export const mockIPLogs: IPLog[] = [
  { id:1,  time:"2026-05-04 09:42",ip:"104.28.112.45",  country:"🇺🇸 United States", source:"Google",   keyword:"custom resin toys",         landingPage:"/",               device:"Desktop", pageViews:7,  duration:"6:32" },
  { id:2,  time:"2026-05-04 09:38",ip:"2.28.45.12",     country:"🇬🇧 United Kingdom", source:"Google",   keyword:"resin figurines wholesale",  landingPage:"/products",       device:"Mobile",  pageViews:4,  duration:"3:15" },
  { id:3,  time:"2026-05-04 09:25",ip:"45.63.120.88",   country:"🇦🇺 Australia",     source:"Direct",   keyword:"",                          landingPage:"/custom-oem-odm", device:"Desktop", pageViews:9,  duration:"8:44" },
  { id:4,  time:"2026-05-04 09:10",ip:"82.100.45.230",  country:"🇩🇪 Germany",       source:"Bing",     keyword:"christmas resin bulk",       landingPage:"/products",       device:"Desktop", pageViews:5,  duration:"4:20" },
  { id:5,  time:"2026-05-04 08:55",ip:"34.180.92.14",   country:"🇫🇷 France",        source:"Facebook", keyword:"",                          landingPage:"/",               device:"Mobile",  pageViews:3,  duration:"2:10" },
  { id:6,  time:"2026-05-04 08:40",ip:"203.45.78.120",  country:"🇯🇵 Japan",         source:"Google",   keyword:"lucky cat OEM",             landingPage:"/custom-oem-odm", device:"Desktop", pageViews:6,  duration:"5:30" },
  { id:7,  time:"2026-05-04 08:22",ip:"185.220.101.56", country:"🇪🇸 Spain",         source:"Google",   keyword:"snow globe manufacturer",    landingPage:"/products",       device:"Tablet",  pageViews:4,  duration:"3:50" },
  { id:8,  time:"2026-05-04 08:15",ip:"91.108.56.120",  country:"🇦🇪 UAE",           source:"Direct",   keyword:"",                          landingPage:"/",               device:"Mobile",  pageViews:8,  duration:"7:12" },
  { id:9,  time:"2026-05-04 07:58",ip:"49.229.100.45",  country:"🇹🇭 Thailand",      source:"Instagram",keyword:"",                          landingPage:"/products/12",    device:"Mobile",  pageViews:3,  duration:"2:45" },
  { id:10, time:"2026-05-04 07:44",ip:"119.75.218.80",  country:"🇨🇳 China",         source:"Direct",   keyword:"",                          landingPage:"/",               device:"Desktop", pageViews:12, duration:"15:30" },
  { id:11, time:"2026-05-04 07:30",ip:"64.233.160.0",   country:"🇨🇦 Canada",        source:"Google",   keyword:"blind box figurine factory", landingPage:"/products",       device:"Desktop", pageViews:5,  duration:"4:55" },
  { id:12, time:"2026-05-04 07:15",ip:"31.13.74.174",   country:"🇳🇱 Netherlands",   source:"Facebook", keyword:"",                          landingPage:"/",               device:"Mobile",  pageViews:2,  duration:"1:30" },
  { id:13, time:"2026-05-04 06:50",ip:"172.217.5.142",  country:"🇰🇷 South Korea",   source:"Google",   keyword:"resin craft wholesale",      landingPage:"/products",       device:"Desktop", pageViews:6,  duration:"5:20" },
  { id:14, time:"2026-05-04 06:30",ip:"52.84.125.38",   country:"🇺🇸 United States", source:"Email",    keyword:"",                          landingPage:"/custom-oem-odm", device:"Desktop", pageViews:10, duration:"9:15" },
  { id:15, time:"2026-05-04 06:10",ip:"80.241.30.99",   country:"🇮🇹 Italy",         source:"Bing",     keyword:"resin garden decoration",    landingPage:"/products",       device:"Desktop", pageViews:4,  duration:"3:40" },
];

// ─── Users ────────────────────────────────────────────────────────────────────
export const mockUsers: AdminUser[] = [
  { id:1, name:"Admin Master",   email:"admin@kelikuli.com",     role:"Super Admin", status:"active",   lastLogin:"2026-05-04 09:00" },
  { id:2, name:"Liu Aiquan",     email:"liuaiquan456@gmail.com", role:"Super Admin", status:"active",   lastLogin:"2026-05-04 08:45" },
  { id:3, name:"Sales Manager",  email:"sales@kelikuli.com",     role:"Admin",       status:"active",   lastLogin:"2026-05-03 17:30" },
  { id:4, name:"Content Editor", email:"editor@kelikuli.com",    role:"Editor",      status:"inactive", lastLogin:"2026-04-28 11:00" },
];

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export const dashStats = {
  totalProducts: 223, totalVisits: 15432, todayVisits: 342, uniqueVisitors: 8921,
  totalOrders: 6, pendingOrders: 2,
};

export const recentVisitors = mockIPLogs.slice(0, 8);
