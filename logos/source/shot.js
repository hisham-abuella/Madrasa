// Screenshot a page (scrolls first so [data-reveal] cards show), report overflow + console errors.
//   node logos/source/shot.js file://$PWD/logos/index.html out.png 1280 900 1   (last arg 1 = full page)
const {chromium}=require(process.env.HOME+'/.kp-tools/node_modules/playwright');
(async()=>{const [,,url,out,w,h,full]=process.argv;const b=await chromium.launch();const p=await b.newPage({viewport:{width:+w,height:+h}});
const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(String(e)));
await p.goto(url);await p.waitForTimeout(800);for(let y=0;y<30000;y+=500){await p.evaluate(v=>scrollTo(0,v),y);await p.waitForTimeout(60);}await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(900);await p.screenshot({path:out,fullPage:full==='1'});
const ov=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);console.log('overflow',ov,'errors',errs);await b.close();})()
