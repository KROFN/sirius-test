const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium-browser',args:['--no-sandbox','--allow-file-access-from-files']});
 const summary=[];
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href,{waitUntil:'domcontentloaded'});
  await page.addScriptTag({path:path.resolve(__dirname,'../.audit-deps/node_modules/axe-core/axe.min.js')});
  const result=await page.evaluate(async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']},rules:{'color-contrast':{enabled:true}}}));
  summary.push({width,passes:result.passes.length,violations:result.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary})).slice(0,14)}))});
  console.log(width,result.violations.length,'violations',JSON.stringify(summary[summary.length-1].violations));
  await page.close();
 }
 await browser.close();
 fs.mkdirSync(path.resolve(__dirname,'../review'),{recursive:true});
 fs.writeFileSync(path.resolve(__dirname,'../review/accessibility-results.json'),JSON.stringify(summary,null,2));
 process.exitCode=summary.some(s=>s.violations.length)?1:0;
})().catch(e=>{console.error(e);process.exitCode=1});