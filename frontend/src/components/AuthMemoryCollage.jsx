import { responsiveImage } from "../utils/responsiveImages";
const IMAGES = [
  ["/images/4 x 6 black frame 199.jpg", "Personalized photo frame"],
  ["/images/MAG design2.jpg", "Personalized memory magazine"],
  ["/images/mag 12pgs 599.jpg", "Birthday magazine"],
];
export default function AuthMemoryCollage({ compact = false }) {
  return (
    <div
      className={`motion-auth-collage ${compact ? "is-compact" : ""}`}
      aria-label="Personalized keepsakes from the Infinity studio"
    >
      {IMAGES.map(([source, alt], index) => (
        <div key={source} style={{ "--photo-index": index }}>
          <img
            {...responsiveImage(source, "(max-width: 767px) 110px, 250px")}
            alt={alt}
            decoding="async"
          />
        </div>
      ))}
    </div>
  );
}
