// Store Merchant UPI Configuration (Confirmed by store owner)
export const MERCHANT_UPI_ID = "Q489570312@ybl";
export const MERCHANT_NAME = "Infinity Customizations";
export const ALT_MERCHANT_UPI_ID = "8985993948@ybl";
export const MERCHANT_PHONE = "8985993948";

/**
 * Builds clean NPCI standard UPI payment string for QR code generation only.
 * No clickable app links are used to prevent banking switch/browser decline errors.
 */
export const buildUpiQrData = ({ amount, orderId }) => {
  const numAmount = Number(amount);
  const formattedAmount = Number.isFinite(numAmount)
    ? numAmount.toFixed(2)
    : String(amount);
  const cleanUpiId = MERCHANT_UPI_ID.trim();
  const cleanOrderId = String(orderId || "").replace(/[^a-zA-Z0-9]/g, "");
  const encodedName = encodeURIComponent(MERCHANT_NAME.trim());

  // Strict universal NPCI string for QR scanning (no unauthenticated tr/mc/mode parameters)
  let qrString = `upi://pay?pa=${cleanUpiId}&pn=${encodedName}&am=${formattedAmount}&cu=INR`;
  if (cleanOrderId) {
    qrString += `&tn=Order${cleanOrderId}`;
  }
  return qrString;
};
