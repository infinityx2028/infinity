// The original memory is cropped from Infinity's existing white-frame photograph.
// Never alters the original product asset. EXIF is normalized before extraction.
const sharp = require("sharp");
const path = require("node:path");
const root = path.join(__dirname, "..", "public", "images");
async function main() {
  const memories = [
    [
      "memory-core",
      "4 x 6 white frame 199.jpg",
      { left: 2010, top: 2430, width: 970, height: 1530 },
    ],
    [
      "memory-family",
      "4 x 6 p2.jpg",
      { left: 2000, top: 900, width: 820, height: 860 },
    ],
    [
      "memory-celebration",
      "4 x 6 p4.jpg",
      { left: 1950, top: 1670, width: 500, height: 515 },
    ],
  ];
  for (const [name, source, crop] of memories) {
    const photo = await sharp(path.join(root, source))
      .rotate()
      .extract(crop)
      .toBuffer();
    for (const width of [480, 1024]) {
      await sharp(photo)
        .resize({ width })
        .webp({ quality: 85 })
        .toFile(path.join(root, `${name}-${width}.webp`));
      await sharp(photo)
        .resize({ width })
        .avif({ quality: 58 })
        .toFile(path.join(root, `${name}-${width}.avif`));
    }
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
