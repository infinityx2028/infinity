import manifest from '../data/responsiveImages.json';
import { getImageSrc } from './imageUtils';

export function responsiveImage(source, sizes = '(max-width: 767px) 160px, 300px') {
  const variants = manifest[source];
  if (!variants) return { src: getImageSrc(source) };
  const small = variants[360];
  const large = variants[720];
  return {
    src: large.src,
    srcSet: small.width === large.width ? undefined : `${small.src} ${small.width}w, ${large.src} ${large.width}w`,
    sizes,
  };
}
