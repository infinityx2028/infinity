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
  const encodedName = encodeURIComponent(MERCHANT_NAME);
  const encodedNote = encodeURIComponent(`Order ${orderId}`);
  const encodedRef = encodeURIComponent(orderId);

  // Standard UPI URI specification:
  // upi://pay?pa=Q489570312@ybl&pn=Infinity%20Customizations&am=1299.00&cu=INR&tn=Order%20INF-...&tr=INF-...
  return `upi://pay?pa=${MERCHANT_UPI_ID}&pn=${encodedName}&am=${formattedAmount}&cu=INR&tn=${encodedNote}&tr=${encodedRef}`;
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

