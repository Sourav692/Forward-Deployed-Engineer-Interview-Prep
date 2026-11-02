// Fail when any diagram text crosses its node box or the SVG viewBox (clipping), at desktop and phone widths.
// Authoring prerequisite: PLAYWRIGHT_MODULE points at a playwright installation with Chromium downloaded.
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{const file=path.resolve(process.argv[2],'guide.html');const browser=await chromium.launch();
try{const page=await browser.newPage();const bad=[];
for(const width of [1440,375]){await page.setViewportSize({width,height:900});await page.goto('file://'+file);await page.evaluate(()=>document.fonts.ready);
const found=await page.$$eval('figure svg',svgs=>svgs.flatMap((svg,i)=>{const view=svg.viewBox.baseVal,out=[];
  if(svg.querySelectorAll('text').length!==svg.querySelectorAll('g.diagram-node text').length)out.push(`svg${i}: text outside a measured node group`);
  for(const g of svg.querySelectorAll('g.diagram-node')){const r=g.querySelector('rect').getBBox();
   for(const t of g.querySelectorAll('text')){const b=t.getBBox();
    if(b.x<r.x||b.x+b.width>r.x+r.width||b.y<r.y||b.y+b.height>r.y+r.height||b.x<0||b.x+b.width>view.width)out.push(`svg${i}: "${t.textContent}"`);}}
  return out;}));bad.push(...found.map(x=>`${width}px ${x}`));}
if(bad.length){console.error('FAIL: clipped diagram text\n'+bad.join('\n'));process.exit(1);}
console.log('PASS: every diagram label fits its node and viewBox at 1440px and 375px.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
