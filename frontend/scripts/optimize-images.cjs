const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const distImagesDir = path.join(__dirname, '..', 'dist', 'images');

async function optimizeFile(filePath) {
  try {
    if (filePath.includes('-optimized.webp')) return;
    const { size } = fs.statSync(filePath);
    if (size < 100 * 1024) return;

    const image = sharp(filePath);
    const metadata = await image.metadata();

    const maxWidth = 1920;
    const quality = 80;

    let pipeline = image;
    if (metadata.width && metadata.width > maxWidth) {
      pipeline = pipeline.resize({ width: maxWidth });
    }

    let buffer;
    if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
      buffer = await pipeline.jpeg({ quality }).toBuffer();
    } else if (metadata.format === 'png') {
      buffer = await pipeline.png({ quality }).toBuffer();
    } else if (metadata.format === 'webp') {
      buffer = await pipeline.webp({ quality }).toBuffer();
    } else {
      buffer = await pipeline.jpeg({ quality }).toBuffer();
    }

    fs.writeFileSync(filePath, buffer);
    console.log('Optimized:', path.relative(process.cwd(), filePath));
  } catch (err) {
    console.warn('Failed to optimize', filePath, err.message);
  }
}

async function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const p = path.join(dir, item);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) await walk(p);
    else {
      const ext = path.extname(p).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        await optimizeFile(p);
      }
    }
  }
}

(async () => {
  console.log('Optimizing images in', distImagesDir);
  try {
    await walk(distImagesDir);
    console.log('Image optimization complete');
  } catch (err) {
    console.error('Image optimization failed:', err);
    process.exitCode = 1;
  }
})();
