// Run manually when catalog imagery changes; generated files ship with the app.
const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");
const { createHash } = require("node:crypto");
sharp.cache(false);
async function main() {
  const root = path.resolve(__dirname, "..");
  const response = await fetch(
    "https://i.infinitycustomizationz.com/api/products",
  );
  if (!response.ok) throw new Error("Catalog unavailable");
  const products = await response.json();
  const sources = [
    ...new Set(
      products
        .flatMap((product) =>
          product.images?.length ? product.images : [product.image],
        )
        .filter((src) => src?.startsWith("/images/")),
    ),
  ];
  const manifest = {};
  const output = path.join(root, "public", "images", "responsive");
  await fs.mkdir(output, { recursive: true });
  for (const source of sources) {
    const absolute = path.resolve(root, "public", "." + source);
    if (!absolute.startsWith(path.join(root, "public", "images") + path.sep))
      throw new Error("Image outside catalog directory");
    const slug = path
      .basename(source)
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .toLowerCase();
    const input = await fs.readFile(absolute);
    const hash = createHash("sha256").update(input).digest("hex").slice(0, 8);
    const variants = {};
    let previousWidth = 0;
    for (const width of [320, 480, 768, 1024, 1200, 1600]) {
      const filename = `${slug}-${hash}-${width}.webp`;
      const metadata = await sharp(input)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(path.join(output, filename));
      if (metadata.width === previousWidth) {
        await fs.unlink(path.join(output, filename));
        break;
      }
      variants[width] = {
        src: `/images/responsive/${filename}`,
        width: metadata.width,
      };
      previousWidth = metadata.width;
    }
    manifest[source] = variants;
  }
  await fs.writeFile(
    path.join(root, "src", "data", "responsiveImages.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  const used = new Set(
    Object.values(manifest).flatMap((variants) =>
      Object.values(variants).map((variant) => path.basename(variant.src)),
    ),
  );
  // This directory exclusively contains generated responsive catalog assets.
  for (const filename of await fs.readdir(output)) {
    const target = path.resolve(output, filename);
    if (!target.startsWith(output + path.sep))
      throw new Error("Unsafe generated asset path");
    if (filename.endsWith(".webp") && !used.has(filename))
      await fs.unlink(target);
  }
  console.log(
    `Generated responsive images for ${sources.length} real catalog assets.`,
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
