const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const path=require('node:path'),fs=require('node:fs');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--allow-file-access-from-files','--disable-dev-shm-usage']});
 const dir=path.resolve(__dirname,'../review/fidelity');
 fs.mkdirSync(dir,{recursive:true});
 const sections=[
  ['top','01_hero',901],
  ['services','02_services',1016],
  ['studio','03_studio',901],
  ['portfolio','04_portfolio',1011],
  ['booking','05_booking',1033],
  ['contacts','06_contacts',1012]
 ];
 const page=await browser.newPage({viewport:{width:1600,height:901},deviceScaleFactor:1,reducedMotion:'reduce'});
 const fileUrl=pathToFileURL(path.resolve(__dirname,'../index.html')).href;
 await page.goto(fileUrl,{waitUntil:'domcontentloaded'});
 await page.evaluate(async()=>{document.documentElement.style.scrollBehavior='auto'; for(const image of document.images){image.loading='eager';try{await image.decode()}catch{}} await document.fonts.ready;});
 const fullHeight=await page.evaluate(()=>document.documentElement.scrollHeight);
 console.log('PAGE HEIGHT',fullHeight);
 for(const [id,name,height] of sections){
  await page.setViewportSize({width:1600,height});
  const metrics=await page.evaluate(id=>{
    const s=document.querySelector('section#'+id);
    const r=s.getBoundingClientRect(); const sr=window.scrollY;
    return {top:r.top+sr,height:r.height,width:r.width};
  },id);
  await page.evaluate(top=>window.scrollTo({top,behavior:'instant'}),metrics.top);
  await page.waitForTimeout(150);
  await page.screenshot({path:path.join(dir,name+'.png'),fullPage:false,animations:'disabled'});
  console.log(name,JSON.stringify(metrics));
 }
 await page.setViewportSize({width:1600,height:900});
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
 await page.screenshot({path:path.join(dir,'desktop-full.png'),fullPage:true,animations:'disabled'});
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
 await page.waitForTimeout(180);
 await page.screenshot({path:path.join(dir,'mobile-hero.png'),fullPage:false,animations:'disabled'});
 await page.screenshot({path:path.join(dir,'mobile-full.png'),fullPage:true,animations:'disabled'});
 await browser.close();
})().catch(err=>{console.error(err);process.exitCode=1});
