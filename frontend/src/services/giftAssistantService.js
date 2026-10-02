// Infinity AI — Client & Fallback Recommendation Engine
import { API_BASE_URL } from './api.js';

// --- 1. NATURAL LANGUAGE INTENT EXTRACTION ---
export function extractIntent(query = '') {
  const text = String(query).toLowerCase().trim();

  let budgetMax = null;
  let budgetMin = null;

  // Between ₹X and ₹Y / X to Y
  const rangeMatch = text.match(/(?:between|from)?\s*(?:₹|rs\.?|inr)?\s*(\d{2,5})\s*(?:to|-|and)\s*(?:₹|rs\.?|inr)?\s*(\d{2,5})/i);
  if (rangeMatch) {
    budgetMin = parseInt(rangeMatch[1], 10);
    budgetMax = parseInt(rangeMatch[2], 10);
    if (budgetMin > budgetMax) {
      const temp = budgetMin;
      budgetMin = budgetMax;
      budgetMax = temp;
    }
  } else {
    const underMatch = text.match(/(?:under|below|less than|within|max|maximum|upto|up to)\s*(?:₹|rs\.?|inr)?\s*(\d{2,5})/i) ||
                       text.match(/(?:budget\s*(?:is|of|:)?\s*)(?:₹|rs\.?|inr)?\s*(\d{2,5})/i) ||
                       text.match(/(?:₹|rs\.?)\s*(\d{2,5})/i);
    if (underMatch) {
      budgetMax = parseInt(underMatch[1], 10);
    }
  }

  // Occasions
  let occasion = null;
  if (/birthday|bday|born/i.test(text)) occasion = 'birthday';
  else if (/anniversary|anniv|years together|wedding anniversary/i.test(text)) occasion = 'anniversary';
  else if (/wedding|marriage|bride|groom|shaadi|engagement/i.test(text)) occasion = 'wedding';
  else if (/valentine|romance|romantic|proposal|propose/i.test(text)) occasion = 'valentine';
  else if (/farewell|goodbye|leaving|transfer|retirement/i.test(text)) occasion = 'farewell';
  else if (/friendship|friendship day/i.test(text)) occasion = 'friendship';
  else if (/festival|diwali|rakhi|raksha bandhan|christmas|new year/i.test(text)) occasion = 'festival';
  else if (/thank you|appreciation|grateful/i.test(text)) occasion = 'thank-you';

  // Recipients
  let recipient = null;
  let relationship = null;
  if (/girlfriend|gf|girl friend/i.test(text)) { recipient = 'girlfriend'; relationship = 'romantic'; }
  else if (/boyfriend|bf|boy friend/i.test(text)) { recipient = 'boyfriend'; relationship = 'romantic'; }
  else if (/wife|wifey/i.test(text)) { recipient = 'wife'; relationship = 'romantic'; }
  else if (/husband|hubby/i.test(text)) { recipient = 'husband'; relationship = 'romantic'; }
  else if (/\bpartner\b/i.test(text)) { recipient = 'partner'; relationship = 'romantic'; }
  else if (/parents|mom and dad|mother and father/i.test(text)) { recipient = 'parents'; relationship = 'family'; }
  else if (/\bmom\b|\bmother\b|\bmummy\b|\bmaa\b/i.test(text)) { recipient = 'mother'; relationship = 'family'; }
  else if (/\bdad\b|\bfather\b|\bpapa\b/i.test(text)) { recipient = 'father'; relationship = 'family'; }
  else if (/sister|sis/i.test(text)) { recipient = 'sister'; relationship = 'family'; }
  else if (/brother|bro/i.test(text)) { recipient = 'brother'; relationship = 'family'; }
  else if (/best friend|bestie|bff/i.test(text)) { recipient = 'best-friend'; relationship = 'friend'; }
  else if (/friend|buddy|pal|colleague|classmate|roommate/i.test(text)) { recipient = 'friend'; relationship = 'friend'; }
  else if (/teacher|professor|sir|madam|mentor/i.test(text)) { recipient = 'teacher'; relationship = 'mentor'; }
  else if (/couple|for both/i.test(text)) { recipient = 'couple'; relationship = 'couple'; }

  // Interests / Specific Categories
  const interests = [];
  if (/photo|picture|pictures|image|memories|polaroid/i.test(text)) interests.push('photos');
  if (/bike|motorcycle|rider|riding|bullet|ktm/i.test(text)) interests.push('bikes');
  if (/romantic|love|heart|sweet/i.test(text)) interests.push('romantic');
  if (/magazine|cover|story/i.test(text)) interests.push('magazine');
  if (/t-shirt|tshirt|shirt|apparel|clothes/i.test(text)) interests.push('apparel');
  if (/phone case|phone cover|case|mobile/i.test(text)) interests.push('phone-case');
  if (/hamper|combo|gift box|basket/i.test(text)) interests.push('hamper');
  if (/flower|bouquet|roses/i.test(text)) interests.push('flowers');
  if (/vintage|retro|letter|wax seal/i.test(text)) interests.push('vintage');
  if (/music|song|spotify/i.test(text)) interests.push('music');

  let style = null;
  if (/sentimental|emotional|meaningful|touching/i.test(text)) style = 'sentimental';
  else if (/useful|practical|daily/i.test(text)) style = 'useful';
  else if (/fun|cool|quirky/i.test(text)) style = 'fun';
  else if (/luxury|premium|grand|expensive/i.test(text)) style = 'premium';

  return {
    raw: query,
    budgetMin,
    budgetMax,
    occasion,
    recipient,
    relationship,
    interests,
    style,
    urgency: text.match(/\b(today|tomorrow|urgent|asap|this week)\b/i)?.[0] || null
  };
}

