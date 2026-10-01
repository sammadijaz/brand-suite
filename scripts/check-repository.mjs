import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {validate,catalogue,skillRoot} from '../skills/brand-suite/lib/models.mjs';
const skill=fs.readFileSync(path.join(skillRoot,'SKILL.md'),'utf8');
const fields=Object.fromEntries(skill.split('---')[1].trim().split('\n').filter(s=>!s.startsWith(' ')).map(s=>{const i=s.indexOf(':');return [s.slice(0,i),s.slice(i+1).trim()];}));
if(fields.name!=='brand-suite'||fields.description.length>1024||fields.compatibility.length>500||skill.split('\n').length>=500)throw Error('Invalid frontmatter/length');
for(const m of skill.matchAll(/\]\((references\/[^)]+)\)/g))if(!fs.existsSync(path.join(skillRoot,m[1])))throw Error('Missing packaged reference '+m[1]);
validate('catalogue',catalogue);
const sources=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(['node_modules','.git','.work'].includes(e.name))continue;const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(p.endsWith('.mjs'))sources.push(p);}}
walk('skills');walk('scripts');walk('tests');
for(const p of sources){const r=spawnSync(process.execPath,['--check',p],{encoding:'utf8',windowsHide:true});if(r.status!==0)throw Error(r.stderr);}
console.log(JSON.stringify({syntax_files:sources.length,catalogue_slots:catalogue.documents.length,frontmatter:'pass',packaged_references:'pass'}));
