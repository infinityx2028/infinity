// Run manually when catalog imagery changes; generated files ship with the app.
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
async function main() {
  const root = path.resolve(__dirname, '..');
  const response = await fetch('https://i.infinitycustomizationz.com/api/products');
  if (!response.ok) throw new Error('Catalog unavailable');
  const products = await response.json();
  const sources = [...new Set(products.map(product => product.images?.[0] || product.image).filter(src => src?.startsWith('/images/')))];
  const manifest = {};
  const output = path.join(root, 'public', 'images', 'responsive');
  await fs.mkdir(output, { recursive: true });
  for (const source of sources) {
    const absolute = path.resolve(root, 'public', '.' + source);
    if (!absolute.startsWith(path.join(root, 'public', 'images') + path.sep)) throw new Error('Image outside catalog directory');
    const slug = path.basename(source).replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
    const variants = {};
    for (const width of [360, 720]) {
      const filename = `${slug}-${width}.webp`;
      await sharp(absolute).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(output, filename));
      const metadata = await sharp(path.join(output, filename)).metadata();
      variants[width] = { src: `/images/responsive/${filename}`, width: metadata.width };
    }
    manifest[source] = variants;
  }
  await fs.writeFile(path.join(root, 'src', 'data', 'responsiveImages.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Generated responsive images for ${sources.length} real catalog assets.`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