// --- 2. CONCISE EXPLANATION GENERATOR ---
export function generateExplanation(product, intent) {
  const name = product.name || 'Personalized Gift';
  const cat = product.categoryId || '';
  const recipientLabel = intent.recipient ? `your ${intent.recipient.replace('-', ' ')}` : 'them';
  const occasionLabel = intent.occasion ? `${intent.occasion}` : 'special moments';

  if (intent.interests.includes('music') && name.toLowerCase().includes('song')) {
    return `Features their favourite song and code, making it an emotional keepsake for ${recipientLabel}.`;
  }
  if (cat === 'magazines') {
    return `Custom multi-page magazine celebrating ${recipientLabel}'s journey through personal photos and milestones.`;
  }
  if (cat === 'frames') {
    if (intent.budgetMax) {
      return `Good match for a photo-focused ${occasionLabel} gift within your ₹${intent.budgetMax} budget.`;
    }
    return `Clean personalized frame tailored to keep your favourite memory of ${recipientLabel} on display.`;
  }
  if (cat === 'memories') {
    return `Compact set of memory prints, ideal for photo lovers celebrating ${occasionLabel}.`;
  }
  if (cat === 'apparel') {
    if (intent.interests.includes('bikes')) {
      return `Personalized wearable tee you can customize with custom bike graphics or text.`;
    }
    return `Comfortable custom t-shirt tailored with your personal photo or print for ${recipientLabel}.`;
  }
  if (cat === 'hampers') {
    return `Celebration gift bundle loaded with personalized surprises for ${recipientLabel}.`;
  }
  if (cat === 'flowers') {
    return `Thoughtful floral arrangement paired with personalized keepsake elements.`;
  }
  if (cat === 'essentials') {
    return `Daily essential personalized with your photo or design for a practical yet thoughtful gift.`;
  }
  if (cat === 'vintage') {
    return `Nostalgic retro-styled keepsake for a heartfelt personal gesture.`;
  }

  return `Thoughtful personalized keepsake tailored around your favourite memories.`;
}

