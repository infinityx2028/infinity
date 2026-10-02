import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Eye } from "lucide-react";
import { useQuickView } from "../contexts/useQuickView";
import { responsiveImage } from "../utils/responsiveImages";
import { useAuth } from "../contexts/useAuth";

export default function ProductCard({ product, showCategory = true }) {
  const { openQuickView } = useQuickView();
  const { wishlist, wishlistBusy, toggleSavedGift } = useAuth();
  const [saveError, setSaveError] = useState("");
  const [imageError, setImageError] = useState(false);
  if (!product) return null;
  const id = product._id || product.id;
  const price = Number(product.price || 0);
  const saved = wishlist.includes(id);
  const discount = Number(product.originalPrice) > price;
  async function save(event) {
    event.preventDefault();
    event.stopPropagation();
    setSaveError("");
    try {
      await toggleSavedGift(id);
    } catch {
      setSaveError("Could not save this gift. Please try again.");
    }
  }
  return (
    <article className="studio-product-card">
      <Link
        to={`/product/${id}`}
        className="product-card-link"
        data-cursor="VIEW"
      >
        <div className="product-card-image">
          {!imageError ? (
            <img
              {...responsiveImage(
                product.images?.[0] || product.image,
                "(max-width: 767px) 44vw, (max-width: 1100px) 30vw, 300px",
              )}
              alt={product.name}
              loading="lazy"
              decoding="async"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="product-image-fallback">{product.name}</span>
          )}
          {product.isBestSeller === true && (
            <span className="product-card-badge">BEST SELLER</span>
          )}
        </div>
        <div className="product-card-information">
          {showCategory && (
            <span className="product-card-category">{product.categoryId}</span>
          )}
          <h3>{product.name}</h3>
          <div className="product-card-price">
            <small>FROM</small>
            <strong>₹{price.toLocaleString("en-IN")}</strong>
            {discount && (
              <del>
                ₹{Number(product.originalPrice).toLocaleString("en-IN")}
              </del>
            )}
          </div>
        </div>
      </Link>
      <button
        type="button"
        className="product-card-save"
        onClick={save}
        aria-label="Save to Wishlist"
        aria-pressed={saved}
        disabled={wishlistBusy}
      >
        <Heart size={16} fill={saved ? "currentColor" : "none"} />
      </button>
      <button
        type="button"
        className="product-card-quickview"
        aria-label={`Quick view ${product.name}`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          openQuickView(product);
        }}
      >
        <Eye size={16} />
        <span>Quick View</span>
      </button>
      {saveError && (
        <span className="product-card-error" role="status">
          {saveError}
        </span>
      )}
    </article>
  );
}
