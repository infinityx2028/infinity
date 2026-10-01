// The original memory is cropped from Infinity's existing white-frame photograph.
// Never alters the original product asset. EXIF is normalized before extraction.
const sharp = require("sharp");
const path = require("node:path");
const root = path.join(__dirname, "..", "public", "images");
async function main() {
  const photo = await sharp(path.join(root, "4 x 6 white frame 199.jpg"))
    .rotate()
    .extract({ left: 2010, top: 2430, width: 970, height: 1530 })
    .toBuffer();
  for (const width of [480, 1024]) {
    await sharp(photo)
      .resize({ width })
      .webp({ quality: 85 })
      .toFile(path.join(root, `memory-core-${width}.webp`));
    await sharp(photo)
      .resize({ width })
      .avif({ quality: 58 })
      .toFile(path.join(root, `memory-core-${width}.avif`));
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
