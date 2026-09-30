const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// --- 1. NATURAL LANGUAGE INTENT EXTRACTION ---
function extractIntent(query = '') {
  const text = String(query).toLowerCase().trim();
  
  // Budget extraction: "under 1000", "under ₹500", "below 1500", "less than 800", "budget 1200", "within 600", "₹500"
  let budgetMax = null;
  let budgetMin = null;

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

  // Recipient & Relationship
  let recipient = null;
  let relationship = null;
  if (/girlfriend|gf|girl friend/i.test(text)) { recipient = 'girlfriend'; relationship = 'romantic'; }
  else if (/boyfriend|bf|boy friend/i.test(text)) { recipient = 'boyfriend'; relationship = 'romantic'; }
  else if (/wife|wifey/i.test(text)) { recipient = 'wife'; relationship = 'romantic'; }
  else if (/husband|hubby/i.test(text)) { recipient = 'husband'; relationship = 'romantic'; }
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

  // Gift Style
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
    style
  };
}

// --- 2. RECOMMENDATION EXPLANATION GENERATOR ---
function generateExplanation(product, intent) {
  const name = product.name || 'Personalized Gift';
  const cat = product.categoryId || '';
  const price = product.price || 0;
  const recipientLabel = intent.recipient ? `your ${intent.recipient}` : 'them';

  if (intent.interests.includes('music') && name.toLowerCase().includes('song')) {
    return `Features their favourite song and code, making it an emotional keepsake for ${recipientLabel}.`;
  }
  if (cat === 'magazines') {
    return `A custom 12-page editorial magazine celebrating ${recipientLabel}'s journey in glossy print.`;
  }
  if (cat === 'frames') {
    if (intent.budgetMax) {
      return `Fits your ₹${intent.budgetMax} budget and turns treasured photos into handcrafted wall or desk art.`;
    }
    return `Handcrafted solid frame designed to preserve cherished memories of ${recipientLabel}.`;
  }
  if (cat === 'memories') {
    return `An aesthetic retro collection of prints, perfect for photo lovers on a friendly budget.`;
  }
  if (cat === 'apparel') {
    if (intent.interests.includes('bikes')) {
      return `Custom-printed cotton tee you can personalize with bike graphics or memorable text.`;
    }
    return `High-quality custom printed cotton tee tailored with your personal design for ${recipientLabel}.`;
  }
  if (cat === 'hampers') {
    return `A grand luxury gift box loaded with personalized surprises for a milestone ${intent.occasion || 'occasion'}.`;
  }
  if (cat === 'flowers') {
    return `Everlasting floral arrangement paired with a heartfelt personalized message card.`;
  }
  if (cat === 'essentials') {
    return `Durable daily accessory customized with photos or name for a practical yet personal gift.`;
  }
  if (cat === 'vintage') {
    return `Nostalgic retro wooden piece with antique wax-sealed styling for an emotional touch.`;
  }

  return `Thoughtfully crafted personalized gift customized around your memories.`;
}

// --- 3. PRODUCT SCORING ALGORITHM ---
function scoreProduct(product, intent) {
  let score = 10;
  const name = (product.name || '').toLowerCase();
  const desc = (product.description || '').toLowerCase();
  const cat = (product.categoryId || '').toLowerCase();
  const price = Number(product.price || 0);

  if (product.isBestSeller) score += 12;

  // Category & Interest matching
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
    if (cat === 'memories') score += 45; // Polaroids
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

  // Budget closeness bonus (prefers products that maximize value without exceeding)
  if (intent.budgetMax && price <= intent.budgetMax) {
    const ratio = price / intent.budgetMax;
    if (ratio >= 0.5 && ratio <= 1.0) {
      score += 20; // Sweet spot within budget
    }
  }

  return score;
}

