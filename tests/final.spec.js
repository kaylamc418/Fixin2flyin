import { test, expect } from '@playwright/test';
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4173';
const viewports = [
  ['Mobile 320',320,700],['Mobile 360',360,800],['Mobile 390',390,844],
  ['Mobile 430',430,932],['Tablet 700',700,900],['Tablet 768',768,1024],
  ['Tablet 820',820,900],['Desktop 821',821,900],['Compact nav 1040',1040,900],
  ['Full nav 1041',1041,900],['Desktop 1280',1280,900],['Desktop 1440',1440,900]
];
for (const [label,width,height] of viewports) {
 test('Homepage is usable on '+label, async({page})=>{
   await page.setViewportSize({width,height});
   await page.goto(BASE_URL,{waitUntil:'networkidle'});
   const hero=page.locator('[data-testid="hero-section"]');
   const header=page.locator('[data-testid="site-header"]');
   await expect(header).toBeVisible();
   await expect(hero).toBeVisible();
   await expect(hero.getByRole('heading',{level:1})).toContainText(/built to\s*fix\.\s*ready to\s*fly\./i);
   await expect(hero).toContainText(/bike fixing/i);
   await expect(hero.getByRole('link',{name:'Request a Session'})).toHaveAttribute('href','#book-dom');
   await expect(hero.getByRole('link',{name:'Explore Services'})).toHaveAttribute('href','#services');
   for(const selector of ['#soundtrack','.brand-marquee','#services','#how-it-works','.lifestyle','#van-life','#about','#mama-tribute','#gallery','#book-dom','.prefooter-brand']) {
     await expect(page.locator(selector)).toBeVisible();
   }
   const ordered=await page.evaluate(()=>{
     const order=['.hero','#soundtrack','.brand-marquee','#services','#how-it-works','.lifestyle','#van-life','#about','#mama-tribute','#gallery','#book-dom','.prefooter-brand'];
     const elements=order.map(s=>document.querySelector(s));
     return elements.every(Boolean) && elements.every((node,i)=>i===0 || (elements[i-1].compareDocumentPosition(node)&Node.DOCUMENT_POSITION_FOLLOWING)!==0);
   });
   expect(ordered).toBe(true);
   const noOverflow=await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1);
   expect(noOverflow).toBe(true);
   if(width<=1040){
     const toggle=page.getByRole('button',{name:/open navigation/i});
     await expect(toggle).toBeVisible();
     await toggle.click();
     await expect(header.getByRole('link',{name:'Request a Session'})).toBeVisible();
     await page.keyboard.press('Escape');
     await expect(toggle).toHaveAttribute('aria-expanded','false');
   } else {
     for(const name of ['Services','About Dom','Gallery','Request a Session']){
       await expect(header.getByRole('link',{name,exact:true})).toBeVisible();
     }
   }
   const heroImage=hero.locator('.hero-photo img');
   expect(await heroImage.evaluate(img=>img.complete && img.naturalWidth>0)).toBe(true);
 });
}
