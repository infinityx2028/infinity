// Centralized WhatsApp Utility for Infinity Customizations
// Uses existing business phone number: +91 89859 93948 (918985993948)

export const WHATSAPP_PHONE = '918985993948';
export const WHATSAPP_DISPLAY_PHONE = '+91 89859 93948';

/**
 * Builds a direct wa.me link with a pre-encoded message
 */
export const getWhatsAppUrl = (message = '') => {
  if (!message) return `https://wa.me/${WHATSAPP_PHONE}`;
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message.trim())}`;
};

/**
 * Builds prefilled message for Order Success page
 * Prefill structure:
 * Hi Infinity Customizations 👋
 * I've placed order #REAL_REFERENCE.
 * 
 * Product(s):
 * REAL ORDER PRODUCTS
 * 
 * I'm sending my personalization photos/details here.
 */
export const buildOrderSuccessWhatsAppMessage = ({ orderReference, items = [] }) => {
  const ref = orderReference || 'ORDER';
  let productsSummary = '';

  if (Array.isArray(items) && items.length > 0) {
    productsSummary = items
      .map(item => {
        const name = item.productName || item.name || 'Personalized Gift';
        const qty = item.quantity || 1;
        const details = item.customizationDetails ? ` (${item.customizationDetails})` : '';
        return `• ${name} x${qty}${details}`;
      })
      .join('\n');
  } else {
    productsSummary = '• Personalized Keepsake';
  }

  return `Hi Infinity Customizations 👋
I've placed order #${ref}.

Product(s):
${productsSummary}

I'm sending my personalization photos/details here.`;
};

/**
 * Builds prefilled message for Product Page inquiries / personalization
 * Example structure:
 * Hi Infinity Customizations 👋
 * 
 * I'd like to send my photos/details for my personalized order.
 * 
 * Product: PRODUCT_NAME
 * Quantity: QUANTITY
 * 
 * I will attach the photos here.
 */
export const buildProductPersonalizationWhatsAppMessage = ({ productName, quantity = 1, options = '' }) => {
  const name = productName || 'Custom Keepsake';
  const qty = quantity || 1;
  const optLine = options ? `\nOptions: ${options}` : '';

  return `Hi Infinity Customizations 👋

I'd like to send my photos/details for my personalized order.

Product: ${name}
Quantity: ${qty}${optLine}

I will attach the photos here.`;
};
