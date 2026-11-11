/* Visual+interaction QA for SIRIUS DARK EDITORIAL. 1600 px section fidelity and responsive smoke. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const path=require('node:path'),fs=require('node:fs');
const {pathToFileURL}=require('node:url');
const outputDir=path.resolve(__dirname,'../review/fidelity');
fs.mkdirSync(outputDir,{recursive:true});
const checks=[];
function check(name,ok,detail=''){checks.push({name,ok,detail});console.log(ok?'PASS':'FAIL',name,detail);if(!ok)process.exitCode=1;}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--allow-file-access-from-files']});
 const url=pathToFileURL(path.resolve(__dirname,'../index.html')).href;
 for(const width of [320,360,390,768,1024,1440,1600]){
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
   const page=await context.newPage();
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.goto(url,{waitUntil:'domcontentloaded'});
   await page.evaluate(async()=>{for(const im of document.images){im.loading='eager';try{await im.decode()}catch{}}});
   const m=await page.evaluate(()=>({
     width:window.innerWidth,scroll:document.documentElement.scrollWidth,
     errors:document.querySelectorAll('img:not([alt])').length,
     broken:[...document.images].filter(x=>!x.naturalWidth).map(x=>x.src),
     sections:document.querySelectorAll('main section.page-section').length,
     headers:document.querySelectorAll('body>header.site-header').length,
     h1:document.querySelectorAll('h1').length
   }));
   check('No horizontal overflow '+width,m.scroll<=width+1,'scroll='+m.scroll);
   check('No JS exceptions '+width,errors.length===0,errors.slice(0,3).join(';'));
   check('All images decoded '+width,m.broken.length===0,m.broken.join(','));
   if(width===1600){
     check('Single global header',m.headers===1);
     check('Six DOM sections',m.sections===6);
     check('Only one H1',m.h1===1);
     check('All inline images have alt',m.errors===0);
     const sz=await page.evaluate(()=>Object.fromEntries([...document.querySelectorAll('main section.page-section')].map(s=>[s.id,Math.round(s.getBoundingClientRect().height)])));
     console.log('SECTION HEIGHTS',JSON.stringify(sz));
     const targets={top:900,services:1016,studio:900,portfolio:1011,booking:1033,contacts:1012};
     for(const [id,height] of Object.entries(targets))check('1600 section '+id,Math.abs(sz[id]-height)<40,'actual '+sz[id]+' target '+height);
     const c=await page.evaluate(()=>{
       const cards=[...document.querySelectorAll('.service-grid>*')].map(x=>Math.round(x.getBoundingClientRect().width));
       const grid=getComputedStyle(document.querySelector('.port-grid')).gridTemplateColumns;
       return {cards,grid,form:grid.split(' ').length};
     });
     check('3 original service cards',c.cards.length===3&&c.cards[2]<c.cards[0]&&c.cards[0]===c.cards[1],JSON.stringify(c.cards));
     check('Original makeup and certificate links remain',await page.locator('.service-addons a[href*="vk.ru/market/product/"]').count()===2);
     check('Extended original work gallery accessible via VK',await page.locator('.portfolio-more[href*="vk.com/siriusstudio"]').count()===1);
     check('4-column portfolio mosaic',c.form===4,c.grid);
     check('True map iframe',await page.locator('.contact-map iframe[src*="yandex.ru"]').count()===1);
     check('No full-screen static hero bitmap',await page.locator('.hero h1').count()===1&&await page.locator('.hero .hero-model img').count()===1);
     const buttons=page.locator('.portfolio-filters button');
     await buttons.filter({hasText:'Движение'}).click();
     check('Filter only real movement photos',await page.locator('.port-photo:not([hidden])').count()===2);
     check('Filtered mosaic reflows',await page.locator('.port-grid').evaluate(x=>x.classList.contains('is-filtered')));
     await buttons.filter({hasText:'Все кадры'}).click();
     check('Portfolio reset',await page.locator('.port-photo:not([hidden])').count()===6);
     const opener=page.locator('.photo-open').first();
     await opener.click();
     check('Native photo lightbox opens',await page.locator('#gallery-dialog').evaluate(x=>x.open));
     const before=await page.locator('[data-lightbox-image]').getAttribute('src');
     await page.keyboard.press('ArrowRight');
     const after=await page.locator('[data-lightbox-image]').getAttribute('src');
     check('Lightbox ArrowRight changes photo',before!==after);
     await page.keyboard.press('Escape');
     check('Lightbox Esc closes',!await page.locator('#gallery-dialog').evaluate(x=>x.open));
     check('Restores opener keyboard focus',await opener.evaluate(x=>document.activeElement===x));
     await page.locator('#form-name').fill('Тестовый посетитель');
     await page.locator('#form-phone').fill('123');
     await page.locator('#form-format').selectOption('rent60');
     await page.locator('.form-submit').click();
     check('Invalid phone blocked',await page.locator('#form-phone').evaluate(x=>!x.validity.valid));
     await page.locator('#form-phone').fill('+7 (999) 123-45-67');
     await page.locator('#form-date').fill('2026-11-20');
     await page.evaluate(()=>{
       window.__WA='';
       document.addEventListener('click',event=>{
         const a=event.target.closest('a[href^="https://wa.me/"]');
         if(a){window.__WA=a.href;event.preventDefault();}
       },true);
     });
     await page.locator('.form-submit').click();
     const wa=await page.evaluate(()=>window.__WA);
     check('Actual WhatsApp message prepared',wa.includes('wa.me/79520678015')&&decodeURIComponent(wa).includes('Тестовый посетитель')&&decodeURIComponent(wa).includes('60 минут'));
     check('Accessible fallback link',await page.locator('[data-form-result] a[href^="https://wa.me/"]').count()===1);
   }
   if(width===390){
     const toggle=page.locator('[data-menu-toggle]');
     await toggle.click();
     check('Mobile menu expands',await toggle.getAttribute('aria-expanded')==='true');
     await page.locator('.site-nav a[href="#portfolio"]').click();
     check('Mobile anchor closes menu',await toggle.getAttribute('aria-expanded')==='false');
     await page.locator('[data-menu-toggle]').click();await page.keyboard.press('Escape');
     check('Escape closes mobile menu',await toggle.getAttribute('aria-expanded')==='false');
   }
   if(width===390||width===1600){
     const axePath=path.resolve(__dirname,'../.audit-deps/node_modules/axe-core/axe.min.js');
     if(fs.existsSync(axePath)){
       await page.addScriptTag({path:axePath});
       const violations=await page.evaluate(async()=>{
         const result=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});
         return result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({targets:n.target,summary:n.failureSummary})).slice(0,8)}));
       });
       fs.writeFileSync(path.join(outputDir,'axe-'+width+'.json'),JSON.stringify(violations,null,2));
       check('WCAG 2/2.1 A/AA axe '+width,violations.length===0,JSON.stringify(violations).slice(0,1500));
     }
   }
   await context.close();
 }
 await browser.close();
 fs.writeFileSync(path.join(outputDir,'smoke-results.json'),JSON.stringify(checks,null,2));
 console.log('SUMMARY',checks.length,'total',checks.filter(c=>!c.ok).length,'failed');
})().catch(e=>{console.error(e);process.exitCode=1});
