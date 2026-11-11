import { test, expect } from '@playwright/test';
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4173';
for(const [name,width,height] of [['Mobile',390,844],['Tablet',768,1024],['Desktop',1440,900]]){
 test('Visual and functional smoke: '+name,async({page})=>{
   await page.setViewportSize({width,height});
   await page.goto(BASE_URL,{waitUntil:'networkidle'});
   await expect(page.getByRole('heading',{name:'LOVE. LAUGHTER. STRENGTH.'})).toBeVisible();
   await page.locator('#van-life').scrollIntoViewIfNeeded();
   const van=page.locator('#van-life .black-van-asset');
   await expect(van).toBeVisible();
   await expect.poll(()=>van.evaluate(img=>img.complete && img.naturalWidth>0)).toBe(true);
   await expect(page.locator('#book-dom select[name="service"]')).toContainText('Bike Fixing Services');
   await expect(page.locator('.brand-marquee')).toContainText('Bike Fixing Services');
   await expect(page.getByRole('link',{name:'Privacy'})).toHaveAttribute('href','/privacy.html');
   await expect(page.getByRole('link',{name:'Service Notes'})).toHaveAttribute('href','/terms.html');
   const missing=await page.locator('img').evaluateAll(imgs=>imgs.filter(img=>img.getAttribute('src') && img.complete && !img.naturalWidth).map(img=>img.getAttribute('src')));
   expect(missing).toEqual([]);
 });
}
test('Marquee respects reduced motion',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(BASE_URL,{waitUntil:'networkidle'});
 const animation=await page.locator('.brand-marquee .strip-track').evaluate(el=>getComputedStyle(el).animationName);
 expect(animation).toBe('none');
});
