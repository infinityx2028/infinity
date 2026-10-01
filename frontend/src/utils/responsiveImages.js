import manifest from "../data/responsiveImages.json";
import { getImageSrc } from "./imageUtils";

export function responsiveImage(
  source,
  sizes = "(max-width: 767px) 160px, 300px",
) {
  const variants = manifest[source];
  if (!variants) return { src: getImageSrc(source) };
  const available = Object.values(variants).sort((a, b) => a.width - b.width);
  const large =
    available.find((variant) => variant.width >= 768) ||
    available[available.length - 1];
  return {
    src: large.src,
    srcSet: available
      .map((variant) => `${variant.src} ${variant.width}w`)
      .join(", "),
    sizes,
  };
}
