import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import net from 'node:net';
import dns from 'node:dns/promises';

export class SuiteError extends Error {
  constructor(message, code = 2) { super(message); this.code = code; }
}
export const hash = value => crypto.createHash('sha256').update(value).digest('hex');
export const fileHash = p => hash(fs.readFileSync(p));
export const json = p => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));
export const writeJson = (p, data) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n'); };
export const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function inside(root, relative) {
  if (path.isAbsolute(relative) || relative.includes('\0')) throw new SuiteError('Absolute or invalid artifact path', 5);
  const base = fs.realpathSync(root), p = path.resolve(base, relative);
  if (p !== base && !p.startsWith(base + path.sep)) throw new SuiteError('Path escapes designated root', 5);
  let current = base;
  for (const component of path.relative(base, p).split(path.sep).filter(Boolean)) {
    current = path.join(current, component);
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw new SuiteError('Symlinks are not accepted', 5);
  }
  return p;
}
export function separate(target, output) {
  const a = fs.realpathSync(target), b = path.resolve(output);
  if (b === a || b.startsWith(a + path.sep) || a.startsWith(b + path.sep)) throw new SuiteError('Output must be outside and separate from the target codebase', 5);
  let p = b;
  while (!fs.existsSync(p)) p = path.dirname(p);
  if (fs.realpathSync(p) !== p) throw new SuiteError('Output ancestor resolves through a link', 5);
}
export const denied = p => /(^|[\/\\])(?:\.git|node_modules|\.env(?:\..*)?|credentials?|secrets?|private|employees?|customers?|browser-profiles?|signed-contracts?|production|dist|build|coverage|vendor|archives?)(?:[\/\\]|$)|\.(?:pem|key|p12|pfx|sqlite|db|sql|zip|docm|xlsm)$/i.test(p);
export function safeSvg(svg) {
  if (svg.length > 2_000_000 || !/<svg\b/i.test(svg) || /<!DOCTYPE|<!ENTITY|<\s*(?:script|foreignObject|image|use|style|filter|animate|set)\b|\bon\w+\s*=|(?:href|src)\s*=|url\s*\(/i.test(svg)) throw new SuiteError('SVG contains disallowed active, raster, external or complex content', 5);
  return svg;
}
export function safeLink(value) {
  const u = new URL(value);
  if (!['https:', 'mailto:', 'tel:'].includes(u.protocol) || u.username || u.password || /token|secret|key|password/i.test(u.search)) throw new SuiteError('Unsafe or credential-bearing link', 5);
  return value;
}
export function publicIP(ip) {
  if (net.isIP(ip) === 4) {
    const [a,b] = ip.split('.').map(Number);
    return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a===169&&b===254) || (a===172&&b>=16&&b<=31) || (a===192&&b===168) || (a===100&&b>=64&&b<=127) || (a===198&&(b===18||b===19)) || (a===192&&b===0));
  }
  if (net.isIP(ip) === 6) return !/^(?:::|fc|fd|fe8|fe9|fea|feb|ff)/i.test(ip);
  return false;
}
export async function publicUrl(value) {
  const u = new URL(value); safeLink(value);
  if (u.protocol !== 'https:' || u.port && u.port !== '443') throw new SuiteError('Crawler requires HTTPS on port 443', 5);
  const addresses = await dns.lookup(u.hostname, {all:true});
  if (!addresses.length || addresses.some(x => !publicIP(x.address))) throw new SuiteError('Crawler destination is not public', 5);
  return {url:u, addresses};
}
export function inventory(root, budget = 3000) {
  const files = [], exclusions = [], base = fs.realpathSync(root);
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, {withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))) {
      if (files.length + exclusions.length >= budget) throw new SuiteError('Inventory budget exceeded; narrow target scope', 2);
      const p = path.join(dir, entry.name), rel = path.relative(base, p).replaceAll('\\','/');
      if (entry.isSymbolicLink() || denied(rel)) { exclusions.push({path:rel, reason:'default-deny private/generated/archive/link location'}); continue; }
      if (entry.isDirectory()) { walk(p); continue; }
      const stat = fs.statSync(p);
      if (stat.size > 1_000_000) { exclusions.push({path:rel, reason:'over 1 MiB; explicit scoped review needed'}); continue; }
      if (!/\.(?:md|txt|json|css|scss|html|svg|tsx?|jsx?|py|ya?ml|toml)$/i.test(rel)) { exclusions.push({path:rel, reason:'binary/unsupported; explicit asset review needed'}); continue; }
      files.push({path:rel, sha256:fileHash(p), bytes:stat.size, depth:'INVENTORIED_ONLY', claims:[]});
    }
  }
  walk(base);
  return {schema_version:'1.0', files, exclusions, unresolved:files.map(x=>x.path), caveat:'Inventory is not semantic review. Host must trace relevant claims and supply reviewed coverage.'};
}
export function decimal(value, precision = 2) {
  if (typeof value !== 'string' || !/^-?\d+(?:\.\d+)?$/.test(value)) throw new SuiteError('Amounts must be decimal strings');
  const negative = value.startsWith('-'), [whole, fraction=''] = value.replace('-','').split('.');
  const digits = (fraction + '0'.repeat(precision + 1));
  let result = BigInt(whole) * 10n ** BigInt(precision) + BigInt(digits.slice(0,precision) || '0');
  if (Number(digits[precision]) >= 5) result++;
  return negative ? -result : result;
}
export function amount(units, precision=2) {
  const sign = units < 0n ? '-' : ''; const n = units < 0n ? -units : units;
  return precision ? `${sign}${n / 10n**BigInt(precision)}.${String(n % 10n**BigInt(precision)).padStart(precision,'0')}` : sign+String(n);
}
export function contrast(a,b) {
  const luminance=hex=>{const channels=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(c=>c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4);return channels[0]*0.2126+channels[1]*0.7152+channels[2]*0.0722;};
  const x=luminance(a),y=luminance(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);
}
export function resolve(text, fields) {
  const unresolved = [];
  const result = text.replace(/\{\{([a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+)\}\}/g, (token, key) => {
    const field = fields[key];
    if (!field || field.value === null || ['UNKNOWN','CONFLICTED'].includes(field.status)) { unresolved.push(key); return `[REQUIRED: ${key}]`; }
    return String(field.value);
  });
  return {text:result, unresolved};
}
