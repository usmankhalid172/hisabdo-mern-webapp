const fs=require('fs');
const path=require('path');
const root=process.cwd();
const pages=[];
function walk(dir){ for(const entry of fs.readdirSync(dir,{withFileTypes:true})){ const p=path.join(dir,entry.name); if(entry.isDirectory()){ if(entry.name==='node_modules') continue; walk(p);} else if(entry.isFile() && p.endsWith('.html')) pages.push(p);} }
function strip(html){ return html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' '); }
walk(root);
const results=[];
for(const file of pages){ const rel=path.relative(root,file).replace(/\\/g,'/'); const raw=fs.readFileSync(file,'utf8'); const head=raw.split(/<head[^>]*>/i)[1]||''; const body=raw.split(/<body[^>]*>/i)[1]||''; const bodyText=strip(body).replace(/\s+/g,' ').trim(); const words=bodyText.split(/\s+/).filter(Boolean); const title=(head.match(/<title>([^<]*)<\/title>/i)||['',''])[1].trim(); const desc=(head.match(/<meta\s+name="description"\s+content="([^"]*)"/i)||['',''])[1].trim(); const isBlog=rel.startsWith('blog/'); const hasBy=/\bBy\s+[A-Z][a-z]+/i.test(bodyText); const hasExperience=/experience|worked|years|CEO|founder|author/i.test(bodyText); const sample=bodyText.slice(0,280); const short=words.length<300; const duplicateScore=words.length>0 ? new Set(words.map(w=>w.toLowerCase())).size/words.length : 0; results.push({rel,title,desc,wordCount:words.length,duplicateScore,short,hasBy,hasExperience,isBlog,sample}); }
fs.writeFileSync('page_quality_summary.json',JSON.stringify(results,null,2),'utf8');
console.log('done', results.length);
