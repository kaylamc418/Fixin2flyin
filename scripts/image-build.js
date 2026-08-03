/**
 * scripts/image-build.js
 * Usage: node scripts/image-build.js
 * Converts images in assets/originals/*.{jpg,png} into AVIF/WebP/JPEG responsive files.
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '..', 'assets', 'originals');
const OUT_AVIF = path.join(__dirname, '..', 'assets', 'generated', 'avif');
const OUT_WEBP = path.join(__dirname, '..', 'assets', 'generated', 'webp');
const OUT_JPG = path.join(__dirname, '..', 'assets', 'generated', 'jpg');

[OUT_AVIF, OUT_WEBP, OUT_JPG].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

const sizes = [1600, 1200, 800, 600];

fs.readdirSync(INPUT_DIR).forEach(file => {
  const inputPath = path.join(INPUT_DIR, file);
  const name = path.parse(file).name;
  sizes.forEach(async (w) => {
    const outAvif = path.join(OUT_AVIF, `${name}-${w}.avif`);
    const outWebp = path.join(OUT_WEBP, `${name}-${w}.webp`);
    const outJpg  = path.join(OUT_JPG, `${name}-${w}.jpg`);
    try{
      await sharp(inputPath).resize({ width: w }).avif({ quality: 60 }).toFile(outAvif);
      await sharp(inputPath).resize({ width: w }).webp({ quality: 70 }).toFile(outWebp);
      await sharp(inputPath).resize({ width: w }).jpeg({ quality: 80 }).toFile(outJpg);
      console.log('generated', name, w);
    }catch(e){
      console.error('error generating', inputPath, e);
    }
  });
});
