/**
 * scripts/image-build.js
 * Converts images in assets/originals/* into generated AVIF/WebP/JPEG variants organized by category.
 * Usage: node scripts/image-build.js
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '..', 'assets', 'originals');
const OUT_DIR = path.join(__dirname, '..', 'assets', 'generated');

const sizes = [1600, 1200, 800, 600];

if (!fs.existsSync(INPUT_DIR)) {
  console.error('No originals directory found at', INPUT_DIR);
  process.exit(0);
}

fs.readdirSync(INPUT_DIR).forEach(file => {
  const inputPath = path.join(INPUT_DIR, file);
  const name = path.parse(file).name;
  sizes.forEach(async (w) => {
    const outBase = path.join(OUT_DIR, name);
    if (!fs.existsSync(outBase)) fs.mkdirSync(outBase, { recursive: true });
    try {
      await sharp(inputPath).resize({ width: w }).avif({ quality: 60 }).toFile(path.join(outBase, `${name}-${w}.avif`));
      await sharp(inputPath).resize({ width: w }).webp({ quality: 70 }).toFile(path.join(outBase, `${name}-${w}.webp`));
      await sharp(inputPath).resize({ width: w }).jpeg({ quality: 80 }).toFile(path.join(outBase, `${name}-${w}.jpg`));
      console.log('generated', name, w);
    } catch (e) {
      console.error('error generating', inputPath, e);
    }
  });
});