// --- 3. PRODUCT SCORING ALGORITHM ---
export function scoreProduct(product, intent) {
  let score = 10;
  const name = (product.name || '').toLowerCase();
  const cat = (product.categoryId || '').toLowerCase();
  const price = Number(product.price || 0);

  if (product.isBestSeller) score += 12;

  // Interest & Category matching
  if (intent.interests.includes('photos')) {
    if (cat === 'frames') score += 50;
    if (cat === 'memories') score += 45;
    if (cat === 'magazines') score += 40;
  }
  if (intent.interests.includes('magazine') && cat === 'magazines') score += 80;
  if (intent.interests.includes('apparel') && cat === 'apparel') score += 80;
  if (intent.interests.includes('phone-case') && (cat === 'essentials' || name.includes('case'))) score += 85;
  if (intent.interests.includes('hamper') && cat === 'hampers') score += 80;
  if (intent.interests.includes('flowers') && cat === 'flowers') score += 80;
  if (intent.interests.includes('vintage') && (cat === 'vintage' || name.includes('vintage'))) score += 80;
  if (intent.interests.includes('music') && name.includes('song')) score += 90;
  if (intent.interests.includes('bikes') && cat === 'apparel') score += 60;

  // Recipient affinities
  if (['girlfriend', 'wife'].includes(intent.recipient)) {
    if (cat === 'magazines') score += 40;
    if (cat === 'hampers') score += 35;
    if (cat === 'flowers') score += 35;
    if (cat === 'frames') score += 30;
    if (name.includes('song') || name.includes('love') || name.includes('anniversary')) score += 30;
  } else if (['boyfriend', 'husband'].includes(intent.recipient)) {
    if (cat === 'apparel') score += 40;
    if (cat === 'frames') score += 35;
    if (cat === 'magazines') score += 30;
    if (cat === 'essentials') score += 25;
    if (name.includes('song') || name.includes('black')) score += 20;
  } else if (['parents', 'mother', 'father'].includes(intent.recipient)) {
    if (cat === 'frames') score += 50;
    if (cat === 'hampers') score += 35;
    if (cat === 'magazines') score += 25;
    if (name.includes('collage') || name.includes('classic')) score += 30;
  } else if (['best-friend', 'friend', 'sister', 'brother'].includes(intent.recipient)) {
    if (cat === 'memories') score += 45;
    if (cat === 'apparel') score += 35;
    if (cat === 'frames') score += 30;
    if (cat === 'essentials') score += 30;
    if (name.includes('polaroid') || name.includes('mini')) score += 25;
  } else if (intent.recipient === 'teacher') {
    if (cat === 'frames') score += 50;
    if (cat === 'essentials') score += 30;
  }

  // Occasion affinities
  if (intent.occasion === 'birthday') {
    if (name.includes('birthday') || name.includes('milestone')) score += 45;
    if (cat === 'magazines') score += 25;
    if (cat === 'frames') score += 25;
    if (cat === 'hampers') score += 25;
  } else if (intent.occasion === 'anniversary') {
    if (name.includes('anniversary')) score += 50;
    if (name.includes('song') || name.includes('love')) score += 40;
    if (cat === 'magazines') score += 45;
    if (cat === 'hampers') score += 35;
    if (cat === 'frames') score += 30;
  } else if (intent.occasion === 'farewell') {
    if (cat === 'frames') score += 40;
    if (cat === 'memories') score += 35;
    if (cat === 'apparel') score += 30;
  } else if (intent.occasion === 'valentine' || intent.interests.includes('romantic')) {
    if (name.includes('love') || name.includes('song')) score += 45;
    if (cat === 'magazines') score += 40;
    if (cat === 'flowers') score += 40;
    if (cat === 'hampers') score += 35;
  }

  // Sweet spot budget Closeness bonus
  if (intent.budgetMax && price <= intent.budgetMax) {
    const ratio = price / intent.budgetMax;
    if (ratio >= 0.5 && ratio <= 1.0) {
      score += 20;
    }
  }

  return score;
}

