const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

function createIco(images) {
  const count = images.length;
  const headerSize = 6;
  const entrySize = 16;
  let offset = headerSize + entrySize * count;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = ICO
  header.writeUInt16LE(count, 4); // count of images

  const entries = [];
  for (const img of images) {
    const entry = Buffer.alloc(entrySize);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(img.buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    entries.push(entry);
    offset += img.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...images.map(img => img.buffer)]);
}

async function run() {
  const root = path.join(__dirname, '..');
  const logoPath = path.join(root, 'public/images/logo-trimmed.png');
  const logoMeta = await sharp(logoPath).metadata();
  console.log(`Source logo: ${logoMeta.width}x${logoMeta.height}`);

  async function generateSquareIcon(size, paddingRatio = 0.12) {
    // paddingRatio is total padding on both sides, so content width is size * (1 - paddingRatio)
    const contentWidth = Math.max(1, Math.round(size * (1 - paddingRatio)));
    const contentHeight = Math.max(1, Math.round(contentWidth * (logoMeta.height / logoMeta.width)));

    let pipeline = sharp(logoPath).resize(contentWidth, contentHeight, {
      fit: 'contain',
      kernel: 'lanczos3'
    });

    if (size <= 48) {
      pipeline = pipeline.sharpen({ sigma: 0.5, m1: 0.5, m2: 1.5 });
    }

    const resizedLogo = await pipeline.toBuffer();

    return await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 } // Solid pure white background
      }
    })
    .composite([{
      input: resizedLogo,
      gravity: 'centre'
    }])
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();
  }

  // Generate all sizes
  const p512 = await generateSquareIcon(512, 0.12);
  const p192 = await generateSquareIcon(192, 0.12);
  const p180 = await generateSquareIcon(180, 0.12);
  const p48 = await generateSquareIcon(48, 0.10);
  const p32 = await generateSquareIcon(32, 0.10);
  const p16 = await generateSquareIcon(16, 0.08);

  const icoBuf = createIco([
    { width: 16, height: 16, buffer: p16 },
    { width: 32, height: 32, buffer: p32 },
    { width: 48, height: 48, buffer: p48 }
  ]);

  const targets = [
    { name: 'android-chrome-512x512.png', buf: p512 },
    { name: 'android-chrome-192x192.png', buf: p192 },
    { name: 'apple-touch-icon.png', buf: p180 },
    { name: 'favicon-32x32.png', buf: p32 },
    { name: 'favicon-16x16.png', buf: p16 },
    { name: 'favicon.png', buf: p48 },
    { name: 'favicon.ico', buf: icoBuf }
  ];

  const publicDir = path.join(root, 'public');
  const distDir = path.join(root, 'dist');

  for (const t of targets) {
    fs.writeFileSync(path.join(publicDir, t.name), t.buf);
    console.log(`Saved public/${t.name} (${t.buf.length} bytes)`);
    if (fs.existsSync(distDir)) {
      fs.writeFileSync(path.join(distDir, t.name), t.buf);
    }
  }

  // Copy site.webmanifest to dist as well if dist exists
  if (fs.existsSync(distDir) && fs.existsSync(path.join(publicDir, 'site.webmanifest'))) {
    fs.copyFileSync(path.join(publicDir, 'site.webmanifest'), path.join(distDir, 'site.webmanifest'));
  }

  console.log('Successfully generated all favicons with solid white background!');
}

run().catch(console.error);
