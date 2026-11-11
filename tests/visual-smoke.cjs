/* Run: PLAYWRIGHT_MODULE=/absolute/path/to/playwright-core node tests/visual-smoke.cjs */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const path=require('node:path');
const fs=require('node:fs');
const {pathToFileURL}=require('node:url');
const out=path.resolve(__dirname,'../review');
fs.mkdirSync(out,{recursive:true});
const results=[];
function check(name,pass,detail=''){results.push({name,pass,detail});if(!pass) console.error('FAIL',name,detail);else console.log('PASS',name,detail);}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium-browser',args:['--no-sandbox','--disable-dev-shm-usage','--allow-file-access-from-files']});
 const uri=pathToFileURL(path.resolve(__dirname,'../index.html')).href;
 for(const width of [360,390,768,1024,1440]){
  const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1,reducedMotion:'reduce'});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(uri,{waitUntil:'domcontentloaded',timeout:30000});
  await page.evaluate(async()=>{for(const im of document.images){im.loading='eager';try{await im.decode()}catch{}}});
  await page.evaluate(()=>document.fonts.ready);
  const metrics=await page.evaluate(()=>({
   width:window.innerWidth,scroll:document.documentElement.scrollWidth,bodyScroll:document.body.scrollWidth,
   heights:[...document.querySelectorAll('section')].map(s=>({id:s.id||'hero',h:s.getBoundingClientRect().height})),
   broken:[...document.images].filter(img=>!img.naturalWidth).map(img=>img.getAttribute('src')),
   emptyLinks:[...document.querySelectorAll('a[href]')].filter(a=>a.getAttribute('href')==='#').length,
   main:document.querySelectorAll('main').length,h1:document.querySelectorAll('h1').length
  }));
  check('no horizontal overflow '+width,metrics.scroll<=width+1,JSON.stringify({scroll:metrics.scroll,bodyScroll:metrics.bodyScroll}));
  check('all images load '+width,metrics.broken.length===0,metrics.broken.join(','));
  check('no JS exceptions '+width,errors.length===0,errors.join(' | '));
  if(width===1440||width===390){
   await page.screenshot({path:path.join(out,width===1440?'desktop-full.png':'mobile-full.png'),fullPage:true,animations:'disabled'});
   await page.screenshot({path:path.join(out,width===1440?'desktop-hero.png':'mobile-hero.png'),fullPage:false,animations:'disabled'});
  }
  if(width===390){
   const menu=page.locator('[data-menu-toggle]');
   await menu.click();
   check('mobile menu expands',(await menu.getAttribute('aria-expanded'))==='true');
   await page.locator('#primary-nav a[href="#portfolio"]').click();
   check('mobile menu collapses',(await menu.getAttribute('aria-expanded'))==='false');
  }
  if(width===1440){
   const portrait=page.locator('[data-filter=portrait]');
   await portrait.click();
   const visible=await page.locator('.portfolio-shot:not([hidden])').count();
   check('portrait filter',visible===2,'visible='+visible);
   await page.locator('[data-filter=all]').click();
   check('reset portfolio filter',(await page.locator('.portfolio-shot:not([hidden])').count())===6);
   check('duration hidden until rent chosen',await page.locator('#booking-duration').locator('..').isHidden());
   await page.locator('[data-preselect=rent]').click();
   check('rental preselect',await page.locator('#booking-format').inputValue()==='rent');
   check('duration enabled',await page.locator('#booking-duration').isEnabled());
   await page.locator('#booking-duration').selectOption('60');
   await page.locator('#booking-name').fill('Тест');
   await page.locator('#booking-date').fill('2026-11-20');
   await page.evaluate(()=>{window.__captured='';document.addEventListener('click',(event)=>{const a=event.target.closest('a[href^="https://wa.me/"]');if(a){window.__captured=a.href;event.preventDefault();}},true)});
   await page.locator('.button-submit').click();
   const capture=await page.evaluate(()=>window.__captured);
   check('WhatsApp inquiry opens',capture.includes('wa.me/79520678015')&&decodeURIComponent(capture).includes('60 минут'),capture.slice(0,90));
  }
  if(width===1440)console.log('SECTION HEIGHTS',JSON.stringify(metrics.heights));
  await context.close();
 }
 await browser.close();
 const failures=results.filter(x=>!x.pass);
 fs.writeFileSync(path.join(out,'smoke-results.json'),JSON.stringify({results,failures},null,2));
 console.log('SUMMARY:',results.length+' checks, '+failures.length+' failures');
 process.exitCode=failures.length?1:0;
})().catch(error=>{console.error(error);process.exitCode=1;});