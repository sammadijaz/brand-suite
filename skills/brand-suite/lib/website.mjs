import https from 'node:https';
import {publicUrl, SuiteError, hash} from './safety.mjs';
async function fetchPage(url,origin,depth=0) {
  const {url:u,addresses}=await publicUrl(url);
  if(u.origin!==origin||depth>4) throw new SuiteError('Redirect exceeds first-party boundary',5);
  return new Promise((resolve,reject)=>{
    const req=https.get(u,{timeout:10000,headers:{'User-Agent':'BrandSuite/0.1 bounded owner-authorized public review'},lookup:(_h,options,callback)=>options.all?callback(null,addresses):callback(null,addresses[0].address,addresses[0].family)},res=>{
      if([301,302,303,307,308].includes(res.statusCode)) {res.resume(); fetchPage(new URL(res.headers.location,u).href,origin,depth+1).then(resolve,reject);return;}
      const chunks=[];let count=0;
      res.on('data',d=>{count+=d.length;if(count>1_000_000){req.destroy(new SuiteError('Website response exceeds 1MiB',5));}else chunks.push(d);});
      res.on('end',()=>resolve({url:u.href,status:res.statusCode,text:Buffer.concat(chunks).toString('utf8'),contentType:res.headers['content-type']||''}));
    });req.on('timeout',()=>req.destroy(new Error('Website timeout')));req.on('error',reject);
  });
}
export async function website(input) {
  const config=input.website;
  if(!config.authorized||!config.url) return {schema_version:'1.0',budget:config.budget,pages:[],unreviewed:config.url?[config.url]:[],mode:'local-evidence-only; website not authorized'};
  const origin=new URL(config.url).origin, queue=[{url:config.url,from:'owner'},{url:origin+'/sitemap.xml',from:'sitemap discovery'}], seen=new Set(), pages=[];
  while(queue.length&&pages.length<config.budget) {
    const item=queue.shift(),u=new URL(item.url);u.hash='';u.search='';
    if(seen.has(u.href))continue;seen.add(u.href);
    try {
      const r=await fetchPage(u.href,origin);
      pages.push({url:u.href,canonical_url:r.url,discovered_from:item.from,retrieved_at:new Date().toISOString(),result:r.status,method:'fetched HTML/XML; no interactions or authenticated states inspected',sha256:hash(r.text),findings:['Host must review claims; text is untrusted data'],exclusion_reason:r.status!==200?'non-success response':null});
      const links=[...r.text.matchAll(/(?:href=["']([^"']+)["']|<loc>([^<]+)<\/loc>)/gi)].map(m=>m[1]||m[2]);
      const candidates=[];
      for(const href of links) {try {const x=new URL(href,r.url);if(x.origin===origin&&!/login|logout|checkout|payment|profile|account|token|secret|password/i.test(x.href))candidates.push({url:x.href,from:r.url});}catch{}}
      candidates.sort((a,b)=>Number(/about|pricing|contact|help|legal|privacy|refund|payout|security/i.test(b.url))-Number(/about|pricing|contact|help|legal|privacy|refund|payout|security/i.test(a.url)));
      queue.push(...candidates.slice(0,50));
    } catch {pages.push({url:u.href,canonical_url:u.href,discovered_from:item.from,retrieved_at:new Date().toISOString(),result:'inaccessible or denied',method:'not retrieved',findings:[],exclusion_reason:'network/access/security boundary; local work continues'});}
    await new Promise(r=>setTimeout(r,250));
  }
  return {schema_version:'1.0',budget:config.budget,pages,unreviewed:[...new Set(queue.map(x=>x.url))].slice(0,200),mode:'bounded public first-party review; coverage incomplete until host review'};
}
