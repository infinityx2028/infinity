const mongoose = require('mongoose');
const Product = require('./models/product');
const Category = require('./models/category');
const Admin = require('./models/admin');
const User = require('./models/user');
const Order = require('./models/order');
require('dotenv').config();

const products = [
  // ===== CATEGORY 1: PHOTO FRAMES (18 Products) =====
  { 
    _id: "f1",
    categoryId: "frames", 
    name: "4x6 Black Premium Frame", 
    price: 199, 
    image: "/images/4 x 6 black frame 199.jpg", 
    images: ["/images/4 x 6 black frame 199.jpg", "/images/4 x 6 p2.jpg", "/images/4 x 6 p3.jpg", "/images/4 x 6 p4.jpg"],
    description: "Keep a special moment close with a clean black 4x6 frame. Perfectly sized for desks, bedside tables, or memory walls, it comes with clear glass protection to keep your photo looking crisp and fresh every day.",
    inStock: true 
  },
  { 
    _id: "f1b",
    categoryId: "frames", 
    name: "4x6 White Premium Frame", 
    price: 199, 
    image: "/images/4 x 6 white frame 199.jpg", 
    images: ["/images/4 x 6 white frame 199.jpg"],
    description: "Brighten your space with a minimalist white 4x6 frame. Its modern border adds a clean aesthetic to everyday snapshots, couple photos, and family moments, making it a thoughtful and easy personalized gift.",
    inStock: true,
    isBestSeller: true
  },
  {
    _id: "pol1",
    categoryId: "memories", 
    name: "Polaroids Mini", 
    price: 60,
    image: "/images/mini.jpeg", 
    images: ["/images/mini.jpeg", "/images/pmini.jpg", "/images/polaroids.jpg"],
    description: "Turn your camera-roll memories into compact mini polaroid prints. Designed for sharing, memory walls, and pocket keepsakes, starting at 12 prints with easy quantity additions to capture all your favourite little moments.",
    inStock: true,
    pricingType: "standard",
    pricePerUnit: 5,
    minimumOrderQuantity: 12,
    quantityIncrement: 6,
    basePrice: 60
  },
  { 
    _id: "pol2",
    categoryId: "memories", 
    name: "Polaroids Medium", 
    price: 64,
    image: "/images/medp.jpg", 
    images: ["/images/medp.jpg", "/images/POLAROIDS MEDIUM 8 PER EACH.jpg",],
    description: "Give your best photos a nostalgic physical feel with classic medium polaroids. Printed with clean borders on durable matte stock, they are ideal for fairy-light clips, scrapbook pages, and meaningful anniversary or friendship surprises.",
    inStock: true,
    pricingType: "standard",
    pricePerUnit: 8,
    minimumOrderQuantity: 8,
    quantityIncrement: 4,
    basePrice: 64
  },
  { 
    _id: "pol3",
    categoryId: "memories", 
    name: "Polaroids Large", 
    price: 60,
    image: "/images/largep.jpg", 
    images: ["/images/largep.jpg", "/images/polaroids.jpg"],
    description: "Showcase your favourite moments in a larger format that lets details shine. These prints combine vintage polaroid aesthetics with generous sizing, making them a standout choice for bedroom displays, gifting bundles, and photo collages.",
    inStock: true,
    pricingType: "standard",
    pricePerUnit: 15,
    minimumOrderQuantity: 4,
    quantityIncrement: 2,
    basePrice: 60
  },
  { 
    _id: "pol4",
    categoryId: "memories", 
    name: "Polaroid Album", 
    price: 169, 
    image: "/images/polaroids album 169.jpg", 
    images: ["/images/polaroids album 169.jpg", "/images/pol album 169.jpg"],
    description: "Keep your growing polaroid collection safe in one charming album. With structured slip-in sleeves and a neat cover, it allows you to flip through personal memories, trips, and celebrations whenever you want.",
    inStock: true 
  },
  { 
    _id: "f2",
    categoryId: "frames", 
    name: "4x4 Compact Frame", 
    price: 149, 
    image: "/images/4 x 4 149.jpg", 
    images: ["/images/4 x 4 149.jpg"],
    description: "Bring square photos to life with a compact 4x4 frame. Perfectly proportioned for desk setups, cozy corners, and subtle gifting, it offers a neat and charming way to highlight a single meaningful snapshot.",
    inStock: true 
  },
  { 
    _id: "f3",
    categoryId: "frames", 
    name: "5x7 Frame", 
    price: 299, 
    image: "/images/white frame1.jpg", 
    images: ["/images/white frame1.jpg", "/images/white frame2.jpg"],
    description: "A well-balanced 5x7 frame that gives portraits and couple photos plenty of room to breathe. Available with classic border styling, it effortlessly complements bedroom shelves, living room consoles, and family gifting moments.",
    inStock: true 
  },
 
  { 
    _id: "f13",
    categoryId: "frames", 
    name: "8x12 Black Frame 1 Inch", 
    price: 599, 
    image: "/images/modi.jpg", 
    images: ["/images/modi.jpg", "/images/1nch.jpg"],
    description: "Give larger portraits and cherished memories strong visual presence. Featuring a substantial 1-inch black border, this 8x12 frame creates a defined focal point on feature walls, office desks, and gifting arrangements.",
    inStock: true 
  },
  { 
    _id: "f14",
    categoryId: "frames", 
    name: "8x12 Black Frame Half Inch", 
    price: 499, 
    image: "/images/half inch2.jpg", 
    images: ["/images/half inch2.jpg", "/images/8 x 12 (1_2 inch) 499.jpg", "/images/8 x 12 599(1_2 inch).jpg"],
    description: "Emphasize your photograph with a sleek half-inch slim black border. Its minimalist profile gives full attention to the image, making it ideal for contemporary interiors, candid portraits, and artistic prints.",
    inStock: true 
  },
  { 
    _id: "f15",
    categoryId: "frames", 
    name: "8x12 Mount Frame", 
    price: 699, 
    image: "/images/8x12 mount.jpg", 
    images: ["/images/8 x 12 mount.jpg"],
    description: "Elevate your photography with a professional inner mount that frames your picture with balanced breathing space. Perfect for graduation pictures, couple portraits, and anniversary memories that deserve a sophisticated touch.",
    inStock: true 
  },
  { 
    _id: "f5",
    categoryId: "frames", 
    name: "10x12 Modern Frame", 
    price: 1299, 
    image: "/images/10 x 12 frame 1299.jpg", 
    images: ["/images/10 x 12 frame 1299.jpg"],
    description: "Make a strong impression with a contemporary 10x12 frame. Built for prominent wall placement, it turns milestone portraits and family gatherings into a centerpiece you will enjoy every day.",
    inStock: true 
  },
  { 
    _id: "f6",
    categoryId: "frames", 
    name: "12x18 Premium Mount Frame", 
    price: 1999, 
    image: "/images/12x18 main.jpg", 
    images: ["/images/12x18 main.jpg", "/images/12 x 18 mount 2199(1).jpg", "/images/12 x 18 mount 2199(2).jpg"],
    description: "Designed for standout memories that deserve central attention. This large 12x18 frame incorporates an interior mount border to create visual depth, making wedding photographs, anniversary milestones, and family portraits look truly cinematic on your wall.",
    inStock: true 
  },
  { 
    _id: "f7",
    categoryId: "frames", 
    name: "12x18 Brown Frame", 
    price: 1499, 
    image: "/images/frame brown.jpeg", 
    images: ["/images/frame brown.jpeg", "/images/12 x 18 1499 .jpg"],
    description: "Add natural warmth to your living room or bedroom with a rich brown 12x18 frame. Its organic tones complement candid outdoor photos, anniversary moments, and warm-toned memories beautifully.",
    inStock: true 
  },
  { 
    _id: "f9",
    categoryId: "frames", 
    name: "12x18 Milestone Frame", 
    price: 1599, 
    image: "/images/12 x 18 milestone .jpg", 
    images: ["/images/12 x 18 milestone .jpg"],
    description: "Celebrate birthdays, anniversaries, and personal milestones with a dedicated 12x18 keepsake frame. Pair your chosen picture with dates and memorable details to honor a milestone someone will treasure for years.",
    inStock: true 
  },
 
  { 
    _id: "f11",
    categoryId: "frames", 
    name: "12x18 Collage Frame", 
    price: 3999, 
    image: "/images/collage frame 3999.jpg", 
    images: ["/images/collage frame 3999.jpg"],
    description: "When one picture is not enough, this 12x18 collage frame allows you to showcase multiple moments in a harmonious layout. Perfect for relationship timelines, year-in-review stories, and group celebrations.",
    inStock: true 
  },
  { 
    _id: "f12",
    categoryId: "frames", 
    name: "Vintage Photo Frame", 
    price: 399, 
    image: "/images/vintage frame.jpg", 
    images: ["/images/vintage frame.jpg", "/images/vintage frames p2.jpg", "/images/vintage frames p3.jpg", "/images/vintage frames p4.jpg"],
    description: "Add character to your bedside table or shelf with this antique-inspired vintage frame. Its distinctive styling pairs wonderfully with nostalgic black-and-white snaps or sepia memories.",
    inStock: true 
  },
  { 
    _id: "f16",
    categoryId: "frames", 
    name: "12x18 Frame", 
    price: 1499, 
    image: "/images/12x18 new.jpg", 
    images: ["/images/12x18 new.jpg"],
    description: "Transform your favourite high-resolution snapshot into wall art with this 12x18 display frame. Its generous dimensions make it an impressive option for home living rooms, hallway galleries, and couple gifts.",
    inStock: true 
  },
  { 
    _id: "f17",
    categoryId: "frames", 
    name: "8x12 Wedding Frame", 
    price: 499, 
    image: "/images/wed frame.jpg", 
    images: ["/images/wed frame.jpg"],
    description: "Celebrate your wedding day or give an unforgettable anniversary gift with this 8x12 wedding frame. It provides a romantic, elegant border to showcase your favorite bridal portrait or vows moment.",
    inStock: true 
  },
  {
    _id: "f18",
    categoryId: "frames",
    name: "12x18 Lighting Frame",
    price: 2899,
    image: "/images/Lf.jpeg",
    images: ["/images/Lf.jpeg", "/images/Lf1.jpeg"],
    description: "Add a warm ambient glow to your favourite memory. This 12x18 lighting frame features gentle illumination that highlights your photograph after dark, creating a magical bedroom or living room atmosphere.",
    inStock: true
  },

  // ===== CATEGORY 2: MAGAZINES & PHOTOBOOKS (9 Products) =====
  { 
    _id: "m1",
    categoryId: "magazines", 
    name: "Anniversary Magazine", 
    price: 499, 
    image: "/images/aniv1.jpeg", 
    images: ["/images/aniv1.jpeg", "/images/aniv2.jpeg", "/images/aniv3.jpeg", "/images/aniv4.jpeg", "/images/aniv5.jpeg"],
    description: "Celebrate your journey together with a personalized anniversary magazine. Custom-printed with your relationship photos, dates, and sweet memories, it feels like an authentic editorial storybook dedicated entirely to the two of you.",
    inStock: true,
    pageOptions: [
      { pages: 8, priceAddition: 0 },
      { pages: 12, priceAddition: 150 }
    ]
  },
  { 
    _id: "m2",
    categoryId: "magazines", 
    name: "Magazine 12 Pages", 
    price: 599, 
    image: "/images/mag 12pgs 599.jpg", 
    images: ["/images/mag 12pgs 599.jpg", "/images/mag 12pgs 599 p3.jpg", "/images/mag 12pgs 599 p4.jpg", "/images/mag 12pgs 599 p5.jpg", "/images/mag 12pgs 599 p6.jpg", "/images/mag 12pgs 599 p7.jpg", "/images/mag 12pgs 599 p8.jpg"],
    description: "Tell a complete visual story across 12 custom pages. Perfect for long vacations, college memories, and milestone birthdays, this magazine gives you space to combine dozens of photos with dates and personal captions.",
    inStock: true,
    pageOptions: [
      { pages: 8, priceAddition: 0 },
      { pages: 12, priceAddition: 150 }
    ]
  },
  { 
    _id: "m3",
    categoryId: "magazines", 
    name: "Magazine Design 2", 
    price: 499, 
    image: "/images/MAG design2.jpg", 
    images: ["/images/MAG design2.jpg", "/images/MAG design2 p6.jpg", "/images/MAG design2 p7.jpg", "/images/MAG design2 p8.jpg", "/images/MAG design2 p9.jpg"],
    description: "Designed with a fashion-forward editorial aesthetic, Magazine Design 2 pairs bold typographic headings with candid photo collages. It is an exciting way to spotlight a best friend, partner, or sibling on their special day.",
    inStock: true,
    isBestSeller: true,
    pageOptions: [
      { pages: 8, priceAddition: 0 },
      { pages: 12, priceAddition: 150 }
    ]
  },


  // ===== CATEGORY 4: FLOWERS & BOUQUETS (6 Products) =====
  {
    _id: "bou1",
    categoryId: "flowers",
    name: "Natural Flower Bouquet",
    price: 249,
    image: "/images/nf.jpeg",
    images: ["/images/nf.jpeg"],
    description: "Brighten someone's day with a fresh natural flower bouquet. Hand-wrapped with care and ready to bring natural fragrance and color to birthdays, anniversaries, graduations, and surprise doorstep deliveries.'s day with a fresh natural flower bouquet. Hand-wrapped with care and ready to bring natural fragrance and color to birthdays, anniversaries, graduations, and surprise doorstep deliveries.",
    inStock: true,
    isBestSeller: true,
    deliveryCharge: 249
  },
  {
    _id: "bou2",
    categoryId: "flowers",
    name: "Single Artificial Flower",
    price: 199,
    image: "/images/artificial single flower boq 199.jpg",
    images: ["/images/artificial single flower boq 199.jpg", "/images/single.jpeg"],
    description: "A lasting symbolic keepsake that never wilts. This single artificial flower adds a delicate romantic touch when tucked into gift boxes, paired with letters, or placed on study desks as a permanent reminder.",
    inStock: true,
    deliveryCharge: 249
  },
  {
    _id: "bou3",
    categoryId: "flowers",
    name: "Artificial Bouquet Design 1",
    price: 899,
    image: "/images/artboqwith,pol,flow,choc 899.jpg",
    images: ["/images/artboqwith,pol,flow,choc 899.jpg", "/images/ds1.jpeg"],
    description: "An all-in-one celebration bouquet that bundles 12 everlasting artificial flowers, 12 personalized medium polaroids of your memories, and 6 sweet chocolates into a single wrapped surprise. Optional warm fairy lights are available to add an extra glow.",
    inStock: true,
    deliveryCharge: 249,
    components: [
      { item: "Polaroids Medium", sku: "pol2", quantity: 12 },
      { item: "Artificial Flowers", quantity: 12 },
      { item: "Chocolates", quantity: 6 }
    ],
    optionalAddons: { lights: 50 }
  },
  {
    _id: "bou4",
    categoryId: "flowers",
    name: "Artificial Bouquet Design 2",
    price: 899,
    image: "/images/aflower2.jpeg",
    images: ["/images/aflower2.jpeg", "/images/artf1.jpeg", "/images/artf.jpeg"], 
    description: "Created especially for birthday parties and celebrations, this arrangement features 12 artificial flowers, 12 custom polaroid memories, and a celebratory cake topper. An expressive, lasting alternative to conventional flowers that keeps the memories alive.",
    inStock: true,
    deliveryCharge: 249,
    components: [
      { item: "Polaroids Medium", sku: "pol2", quantity: 12 },
      { item: "Artificial Flowers", quantity: 12 },
      { item: "Cake Topper", quantity: 1 }
    ],
    optionalAddons: { lights: 50 }
  },
  {
    _id: "bou5",
    categoryId: "flowers",
    name: "Artificial Bouquet Deluxe",
    price: 999,
    image: "/images/artboqwith,pol,flow,cktpr,choc 999.jpg",
    images: ["/images/artboqwith,pol,flow,cktpr,choc 999.jpg", "/images/artboqwith,pol,flow,cktpr,choc 999 p2.jpg", "/images/artboqwith,pol,flow,cktpr,choc 999 p3.jpg"],
    description: "The ultimate gifting arrangement that has it all. Includes 12 artificial flowers, 12 personalized polaroids, 6 delicious chocolates, and a festive cake topper. Perfectly styled for milestone birthdays, anniversaries, and grand surprise moments.",
    inStock: true,
    deliveryCharge: 249,
    components: [
      { item: "Polaroids Medium", sku: "pol2", quantity: 12 },
      { item: "Artificial Flowers", quantity: 12 },
      { item: "Chocolates", quantity: 6 },
      { item: "Cake Topper", quantity: 1 }
    ],
    optionalAddons: { lights: 50 }
  },
  {
    _id: "bou8",
    categoryId: "flowers",
    name: "Natural Roses 20 Flowers 499",
    price: 499,
    image: "/images/rose.jpeg",
    images: ["/images/rose.jpeg"],
    description: "Make a classic romantic statement with a fresh bunch of 20 hand-selected natural roses. Wrapped with clean wrapping paper and ribbon, it is an iconic gesture for anniversaries, Valentine's surprises, and birthdays.'s surprises, and birthdays.",
    inStock: true,
    deliveryCharge: 249
  },

  // ===== CATEGORY 5: HAMPERS & GIFT COMBOS (4 Products) =====
  { 
    _id: "ham2",
    categoryId: "hampers", 
    name: "Premium Transparent Hamper", 
    price: 599, 
    image: "/images/HAMPER(1).jpg", 
    images: ["/images/HAMPER(1).jpg"],
    description: "A sleek transparent gift hamper that puts your curated keepsakes on full display. Packaged with ribbon and designed for clean aesthetics, it creates an exciting unboxing experience for birthdays, friendships, and celebrations.",
    inStock: true 
  },
  { 
    _id: "ham3",
    categoryId: "hampers", 
    name: "Premium Hamper Combo", 
    price: 999, 
    image: "/images/hamperc.jpeg", 
    images: ["/images/hamperc.jpeg", "/images/phc.jpg", "/images/phc1.jpg", "/images/phc2.jpg"],
    description: "Why choose just one gift when you can combine them? This premium combo hamper brings together floral touches, custom polaroid prints, and curated gifts in an artful presentation box ready for gifting.",
    inStock: true 
  },
  {
    _id: "ham4",
    categoryId: "hampers",
    name: "Hamper with Sweets",
    price: 1249,
    image: "/images/sweet.jpeg",
    images: ["/images/sweet.jpeg", "/images/box.jpeg"],
    description: "Celebrate sweet moments with a rich festive hamper featuring quality sweets and personalized keepsakes. Specially arranged for family gatherings, festival celebrations, and heartwarming surprises delivered to their doorstep.",
    inStock: true
  },

  
  // ===== CATEGORY 6: APPAREL (T-SHIRTS) (5 Products) =====

  { 
    _id: "cap1",
    categoryId: "apparel", 
    name: "Custom Cap", 
    price: 99, 
    image: "/images/cap1.jpeg", 
    images: ["/images/cap1.jpeg"],
    description: "Top off your outfit with a personalized baseball cap. Featuring an adjustable strap and clean front embroidery or print area, it makes a fun custom accessory for personal wear, group trips, and college squads.",
    inStock: true 
  },


  // ===== NEW TSHIRT VARIANTS =====
  {
    _id: "collared-tshirt",
    categoryId: "apparel",
    subcategoryName: "Collared",
    name: "Collared T-Shirts",
    price: 499,
    image: "/images/ct.jpeg",
    images: ["/images/ct.jpeg", "/images/ct1.jpg", "/images/ct2.jpeg", "/images/ct3.jpg", "/images/ct4.jpeg", "/images/ct5.jpeg"],
    description: "Look sharp with a custom-printed polo t-shirt. Select your preferred fabric (Poly Cotton or Pure Cotton), pick your color, and add your custom crest, company logo, or personal design. Available with volume savings for group and corporate orders.",
    inStock: true,
    isBestSeller: true,
    pricingType: "fabric-based",
    fabrics: [
      { name: "Poly Cotton", price: 499, priceDifference: 0 },
      { name: "Pure Cotton", price: 599, priceDifference: 100 }
    ],
    colors: ["Maroon", "Navy Blue", "Black", "White"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    minimumOrderQuantity: 1,
    quantityTiers: [
      { quantity: 1, discount: 0 },
      { quantity: 5, discount: 20 },
      { quantity: 10, discount: 40 },
      { quantity: 20, discount: 80 }
    ]
  },
  {
    _id: "collarless-tshirt",
    categoryId: "apparel",
    subcategoryName: "Collarless",
    name: "Collarless T-Shirts",
    price: 399,
    image: "/images/cless2.jpg",
    images: ["/images/cless2.jpg", "/images/cless3.jpeg", "/images/cless4.jpeg", "/images/cless5.jpeg", "/images/cless6.jpeg", "/images/cless8.jpeg","/images/cless9.jpeg","/images/cless1.jpeg","/images/cless.jpeg"],
    description: "A versatile everyday round-neck tee customized with your photo, graphic, or slogan. Available in breathable Nylon or Pure Cotton in sizes S to XXL, it is a favorite choice for birthday squads, college fests, and casual personal wear.",
    inStock: true,
    pricingType: "fabric-based",
    fabrics: [
      { name: "Nylon", price: 399, priceDifference: 0 },
      { name: "Pure Cotton", price: 449, priceDifference: 50 }
    ],
    colors: ["White", "Black", "Pink", "Blue", "Yellow"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    minimumOrderQuantity: 1,
    quantityTiers: [
      { quantity: 1, discount: 0 },
      { quantity: 5, discount: 20 },
      { quantity: 10, discount: 40 },
      { quantity: 20, discount: 80 }
    ]
  },
  {
    _id: "signature day tshirts",
    categoryId: "apparel",
    subcategoryName: "Signature",
    name: "Signature T-Shirts",
    price: 179,
    image: "/images/st.jpg",
    images: ["/images/st.jpg", "/images/st1.jpeg"],
    description: "The quintessential tee for college signature days, sports meets, and farewell celebrations. Made from lightweight white polyester that easily takes markers and prints, with tiered volume pricing for orders of 10 or more.",
    inStock: true,
    pricingType: "quantity-based",
    fabrics: [
      { name: "Polyester", price: 179, priceDifference: 0 }
    ],
    colors: ["White"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    minimumOrderQuantity: 10,
    quantityBasedPricing: [
      { quantity: 10, price: 179 },
      { quantity: 20, price: 169 },
      { quantity: 50, price: 159 },
      { quantity: 100, price: 149 }
    ]
  },

  // ===== CATEGORY 7: PHONE CASES & ESSENTIALS (4 Products) =====
  { 
    _id: "case1",
    categoryId: "essentials", 
    name: "Customized Phone Case", 
    price: 199, 
    image: "/images/phonec.jpeg", 
    images: ["/images/phonec.jpeg"],
    description: "Make your smartphone uniquely yours with a personalized photo case. Tailored to fit your specific phone model with precision cutouts for camera and ports, it transforms everyday phone handling into a personal statement.",
    inStock: true 
  },

  {_id : "case2",
    categoryId: "essentials",
    name: "Customized Phone Case Premium",
    price: 199,
    image: "/images/phonec2.jpeg",
    images: ["/images/phonec2.jpeg", "/images/phonec3.jpeg", "/images/phonec1.jpeg"],
    description: "Showcase your favourite memory with a sleek custom case designed for vibrant color reproduction. Just select your phone brand and model during order details, and our studio crafts your case to fit your device accurately.",
    inStock: true
  },

  {_id : "case3",
    categoryId: "essentials",
    name: "Customized Phone Case Premium",
    price: 199,
    image: "/images/phonec4.jpeg",
    images: ["/images/phonec4.jpeg", "/images/phonec3.jpeg"],
    description: "Turn your device into an eye-catching canvas with edge-to-edge custom printing. Great for couples, pet photos, and travel memories, with verified camera alignment for popular iPhone and Android models.",
    inStock: true,
    isBestSeller: true
  },

  {_id : "case4",
    categoryId: "essentials",
    name: "Customized Phone Case Premium",
    price: 199,
    image: "/images/phonec5.jpeg",
    images: ["/images/phonec5.jpeg", "/images/phonec6.jpeg", "/images/phonec7.jpeg"],
    description: "Protect your phone in personal style. This customized cover features high-fidelity printing tailored to your specific handset model. Simply specify your phone model when ordering, and review your proof easily on WhatsApp.",
    inStock: true
  },


  { 
    _id: "cup1",
    categoryId: "essentials", 
    name: "Photo Cup 299", 
    price: 299, 
    image: "/images/photo cup 299.jpg", 
    images: ["/images/photo cup 299.jpg"],
    description: "Start every morning with a smile. This glossy white ceramic mug features a wrap-around custom photo print that withstands daily tea or coffee routines, making it a timeless gift for parents, partners, and coworkers.",
    inStock: true 
  },
  { 
    _id: "cup2",
    categoryId: "essentials", 
    name: "Photo Cup Premium 299", 
    price: 299, 
    image: "/images/photo cup p2 299.jpg", 
    images: ["/images/photo cup p2 299.jpg"],
    description: "A delightful personalized drinkware staple for home or office. Crafted from sturdy ceramic with a smooth comfortable handle, your photo wraps cleanly around the mug for a constant reminder of warm moments.",
    inStock: true 
  },
  { 
    _id: "exampads1",
    categoryId: "essentials", 
    name: "Customized Exam Pads", 
    price: 279, 
    image: "/images/exam.jpeg", 
    images: ["/images/exam.jpeg", "/images/exam1.jpeg"],
    description: "Stay inspired during test season and study sessions. This sturdy customized writing pad features a firm metal clip and a personalized glossy printed board with your name, photo, or motivating message.",
    inStock: true,
    isBestSeller: true
  },

  // ===== CATEGORY 8: CALENDARS & MAGNETS (3 Products) =====
  { 
    _id: "cal1",
    categoryId: "addons", 
    name: "Photo Calendar 199", 
    price: 199, 
    image: "/images/calender 199.jpg", 
    images: ["/images/calender 199.jpg"],
    description: "Enjoy your fondest memories all year round. Each page features a clear monthly date grid accompanied by your selected seasonal photos, making it a wonderful New Year or birthday gift for family and desks.",
    inStock: true 
  },
  { 
    _id: "mag1",
    categoryId: "addons", 
    name: "Fridge Magnet Set 179", 
    price: 179, 
    image: "/images/fridge magents 179.jpg", 
    images: ["/images/fridge magents 179.jpg"],
    description: "Transform your refrigerator into a gallery of smiles. These lightweight decorative photo magnets stick securely to metal surfaces, keeping vacation memories, couple photos, and cute reminders in daily view.",
    inStock: true 
  },


  // ===== CATEGORY 9: VINTAGE COLLECTION (3 Products) =====
  { 
    _id: "vf1",
    categoryId: "vintage", 
    name: "Vintage Frame", 
    price: 99, 
    image: "/images/vintage frame.jpg", 
    images: ["/images/vintage frame.jpg", "/images/vintage frames p2.jpg", "/images/vintage frames p3.jpg", "/images/vintage frames p4.jpg"],
    description: "Add an antique aesthetic to your home decor with this miniature vintage frame. Its ornate border detailing provides a quaint setting for old-school portraits, love notes, and nostalgic photos.",
    inStock: true 
  },
  { 
    _id: "vl1",
    categoryId: "vintage", 
    name: "Vintage Letter 119", 
    price: 119, 
    image: "/images/vintage letter 119.JPG", 
    images: ["/images/vintage letter 119.JPG"],
    description: "Say what you feel in timeless fashion. This vintage-styled letter is printed on textured paper with antique typographic accents, perfect for love confessions, anniversary vows, birthday notes, or heartfelt farewells.",
    inStock: true 
  },

  // ===== CATEGORY 10: SMART & DIGITAL SERVICES (9 Products) =====
  { 
    _id: "nfc1",
    categoryId: "smart-digital", 
    name: "NFC Review Board 799", 
    price: 799, 
    image: "/images/nfc.jpeg", 
    images: ["/images/nfc.jpeg"],
    description: "Boost your business ratings effortlessly. Customers simply tap their smartphone against this sleek acrylic board or scan the backup QR code to open your Google Review link directly in seconds—no app installation needed.",
    inStock: true 
  },
  { 
    _id: "id1",
    categoryId: "smart-digital", 
    name: "ID Card PVC 149", 
    price: 149, 
    image: "/images/ID.jpeg", 
    images: ["/images/ID.jpeg"],
    description: "Professional PVC card printing for businesses, schools, organizations, and events. Made on durable waterproof plastic stock with sharp text, clean photo reproduction, and standard wallet card dimensions.",
    inStock: true 
  },
  { 
    _id: "d1",
    categoryId: "smart-digital", 
    name: "Digital Invitation", 
    price: 299, 
    image: "/images/DI2.JPG", 
    images: ["/images/DI2.JPG", "/images/DI1.JPG", "/images/DI3.JPG", "/images/digital invitation p2.JPG"],
    description: "Announce your wedding, birthday, housewarming, or celebration with a stylish digital invitation. Custom-crafted with your event dates, venue map links, and names, ready to send instantly to all your guests without printing costs.",
    inStock: true 
  },
  { 
    _id: "d4",
    categoryId: "smart-digital",
    name: "Digital Video Invitation",
    price: 399,
    image: "/images/reel1.jpeg",
    images: ["/images/reel1.jpeg", "/images/reel2.jpeg", "/images/reel3.jpeg", "/images/reel4.jpeg"],
    description: "Make your celebration announcement unforgettable with an animated video invitation. Features custom motion graphics, music, and your photos and event details in a dynamic vertical video format that is ready to share.",
    instagramLinks: [
      "https://www.instagram.com/reel/DGTDnYoSW0X/?igsh=YzFtZmNxY2h6djF5",
      "https://www.instagram.com/reel/DJfx-NCy9o-/?igsh=cWZkemk1NjJ0dDBk",
      "https://www.instagram.com/reel/DJZPJJdSvhA/?igsh=MTNjazVnaDJ4cW9vdg==",
      "https://www.instagram.com/reel/DUJDSZRktXE/?igsh=NjVoZzV4amhoMzR0"
    ],
    inStock: true
  },
  { 
    _id: "d2",
    categoryId: "smart-digital", 
    name: "Photo Restoration", 
    price: 199, 
    image: "/images/photo restoration (after).JPEG", 
    images: ["/images/photo restoration (after).JPEG", "/images/photo restoration (before).jpg"],
    description: "Rescue fading family treasures. Our digital restoration process carefully removes dust spots, light creases, and minor scratches from your scanned or photographed original, delivering a refreshed digital copy ready for reprinting.",
    inStock: true 
  },
  {
  _id: "d3",
  categoryId: "smart-digital",
  name: "Photo restoration premium",
  price: 299,
  image: "/images/photo restore.png",
  images: ["/images/prp.jpg", "/images/prp1.jpg", "/images/prp2.jpg"],
  description: "Breathe vibrant new life into heirloom photographs. Includes deep scratch and tear repair, facial detail reconstruction, and realistic digital colorization to transform aged black-and-white portraits into lifelike full-color memories.",
  inStock: true
  }
  
];

const categories = [
  {
    _id: 'frames',
    title: 'Photo Frames',
    desc: 'Premium wooden, wall & table frames (including customized frames) to cherish your memories.',
    emoji: '📸',
    showcaseProducts: ['f1', 'f16'],  // 8x12 Wall Mount & 12x18 Premium
    subCategories: [
      { name: 'Wooden photo frames', description: 'Classic wooden frames' },
      { name: 'Wall frames', description: 'For wall mounting' },
      { name: 'Table frames', description: 'For desk displays' },
      { name: 'Customized frames', description: 'Personalized frames' }
    ]
  },
  {
    _id: 'magazines',
    title: 'Magazines',
    desc: 'Customized magazines - Birthday, Anniversary, Memory & Story editions.',
    emoji: '📖',
    showcaseProducts: ['m2', 'm3'],  // Story & Anniversary Magazines
    subCategories: [
      { name: 'Birthday magazines', description: 'Special birthday editions' },
      { name: 'Anniversary magazines', description: 'Celebration editions' },
      { name: 'Memory magazines', description: 'Photo-based stories' }
    ]
  },
  {
    _id: 'memories',
    title: 'Polaroids & Photo Books',
    desc: 'Small, medium & large polaroids plus premium photo books & mini albums.',
    emoji: '🎞️',
    showcaseProducts: ['pol1', 'pol2'],  // Polaroids Medium Set & Large Polaroids
    subCategories: [
      { name: 'Polaroids', description: 'Classic polaroid prints' },
      { name: 'Photo books', description: 'Premium photo collections' },
      { name: 'Mini albums', description: 'Portable photo albums' }
    ]
  },
  {
    _id: 'flowers',
    title: 'Flowers & Bouquets',
    desc: 'Fresh bouquets, artificial arrangements, rose boxes & flowers with message cards.',
    emoji: '🌹',
    showcaseProducts: ['bou1', 'bou2'],  // Real Flower Bouquets
    subCategories: [
      { name: 'Fresh bouquets', description: 'Real flowers' },
      { name: 'Rose boxes', description: 'Premium rose collections' },
      { name: 'Artificial arrangements', description: 'Long-lasting designs' }
    ]
  },
  {
    _id: 'hampers',
    title: 'Hampers & Gift Combos',
    desc: 'Birthday, anniversary, couple & custom gift hampers for every occasion.',
    emoji: '🎁',
    showcaseProducts: ['ham2', 'ham3'],  // Anniversary & Couple Hampers
    subCategories: [
      { name: 'Birthday hampers', description: 'Birthday specials' },
      { name: 'Anniversary hampers', description: 'Romantic gift sets' },
      { name: 'Couple combos', description: 'For two' }
    ]
  },
  {
    _id: 'apparel',
    title: 'T-Shirts & Accessories',
    desc: 'Customized & printed t-shirts, keychains & pouches with your designs.',
    emoji: '👕',
    showcaseProducts: ['collared-tshirt', 'cap1'],
    subCategories: [
      { name: 'Collared', description: 'Premium collared t-shirts with fabric options' },
      { name: 'Collarless', description: 'Comfortable collarless t-shirts' },
      { name: 'Signature', description: 'Bulk signature polyester t-shirts with MOQ' },
      { name: 'T-shirts', description: 'Custom printed' },
      { name: 'Keychains', description: 'Personalized' },
      { name: 'Pouches', description: 'Customized bags' }
    ]
  },
  {
    _id: 'essentials',
    title: 'Phone Cases & Cups',
    desc: 'Custom phone cases, photo mugs & personalized cups with high-quality prints.',
    emoji: '📱',
    showcaseProducts: ['case1', 'cup1'],  // Phone Cases & Photo Cups
    subCategories: [
      { name: 'Phone cases', description: 'Protective cases' },
      { name: 'Photo mugs', description: 'Personalized mugs' },
      { name: 'Cups', description: 'Customized drinkware' }
    ]
  },
  {
    _id: 'vintage',
    title: 'Vintage Collection',
    desc: 'Aesthetic vintage frames, retro letters & old-style prints with warm nostalgic tones.',
    emoji: '✨',
    showcaseProducts: ['vf1', 'vl1'],  // Vintage Frame & Vintage Letter
    subCategories: [
      { name: 'Vintage frames', description: 'Old-style frames' },
      { name: 'Retro prints', description: 'Nostalgic designs' },
      { name: 'Vintage letters', description: 'Classic lettering' }
    ]
  },
  {
    _id: 'addons',
    title: 'Calendars & Magnets',
    desc: 'Customized calendars, photo calendars & fridge magnets for your space.',
    emoji: '📅',
    showcaseProducts: ['cal1', 'mag1'],  // Photo Calendar & Fridge Magnet
    subCategories: [
      { name: 'Calendars', description: 'Personalized calendars' },
      { name: 'Photo magnets', description: 'Fridge magnets' },
      { name: 'Desk calendars', description: 'Desktop versions' }
    ]
  },
  {
    _id: 'smart-digital',
    title: 'Smart & Digital Services',
    desc: 'NFC cards, review boards, poster design, photo & video editing services.',
    emoji: '🤖',
    showcaseProducts: ['d1', 'id1'],  // NFC Review Board & ID Card
    subCategories: [
      { name: 'NFC cards', description: 'Digital enabled cards' },
      { name: 'Poster design', description: 'Custom posters' },
      { name: 'Photo editing', description: 'Professional editing' },
      { name: 'Video editing', description: 'Video services' }
    ]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔗 Connected to DB...");

    // Reset loyalty data for a fresh launch
    await User.updateMany({}, { $set: { loyaltyPoints: 0, loyaltyHistory: [] } });
    await Order.updateMany({}, {
      $set: {
        loyaltyDiscount: 0,
        loyaltyPointsRedeemed: 0,
        loyaltyPointsEarned: 0,
        loyaltyCredited: false
      }
    });
    console.log("✅ Loyalty points reset for all users and orders.");
    
    // Clear old data
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log("🗑️ Old data cleared.");

    // Add 2-3 fake reviews to each product (for demo)
    const sampleReviews = [
      { name: 'Riya', rating: 5, comment: 'Absolutely loved it — great quality and fast delivery!' },
      { name: 'Amit', rating: 4, comment: 'Good product, packing could be better.' },
      { name: 'Sneha', rating: 5, comment: 'Perfect gift! Very happy with the print.' },
      { name: 'Karthik', rating: 4, comment: 'Nice finish, colors are vibrant.' },
      { name: 'Priya', rating: 5, comment: 'Exceeded expectations — would buy again.' }
    ];

    products.forEach(p => {
      if (!p.reviews) {
        // pick 2-3 random reviews
        const cnt = Math.floor(Math.random() * 2) + 2; // 2 or 3
        p.reviews = [];
        for (let i = 0; i < cnt; i++) {
          const r = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];
          p.reviews.push({ name: r.name, rating: r.rating, comment: r.comment, createdAt: new Date() });
        }
      }
    });

    // Insert products
    await Product.insertMany(products);
    console.log("✅ Products imported!");
    
    // Insert categories
    await Category.insertMany(categories);
    console.log("✅ Categories imported!");
    
    // Seed demo admin
    await Admin.deleteMany({});
    const demoAdmin = new Admin({
      email: 'infinitycustomizations@gmail.com',
      password: 'infinity@2026',
      name: 'Admin',
      role: 'super_admin',
      permissions: ['view_orders', 'update_orders', 'manage_products', 'manage_categories', 'view_images'],
      isActive: true
    });
    await demoAdmin.save();
    console.log("✅ Demo admin created! Email: infinitycustomizations@gmail.com, Password: infinity@2026");
    
    console.log("✅ SUCCESS: All data imported into MongoDB!");
    
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedDB();
