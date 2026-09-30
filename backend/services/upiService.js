// UPI Payment Service
// Verified Primary PhonePe UPI ID: 8019212948@axl
// Registered Payee Name: SINGIREDDY JASHWANTH
// Registered PhonePe parameters: mc=0000, mode=02, purpose=00
// Alternate Verified UPI ID: 8985993948@ybl (Business Phone: 8985993948)

const MERCHANT_UPI_ID = "8019212948@axl";
const MERCHANT_NAME = "SINGIREDDY JASHWANTH";
const ALT_MERCHANT_UPI_ID = "8985993948@ybl";
const MERCHANT_PHONE = "8985993948";

const generateOrderId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INF-${timestamp}-${random}`;
};

const generateUpiDeepLink = (orderId, amount) => {
  const numAmount = Number(amount);
  const formattedAmount = Number.isFinite(numAmount) ? numAmount.toFixed(2) : String(amount);
  const cleanUpiId = MERCHANT_UPI_ID.trim();
  const cleanOrderId = String(orderId || '').replace(/[^a-zA-Z0-9]/g, '');
  const encodedName = encodeURIComponent(MERCHANT_NAME.trim());

  // Compliant NPCI URI matching verified PhonePe merchant QR parameters:
  let link = `upi://pay?pa=${cleanUpiId}&pn=${encodedName}&mc=0000&mode=02&purpose=00&am=${formattedAmount}&cu=INR`;
  if (cleanOrderId) {
    link += `&tn=${cleanOrderId}`;
  }
  return link;
};

const generateQRCodeData = (upiDeepLink) => {
  return upiDeepLink;
};

module.exports = {
  MERCHANT_UPI_ID,
  MERCHANT_NAME,
  ALT_MERCHANT_UPI_ID,
  MERCHANT_PHONE,
  generateOrderId,
  generateUpiDeepLink,
  generateQRCodeData
};