// --- 4. DETERMINISTIC CLIENT-SIDE RANKING ENGINE ---
export function rankCatalogDeterministically(rawProducts = [], intent = {}) {
  intent = { interests: [], ...intent };
  const pool = Array.isArray(rawProducts) ? rawProducts : [];
  let candidates = pool.filter(p => p.isActive !== false && p.inStock !== false && Number.isFinite(Number(p.price)) && Number(p.price) >= 0);

  // Hard budget filtering
  if (intent.budgetMax) {
    candidates = candidates.filter(p => Number(p.price) <= intent.budgetMax);
  }

  if (intent.budgetMin) {
    candidates = candidates.filter(p => Number(p.price) >= intent.budgetMin);
  }

  const scored = candidates.map(product => {
    const score = scoreProduct(product, intent);
    const reason = generateExplanation(product, intent);
    return { product, score, reason };
  });

  scored.sort((a, b) => b.score - a.score);

  const topResults = scored.slice(0, 6).map((item, index) => ({
    ...item.product,
    recommendationReason: item.reason,
    isTopPick: index === 0
  }));

  let replyMessage = "";
  const count = topResults.length;
  
  if (!count) {
    replyMessage = 'No available gifts match this budget. Try another budget or occasion.';
  } else {
    const recipientPart = intent.recipient ? ` for your ${intent.recipient}` : '';
    const occasionPart = intent.occasion ? ` for ${intent.occasion}` : '';
    const budgetPart = intent.budgetMax ? ` under ₹${intent.budgetMax}` : '';
    replyMessage = `I found ${count} personalized gifts${recipientPart}${occasionPart}${budgetPart}:`;
  }

  return {
    success: true,
    reply: replyMessage,
    intent,
    needsClarification: false,
    clarificationQuestion: null,
    products: topResults,
    bestMatchId: topResults[0]?._id || topResults[0]?.id || null,
    refinementChips: [
      "More Personal",
      "Under ₹500",
      "Premium",
      "For Couples",
      "Photo Gifts",
      "Show More"
    ]
  };
}

