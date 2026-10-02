// Optimize the three user-selected memories without altering their compositions.
// Rukmini in the red saree is the primary memory; originals remain intact.
const sharp = require("sharp");
const path = require("node:path");
const root = path.join(__dirname, "..", "public", "images");
async function main() {
  const memories = [
    ["memory-rukmini", "rukmini-red-saree.png"],
    ["memory-monika", "monika-collage.png"],
    ["memory-yellow-saree", "yellow-saree-collage.png"],
  ];
  for (const [name, source] of memories) {
    const photo = await sharp(path.join(__dirname, "..", "assets", "memories", source))
      .rotate()
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