// --- 4. POST /api/gift-assistant ---
router.post('/', async (req, res) => {
  try {
    const { query = '', refinement = null, currentIntent = null } = req.body;
    
    // Sanitize input
    const cleanQuery = String(query).slice(0, 400).trim();
    
    if (!cleanQuery && !refinement) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a description or occasion.'
      });
    }

    // Merge or extract intent
    let intent = extractIntent(cleanQuery);
    if (currentIntent && typeof currentIntent === 'object') {
      intent = { ...intent, ...currentIntent };
    }

    // Handle quick refinement actions
    if (refinement === 'under-500') {
      intent.budgetMax = 500;
    } else if (refinement === 'premium') {
      intent.style = 'premium';
      intent.budgetMin = 600;
    } else if (refinement === 'photo-gifts') {
      if (!intent.interests.includes('photos')) intent.interests.push('photos');
    } else if (refinement === 'couples') {
      intent.recipient = 'couple';
      intent.relationship = 'romantic';
    } else if (refinement === 'more-personal') {
      intent.style = 'sentimental';
    }

    // Check if query is too vague to recommend accurately
    const isVague = !intent.occasion && !intent.recipient && !intent.budgetMax && intent.interests.length === 0;
    const isGibberish = cleanQuery.length > 5 && !/[aeiouy]/i.test(cleanQuery);

    // Fetch active products from catalog
    let allProducts = [];
    try {
      allProducts = await Product.find({ inStock: { $ne: false } }).lean();
    } catch (dbErr) {
      console.warn('DB fetch failed in giftAssistant, using empty list:', dbErr.message);
    }

    // If query is gibberish or extremely vague with no filters
    if (isGibberish) {
      const fallbackList = allProducts.filter(p => p.isBestSeller).slice(0, 4);
      return res.json({
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
      });
    }

    if (isVague && !refinement) {
      const topBestSellers = allProducts.filter(p => p.isBestSeller).slice(0, 4);
      return res.json({
        success: true,
        reply: "Tell me a little more about who you're gifting or your budget so I can find the perfect match.",
        intent,
        needsClarification: true,
        clarificationQuestion: "Who are you shopping for, or what is your budget?",
        quickOptions: ["For Girlfriend", "For Best Friend", "Anniversary Gift", "Under ₹500", "Under ₹1000"],
        products: topBestSellers.map(p => ({
          ...p,
          recommendationReason: "Popular personalized choice with verified customer reviews.",
          isTopPick: false
        })),
        refinementChips: ["Under ₹500", "Birthday", "For Couples", "Photo Gifts"]
      });
    }

    // --- APPLY HARD BUDGET & CATEGORY FILTERS ---
    let candidates = [...allProducts];
    let budgetLoosened = false;

    if (intent.budgetMax) {
      const inBudget = candidates.filter(p => Number(p.price || 0) <= intent.budgetMax);
      if (inBudget.length > 0) {
        candidates = inBudget;
      } else {
        // No exact products in budget: safely loosen budget and disclose clearly
        budgetLoosened = true;
        candidates.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        candidates = candidates.slice(0, 8);
      }
    }

    if (intent.budgetMin && !budgetLoosened) {
      const aboveMin = candidates.filter(p => Number(p.price || 0) >= intent.budgetMin);
      if (aboveMin.length > 0) {
        candidates = aboveMin;
      }
    }

    // Score and rank candidates
    const scored = candidates.map(product => {
      const score = scoreProduct(product, intent);
      const reason = generateExplanation(product, intent);
      return { product, score, reason };
    });

    scored.sort((a, b) => b.score - a.score);

    // Pick top 4 to 6 results
    const topResults = scored.slice(0, 6).map((item, index) => ({
      ...item.product,
      recommendationReason: item.reason,
      isTopPick: index === 0
    }));

    // Formulate concise AI response message
    let replyMessage = "";
    const count = topResults.length;
    
    if (budgetLoosened) {
      replyMessage = `I couldn't find an exact match under ₹${intent.budgetMax}. Here are our closest handcrafted options starting from ₹${topResults[0]?.price || '...'}:`;
    } else {
      const recipientPart = intent.recipient ? ` for your ${intent.recipient}` : '';
      const occasionPart = intent.occasion ? ` for ${intent.occasion}` : '';
      const budgetPart = intent.budgetMax ? ` under ₹${intent.budgetMax}` : '';
      replyMessage = `I found ${count} personalized gifts${recipientPart}${occasionPart}${budgetPart}:`;
    }

    return res.json({
      success: true,
      reply: replyMessage,
      intent,
      needsClarification: false,
      clarificationQuestion: null,
      products: topResults,
      bestMatchId: topResults[0]?._id || null,
      refinementChips: [
        "More Personal",
        "Under ₹500",
        "Premium",
        "For Couples",
        "Photo Gifts",
        "Show More"
      ]
    });

  } catch (err) {
    console.error('Gift Assistant error:', err);
    res.status(500).json({
      success: false,
      message: 'Infinity AI is currently unavailable. Please explore our best sellers.'
    });
  }
});

module.exports = router;
