// UPI Payment Service
// Merchant UPI ID: Q489570312@ybl

const MERCHANT_UPI_ID = "Q489570312@ybl";
const MERCHANT_NAME = "Infinity Customizations";

const generateOrderId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INF-${timestamp}-${random}`;
};

const generateUpiDeepLink = (orderId, amount) => {
  const numAmount = Number(amount);
  const formattedAmount = Number.isFinite(numAmount) ? numAmount.toFixed(2) : String(amount);
  const cleanUpiId = MERCHANT_UPI_ID.trim();
  const cleanOrderId = String(orderId || '').trim();
  const cleanNote = `Order-${cleanOrderId}`.replace(/[^a-zA-Z0-9_-]/g, '');
  const encodedName = encodeURIComponent(MERCHANT_NAME.trim());
  const encodedNote = encodeURIComponent(cleanNote);

  // Standard UPI URI specification for VPA (P2P/VPA intent):
  // Omit 'tr' without merchant code to avoid UPI bank rejection ("Technical issue" / "Payment failed")
  return `upi://pay?pa=${cleanUpiId}&pn=${encodedName}&am=${formattedAmount}&cu=INR&tn=${encodedNote}`;
};

const generateQRCodeData = (upiDeepLink) => {
  return upiDeepLink;
};

module.exports = {
  MERCHANT_UPI_ID,
  MERCHANT_NAME,
  generateOrderId,
  generateUpiDeepLink,
  generateQRCodeData
};