// --- 5. MAIN SERVICE FUNCTION ---
export async function getGiftRecommendations({ query = '', refinement = null, currentIntent = null, cachedProducts = [] }) {
  const cleanQuery = String(query).slice(0, 400).trim();

  // Try Server API first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const res = await fetch(`${API_BASE_URL}/gift-assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: cleanQuery, refinement, currentIntent }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.products) && Array.isArray(cachedProducts) && cachedProducts.length > 0) {
        const intent = { ...extractIntent(cleanQuery), ...currentIntent };
        if (refinement === 'under-500') intent.budgetMax = 500;
        if (refinement === 'premium') intent.budgetMin = 600;
        const verified = data.products.map(item => cachedProducts.find(product => String(product._id || product.id) === String(item._id || item.id))).filter(Boolean);
        const safe = rankCatalogDeterministically(verified, intent);
        if (safe.products.length) return { ...data, ...safe };
      }
    }
  } catch (apiErr) {
    // API failed or timed out — fallback to client-side deterministic engine seamlessly
    console.info('Infinity AI: Using client-side catalog recommendation engine:', apiErr?.message);
  }

  // --- SEAMLESS CLIENT DETERMINISTIC FALLBACK ---
  let intent = extractIntent(cleanQuery);
  if (currentIntent && typeof currentIntent === 'object') {
    intent = { ...intent, ...currentIntent };
  }

  if (refinement === 'under-500' || refinement === 'lower-budget') {
    intent.budgetMax = 500;
  } else if (refinement === 'premium' || refinement === 'more-premium') {
    intent.style = 'premium';
    intent.budgetMin = 600;
  } else if (refinement === 'photo-gifts' || refinement === 'photo-focused') {
    if (!intent.interests.includes('photos')) intent.interests.push('photos');
  } else if (refinement === 'couples') {
    intent.recipient = 'couple';
    intent.relationship = 'romantic';
  } else if (refinement === 'more-personal' || refinement === 'more-emotional') {
    intent.style = 'sentimental';
  } else if (refinement === 'surprise-me') {
    intent.isSurprise = true;
  }

  const isVague = !intent.occasion && !intent.recipient && !intent.budgetMax && intent.interests.length === 0 && !intent.isSurprise;
  const isGibberish = cleanQuery.length > 5 && !/[aeiouy]/i.test(cleanQuery);

  let pool = Array.isArray(cachedProducts) ? cachedProducts : [];
  if (!pool.length) {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) throw new Error('The gift catalog is temporarily unavailable.');
    const catalog = await response.json();
    pool = Array.isArray(catalog) ? catalog : [];
  }
  pool = pool.filter(product => product.isActive !== false && product.inStock !== false);

  if (isGibberish) {
    const fallbackList = pool.filter(p => p.isBestSeller).slice(0, 4);
    return {
      success: true,
      reply: "I couldn't quite understand that. Tell me who you are shopping for (e.g. girlfriend, friend, parents) or your budget, and I'll find the right gifts.",
      intent,
      needsClarification: true,
      clarificationQuestion: "Who is this gift for?",
      quickOptions: ["Birthday Gift", "Anniversary Gift", "For Best Friend", "Under ₹500", "Under ₹1000"],
      products: fallbackList.map(p => ({
        ...p,
        recommendationReason: "One of our most loved personalized gifts.",
        isTopPick: false
      })),
      refinementChips: ["Birthday", "Anniversary", "Under ₹500", "Photo Gifts"]
    };
  }

  if (isVague && !refinement) {
    const topBestSellers = pool.filter(p => p.isBestSeller).slice(0, 4);
    return {
      success: true,
      reply: "Tell me a little more about who you're gifting or your budget so I can find the perfect match.",
      intent,
      needsClarification: true,
      clarificationQuestion: "Who are you shopping for, or what is your budget?",
      quickOptions: ["For Girlfriend", "For Best Friend", "Anniversary Gift", "Under ₹500", "Under ₹1000"],
      products: topBestSellers.map(p => ({
        ...p,
        recommendationReason: "A personalized choice from our gift catalog.",
        isTopPick: false
      })),
      refinementChips: ["Under ₹500", "Birthday", "For Couples", "Photo Gifts"]
    };
  }

  return rankCatalogDeterministically(pool, intent);
}

// Extract interactive intent tokens for real-time visual UI feedback
export function getIntentTokens(intent) {
  if (!intent) return [];
  const tokens = [];
  if (intent.urgency) tokens.push({ key: 'urgency', label: intent.urgency, type: 'urgency' });
  if (intent.occasion) {
    const formatted = intent.occasion.charAt(0).toUpperCase() + intent.occasion.slice(1);
    tokens.push({ key: 'occasion', label: formatted, type: 'occasion' });
  }
  if (intent.recipient) {
    const formatted = intent.recipient.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    tokens.push({ key: 'recipient', label: formatted, type: 'recipient' });
  }
  if (intent.interests && intent.interests.length > 0) {
    intent.interests.forEach(i => {
      const formatted = i.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
      tokens.push({ key: `interest-${i}`, value: i, label: formatted, type: 'interest' });
    });
  }
  if (intent.budgetMax) {
    tokens.push({ key: 'budgetMax', label: `Under ₹${intent.budgetMax}`, type: 'budget' });
  }
  if (intent.style) {
    const formatted = intent.style.charAt(0).toUpperCase() + intent.style.slice(1);
    tokens.push({ key: 'style', label: formatted, type: 'style' });
  }
  return tokens;
}
