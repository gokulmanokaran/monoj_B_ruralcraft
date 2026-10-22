import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  Profile,
  Artisan,
  Category,
  Product,
  HSCodeMaster,
  Order,
  CustomsDocument,
  CurrencyRates
} from '../types';

interface DatabaseSchema {
  users: User[];
  profiles: Profile[];
  artisans: Artisan[];
  categories: Category[];
  products: Product[];
  hs_codes: HSCodeMaster[];
  orders: Order[];
  customs_documents: CustomsDocument[];
  currency_rates: CurrencyRates;
  wishlists: { id: string; user_id: string; product_id: string; created_at: string }[];
}

const DB_DIR = path.resolve(process.cwd(), 'server', 'data');
const DB_PATH = path.join(DB_DIR, 'db.json');

const INITIAL_CURRENCY_RATES: CurrencyRates = {
  base: 'INR',
  rates: {
    INR: 1.0,
    USD: 0.01185, // 1 USD ≈ 84.38 INR
    EUR: 0.01095, // 1 EUR ≈ 91.32 INR
    GBP: 0.00938, // 1 GBP ≈ 106.60 INR
    AED: 0.0435,  // 1 AED ≈ 22.98 INR
    AUD: 0.0181,  // 1 AUD ≈ 55.25 INR
    CAD: 0.0163,  // 1 CAD ≈ 61.35 INR
    SGD: 0.0157,  // 1 SGD ≈ 63.69 INR
    JPY: 1.815    // 1 JPY ≈ 0.55 INR
  },
  last_updated: new Date().toISOString()
};

const INITIAL_HS_CODES: HSCodeMaster[] = [
  {
    id: 'hs-1',
    category: 'Bamboo & Cane Handicraft',
    keywords: ['bamboo', 'cane', 'wicker', 'basket', 'reed', 'rattan', 'vegetable materials'],
    hs_code: '4602.11',
    description: 'Basketwork, wickerwork and other articles of vegetable plaiting materials - Of bamboo',
    country_rules: 'Phytosanitary certificate recommended for unprocessed vegetable materials. Heat treatment / fumigation declaration standard for US/EU customs.',
    duty_notes: 'Eligible for preferential artisan trade tariffs in EU (0-2%) and US GSP eligible classification.',
    confidence_rating: 'High'
  },
  {
    id: 'hs-2',
    category: 'Terracotta & Ceramic Pottery',
    keywords: ['terracotta', 'clay', 'pot', 'pottery', 'ceramic', 'earthenware', 'planter', 'bowl', 'mud'],
    hs_code: '6912.00',
    description: 'Ceramic tableware, kitchenware, other household articles and toilet articles, of porcelain, china, or other ceramics (earthenware/terracotta)',
    country_rules: 'Must be lead and cadmium free for food-contact items (FDA compliance declaration for USA, LFGB for EU). Non-food decorative pottery requires standard invoice declaration.',
    duty_notes: 'Standard duty 3-5% in destination countries; handmade certificate from EPCH India provides concessional rate.',
    confidence_rating: 'High'
  },
  {
    id: 'hs-3',
    category: 'Handloom & Woven Textiles',
    keywords: ['cotton', 'handloom', 'woven', 'table runner', 'chanderi', 'khadi', 'tote', 'fabric', 'shawl'],
    hs_code: '5208.52',
    description: 'Handwoven plain weave cotton fabrics containing 85% or more by weight of cotton, dyed or printed',
    country_rules: 'Fiber content and wash care label mandatory for commercial import into EU and North America.',
    duty_notes: 'Subject to Rules of Origin documentation under CEPA / Free Trade Agreements.',
    confidence_rating: 'High'
  },
  {
    id: 'hs-4',
    category: 'Woodcraft & Carvings',
    keywords: ['wood', 'wooden', 'teak', 'rosewood', 'carved', 'tray', 'serving', 'sheesham', 'bowl'],
    hs_code: '4419.90',
    description: 'Tableware and kitchenware, of wood, other than bamboo',
    country_rules: 'Requires declaration that timber is sourced from sustainable plantations (Vriksh / CITES non-infringement certificate for rosewood/sheesham).',
    duty_notes: 'Customs duty generally 0-3.5% in US, UK, and Australia.',
    confidence_rating: 'High'
  },
  {
    id: 'hs-5',
    category: 'Jute & Natural Fiber Crafts',
    keywords: ['jute', 'burlap', 'hessian', 'bag', 'tote', 'natural fiber', 'eco bag'],
    hs_code: '4202.22',
    description: 'Handbags, with outer surface of textile materials / vegetable fibers (including jute)',
    country_rules: 'Eco-friendly and biodegradable natural fiber classification; fast-track customs clearance.',
    duty_notes: 'GSP duty concession available across GCC and European markets.',
    confidence_rating: 'High'
  },
  {
    id: 'hs-6',
    category: 'Traditional Clay Lamps & Diyas',
    keywords: ['lamp', 'diya', 'clay lamp', 'oil lamp', 'candle holder', 'terracotta lamp', 'earthen lamp'],
    hs_code: '9405.50',
    description: 'Non-electrical lamps and lighting fittings, of base materials / earthenware',
    country_rules: 'Packed with shock-absorbent eco-packaging; fragile goods label required.',
    duty_notes: 'Cultural craft exemption often accepted under folk-art customs schedules.',
    confidence_rating: 'High'
  },
  {
    id: 'hs-7',
    category: 'Brass & Bell Metal Handicraft',
    keywords: ['brass', 'dokra', 'bell metal', 'metal craft', 'bronze', 'tribal', 'figurine', 'sculpture'],
    hs_code: '8306.29',
    description: 'Statuettes and other ornaments, of base metal, not plated with precious metal (Lost wax casting / Dokra)',
    country_rules: 'Must state "Contemporary Artisan Craftwork - Not an Antique or Cultural Heritage Relic (>100 years old)" for Archaeological Survey of India clearance exemption.',
    duty_notes: 'Standard industrial duty 2.5%, duty-free under special handmade handicraft treaties.',
    confidence_rating: 'High'
  },
  {
    id: 'hs-8',
    category: 'Home Furnishing & Linen',
    keywords: ['cushion', 'curtain', 'table cloth', 'runner', 'linen', 'bedspread', 'furnishing'],
    hs_code: '6304.92',
    description: 'Other furnishing articles, not knitted or crocheted, of cotton (Table runners, wall hangings)',
    country_rules: 'Textile composition disclosure required on commercial invoice.',
    duty_notes: 'Preferential tariff rate under India-UK FTA / Indo-Pacific frameworks.',
    confidence_rating: 'Medium'
  }
];

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Bamboo Crafts',
    slug: 'bamboo-crafts',
    icon: '🎋',
    description: 'Handwoven bamboo baskets, trays, and sustainably harvested cane utilities from northeastern India.',
    suggested_hs_code: '4602.11'
  },
  {
    id: 'cat-2',
    name: 'Clay & Terracotta',
    slug: 'clay-terracotta',
    icon: '🏺',
    description: 'Earthen planters, unglazed cooking vessels, and traditional decorative lamps shaped on village potter wheels.',
    suggested_hs_code: '6912.00'
  },
  {
    id: 'cat-3',
    name: 'Handloom & Textiles',
    slug: 'handloom-textiles',
    icon: '🧵',
    description: 'Pure cotton dupattas, organic table runners, and naturally dyed heritage weaves.',
    suggested_hs_code: '5208.52'
  },
  {
    id: 'cat-4',
    name: 'Woodwork & Carvings',
    slug: 'woodwork-carvings',
    icon: '🪵',
    description: 'Artisan carved teak, sheesham, and mango wood serving ware with botanical motifs.',
    suggested_hs_code: '4419.90'
  },
  {
    id: 'cat-5',
    name: 'Jute & Eco Bags',
    slug: 'jute-eco-bags',
    icon: '👜',
    description: 'Biodegradable golden jute totes, conference folders, and embroidered lifestyle accessories.',
    suggested_hs_code: '4202.22'
  },
  {
    id: 'cat-6',
    name: 'Brass & Metal Craft',
    slug: 'brass-metal-craft',
    icon: '✨',
    description: 'Ancient 4,000-year-old lost-wax Dokra brass castings hand-molded by tribal master smiths.',
    suggested_hs_code: '8306.29'
  }
];

export function getInitialDatabase(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('Admin@123', salt);
  const artisanHash = bcrypt.hashSync('Artisan@123', salt);
  const customerHash = bcrypt.hashSync('Customer@123', salt);

  const users: User[] = [
    {
      id: 'usr-admin',
      email: 'admin@ruralcraft.global',
      password_hash: adminHash,
      full_name: 'Dr. Vikramaditya Sen',
      phone: '+91 98200 12345',
      role: 'admin',
      created_at: '2026-01-15T10:00:00Z'
    },
    {
      id: 'usr-artisan-1',
      email: 'artisan@lakshmi.in',
      password_hash: artisanHash,
      full_name: 'Lakshmi Ammal',
      phone: '+91 94432 55678',
      role: 'artisan',
      created_at: '2026-01-20T11:30:00Z'
    },
    {
      id: 'usr-artisan-2',
      email: 'villagecraft@crafts.in',
      password_hash: artisanHash,
      full_name: 'Rameshwar Mahato',
      phone: '+91 98311 88722',
      role: 'artisan',
      created_at: '2026-02-01T09:15:00Z'
    },
    {
      id: 'usr-customer',
      email: 'john.doe@example.com',
      password_hash: customerHash,
      full_name: 'Johnathan Doe',
      phone: '+1 415 555 0192',
      role: 'customer',
      created_at: '2026-02-10T14:20:00Z'
    }
  ];

  const profiles: Profile[] = [
    {
      id: 'prof-admin',
      user_id: 'usr-admin',
      bio: 'Head of Customs & International Trade Logistics at RuralCraft Global.',
      default_currency: 'USD',
      country: 'India',
      city: 'New Delhi'
    },
    {
      id: 'prof-artisan-1',
      user_id: 'usr-artisan-1',
      bio: 'Master weaver and bamboo craftsman preserving indigenous Assamese basketry techniques passed down for 4 generations.',
      default_currency: 'INR',
      country: 'India',
      city: 'Majuli Island',
      address_line: 'Garamur Village, Majuli, Assam 785104'
    },
    {
      id: 'prof-artisan-2',
      user_id: 'usr-artisan-2',
      bio: 'Terracotta artisan leading a collective of 28 rural potters from Bankura district.',
      default_currency: 'INR',
      country: 'India',
      city: 'Panchmura',
      address_line: 'Kumbhakar Para, Panchmura, West Bengal 722156'
    },
    {
      id: 'prof-customer',
      user_id: 'usr-customer',
      bio: 'Interior designer and fair-trade craft enthusiast based in San Francisco.',
      default_currency: 'USD',
      country: 'United States',
      city: 'San Francisco',
      address_line: '450 Mission Street, Apt 12B, San Francisco, CA 94105'
    }
  ];

  const artisans: Artisan[] = [
    {
      id: 'art-1',
      user_id: 'usr-artisan-1',
      brand_name: 'Lakshmi Handicrafts',
      craft_type: 'Assam Bamboo & Handloom',
      story: 'Founded in the river island of Majuli, Assam, Lakshmi Handicrafts empowers over 60 rural women who weave wild river reeds and native bamboo into zero-waste global home goods.',
      location: 'Majuli Island, Assam',
      village: 'Garamur Satra',
      state: 'Assam',
      country: 'India',
      verified: true,
      rating: 4.95,
      total_sales: 342,
      image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop',
      phone: '+91 94432 55678',
      iec_code: '0518099341'
    },
    {
      id: 'art-2',
      user_id: 'usr-artisan-2',
      brand_name: 'VillageCraft Collective',
      craft_type: 'Bankura Terracotta & Clay',
      story: 'Reviving ancient terracotta wheel sculpting and unglazed red earthenware kiln techniques from rural Bengal, creating functional kitchen and garden art.',
      location: 'Panchmura, West Bengal',
      village: 'Panchmura',
      state: 'West Bengal',
      country: 'India',
      verified: true,
      rating: 4.88,
      total_sales: 215,
      image_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800&auto=format&fit=crop',
      phone: '+91 98311 88722',
      iec_code: '0519128842'
    },
    {
      id: 'art-3',
      user_id: 'usr-artisan-3',
      brand_name: 'GreenRoot Artisans',
      craft_type: 'Natural Jute & Organic Cotton',
      story: 'Working with coastal rural weavers in Tamil Nadu and West Bengal to craft high-density golden jute and hand-spun cotton carry goods designed for eco-conscious international lifestyles.',
      location: 'Madurai, Tamil Nadu',
      village: 'Thirunagar',
      state: 'Tamil Nadu',
      country: 'India',
      verified: true,
      rating: 4.92,
      total_sales: 512,
      image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
      phone: '+91 98401 23490',
      iec_code: '0520034199'
    },
    {
      id: 'art-4',
      user_id: 'usr-artisan-4',
      brand_name: 'Sathy Rural Crafts',
      craft_type: 'Teak Woodcarving & Dokra Metal',
      story: 'Masters of sacred timber carving and lost-wax brass sculpting, carrying forward centuries-old tribal traditions with verified sustainable teak wood.',
      location: 'Sathyamangalam, Karnataka',
      village: 'Bhavani Valley',
      state: 'Karnataka',
      country: 'India',
      verified: true,
      rating: 4.89,
      total_sales: 184,
      image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
      phone: '+91 98455 67891',
      iec_code: '0517882901'
    }
  ];

  const products: Product[] = [
    {
      id: 'prod-1',
      artisan_id: 'art-1',
      artisan_name: 'Lakshmi Handicrafts',
      category_id: 'cat-1',
      category_name: 'Bamboo Crafts',
      name: 'Handmade Bamboo Fruit & Bread Basket',
      slug: 'handmade-bamboo-basket',
      description: 'Meticulously hand-plaited from sustainably harvested river bamboo of Majuli Island. Finished with food-grade virgin walnut oil, this shallow oval basket provides optimal ventilation for artisan sourdough, tropical fruits, and artisanal dining presentations.',
      price_inr: 1200,
      stock: 24,
      weight_kg: 0.45,
      dimensions: '32 cm x 24 cm x 10 cm',
      material: '100% Native River Bamboo (Bambusa tulda)',
      country_of_origin: 'India',
      images: [
        'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop'
      ],
      suggested_hs_code: '4602.11',
      hs_confidence: 'High',
      hs_code_verified: true,
      status: 'active',
      created_at: '2026-01-22T10:00:00Z',
      rating: 4.9,
      reviews_count: 38
    },
    {
      id: 'prod-2',
      artisan_id: 'art-2',
      artisan_name: 'VillageCraft Collective',
      category_id: 'cat-2',
      category_name: 'Clay & Terracotta',
      name: 'Terracotta Traditional Clay Flower Pot',
      slug: 'terracotta-flower-pot',
      description: 'Wheel-thrown earthen terracotta planter crafted from alluvial river clay and fired in traditional wood kilns. Porous clay walls allow roots to breathe naturally and prevent moisture stagnation.',
      price_inr: 850,
      stock: 35,
      weight_kg: 1.2,
      dimensions: '20 cm Diameter x 22 cm Height',
      material: 'Natural Alluvial Clay & Terracotta Fired Earth',
      country_of_origin: 'India',
      images: [
        'https://images.unsplash.com/photo-1514517521153-1be72277b32f?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=1000&auto=format&fit=crop'
      ],
      suggested_hs_code: '6912.00',
      hs_confidence: 'High',
      hs_code_verified: true,
      status: 'active',
      created_at: '2026-01-25T14:30:00Z',
      rating: 4.8,
      reviews_count: 27
    },
    {
      id: 'prod-3',
      artisan_id: 'art-3',
      artisan_name: 'GreenRoot Artisans',
      category_id: 'cat-3',
      category_name: 'Handloom & Textiles',
      name: 'Handwoven Organic Cotton Tote Bag',
      slug: 'handwoven-cotton-bag',
      description: 'Woven on indigenous wooden pit-looms using certified unbleached organic Indian cotton. Features double-reinforced stress points, comfortable wide shoulder straps, and natural indigo plant accents.',
      price_inr: 1450,
      stock: 42,
      weight_kg: 0.35,
      dimensions: '40 cm x 38 cm x 12 cm',
      material: '100% Handloom Organic Cotton & Plant Dye',
      country_of_origin: 'India',
      images: [
        'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop'
      ],
      suggested_hs_code: '5208.52',
      hs_confidence: 'High',
      hs_code_verified: true,
      status: 'active',
      created_at: '2026-02-02T11:00:00Z',
      rating: 4.95,
      reviews_count: 64
    },
    {
      id: 'prod-4',
      artisan_id: 'art-4',
      artisan_name: 'Sathy Rural Crafts',
      category_id: 'cat-4',
      category_name: 'Woodwork & Carvings',
      name: 'Hand-Carved Teak Wood Serving Tray',
      slug: 'wooden-serving-tray',
      description: 'Sculpted from reclaimed plantation teak timber with sculpted handles and a protective organic beeswax coating. Each piece reveals unique warm honey grain patterns and floral relief edges.',
      price_inr: 2200,
      stock: 18,
      weight_kg: 1.1,
      dimensions: '45 cm x 28 cm x 4 cm',
      material: 'Sustainably Farmed Teakwood (Tectona grandis)',
      country_of_origin: 'India',
      images: [
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000&auto=format&fit=crop'
      ],
      suggested_hs_code: '4419.90',
      hs_confidence: 'High',
      hs_code_verified: true,
      status: 'active',
      created_at: '2026-02-04T16:00:00Z',
      rating: 4.88,
      reviews_count: 19
    },
    {
      id: 'prod-5',
      artisan_id: 'art-3',
      artisan_name: 'GreenRoot Artisans',
      category_id: 'cat-5',
      category_name: 'Jute & Eco Bags',
      name: 'Natural Golden Jute Embroidered Handbag',
      slug: 'handmade-jute-bag',
      description: 'Premium biodegradable golden jute woven bag with hand-embroidered Kantha stitch borders, comfortable cotton rope handles, and an inner zipped pocket for passports and keys.',
      price_inr: 950,
      stock: 50,
      weight_kg: 0.4,
      dimensions: '35 cm x 30 cm x 10 cm',
      material: '100% Golden Jute Fiber with Cotton Lining',
      country_of_origin: 'India',
      images: [
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop'
      ],
      suggested_hs_code: '4202.22',
      hs_confidence: 'High',
      hs_code_verified: true,
      status: 'active',
      created_at: '2026-02-06T09:20:00Z',
      rating: 4.75,
      reviews_count: 22
    },
    {
      id: 'prod-6',
      artisan_id: 'art-2',
      artisan_name: 'VillageCraft Collective',
      category_id: 'cat-2',
      category_name: 'Clay & Terracotta',
      name: 'Traditional Terracotta Clay Oil Lamp (Diya Set)',
      slug: 'traditional-clay-lamp',
      description: 'Set of 4 handcrafted terracotta temple oil lamps hand-molded with ornate peacock and lotus petal engravings. Suitable for aromatherapy, meditation rooms, and festive table decor.',
      price_inr: 600,
      stock: 60,
      weight_kg: 0.6,
      dimensions: '12 cm x 10 cm x 6 cm each',
      material: 'Purified Red Terracotta Clay with Natural Mineral Pigments',
      country_of_origin: 'India',
      images: [
        'https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1514517521153-1be72277b32f?q=80&w=1000&auto=format&fit=crop'
      ],
      suggested_hs_code: '9405.50',
      hs_confidence: 'High',
      hs_code_verified: true,
      status: 'active',
      created_at: '2026-02-08T13:45:00Z',
      rating: 4.92,
      reviews_count: 45
    },
    {
      id: 'prod-7',
      artisan_id: 'art-1',
      artisan_name: 'Lakshmi Handicrafts',
      category_id: 'cat-3',
      category_name: 'Handloom & Textiles',
      name: 'Handloom Chanderi Cotton Silk Table Runner',
      slug: 'handloom-table-runner',
      description: 'Woven with high-twist combed cotton and cruelty-free tussar silk yarn on a century-old pit loom. Adorned with delicate hand-block printed floral bootis using madder root and turmeric dyes.',
      price_inr: 1800,
      stock: 22,
      weight_kg: 0.3,
      dimensions: '180 cm x 36 cm',
      material: '70% Handloom Cotton, 30% Wild Tussar Silk',
      country_of_origin: 'India',
      images: [
        'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000&auto=format&fit=crop'
      ],
      suggested_hs_code: '6304.92',
      hs_confidence: 'High',
      hs_code_verified: true,
      status: 'active',
      created_at: '2026-02-12T10:15:00Z',
      rating: 4.86,
      reviews_count: 31
    },
    {
      id: 'prod-8',
      artisan_id: 'art-1',
      artisan_name: 'Lakshmi Handicrafts',
      category_id: 'cat-1',
      category_name: 'Bamboo Crafts',
      name: 'Multipurpose Bamboo Storage Laundry Basket',
      slug: 'bamboo-storage-basket',
      description: 'Tall cylindrical woven basket with ergonomic built-in handles and a snug fitting lid. Crafted from aged Assam yellow bamboo split by hand and cross-woven for superior structural strength and lifetime durability.',
      price_inr: 2500,
      stock: 15,
      weight_kg: 1.4,
      dimensions: '42 cm Diameter x 50 cm Height',
      material: 'Assam Solid Bamboo with Organic Cane Binding',
      country_of_origin: 'India',
      images: [
        'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop'
      ],
      suggested_hs_code: '4602.11',
      hs_confidence: 'High',
      hs_code_verified: true,
      status: 'active',
      created_at: '2026-02-15T15:20:00Z',
      rating: 4.96,
      reviews_count: 53
    },
    {
      id: 'prod-9',
      artisan_id: 'art-4',
      artisan_name: 'Sathy Rural Crafts',
      category_id: 'cat-6',
      category_name: 'Brass & Metal Craft',
      name: 'Dokra Brass Tribal Dancing Figurine',
      slug: 'dokra-brass-figurine',
      description: 'Created using the primordial lost-wax cire-perdue method by indigenous artisans. Melted brass is poured into beeswax and clay molds that are broken after cooling, making every single statuette an unrepeatable original piece of world folk art.',
      price_inr: 3400,
      stock: 9,
      weight_kg: 1.8,
      dimensions: '18 cm x 12 cm x 30 cm',
      material: 'Recycled Antique Brass & Bell Metal Alloy',
      country_of_origin: 'India',
      images: [
        'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=1000&auto=format&fit=crop'
      ],
      suggested_hs_code: '8306.29',
      hs_confidence: 'High',
      hs_code_verified: true,
      status: 'active',
      created_at: '2026-02-18T12:00:00Z',
      rating: 5.0,
      reviews_count: 14
    }
  ];

  const initialOrder: Order = {
    id: 'ord-1001',
    order_number: 'RCG-2026-000101',
    user_id: 'usr-customer',
    customer_name: 'Johnathan Doe',
    customer_email: 'john.doe@example.com',
    customer_phone: '+1 415 555 0192',
    items: [
      {
        product_id: 'prod-1',
        product_name: 'Handmade Bamboo Fruit & Bread Basket',
        artisan_id: 'art-1',
        artisan_name: 'Lakshmi Handicrafts',
        quantity: 2,
        price_inr: 1200,
        converted_price: 14.22,
        suggested_hs_code: '4602.11',
        weight_kg: 0.45,
        image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=1000&auto=format&fit=crop'
      },
      {
        product_id: 'prod-3',
        product_name: 'Handwoven Organic Cotton Tote Bag',
        artisan_id: 'art-3',
        artisan_name: 'GreenRoot Artisans',
        quantity: 1,
        price_inr: 1450,
        converted_price: 17.18,
        suggested_hs_code: '5208.52',
        weight_kg: 0.35,
        image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop'
      }
    ],
    total_inr: 3850,
    selected_currency: 'USD',
    exchange_rate: 0.01185,
    converted_total: 45.62,
    shipping_address: {
      full_name: 'Johnathan Doe',
      email: 'john.doe@example.com',
      phone: '+1 415 555 0192',
      address: '450 Mission Street, Apt 12B',
      city: 'San Francisco',
      state: 'CA',
      country: 'United States',
      postal_code: '94105'
    },
    status: 'Shipped',
    tracking_number: 'DHL-EXP-992381203',
    created_at: '2026-02-20T14:35:00Z',
    customs_document_id: 'cust-1001'
  };

  const initialCustomsDoc: CustomsDocument = {
    id: 'cust-1001',
    order_id: 'ord-1001',
    order_number: 'RCG-2026-000101',
    invoice_number: 'RCG-INV-2026-000101',
    invoice_date: '2026-02-20',
    exporter: {
      name: 'Lakshmi Handicrafts & RuralCraft Global Collective',
      organization: 'Rural Artisan Export Consortium of India',
      address: 'Garamur Village, Majuli Island, Assam 785104, India',
      iec_code: '0518099341',
      gstin: '18AAACL9012M1Z2',
      country: 'India',
      contact: 'customs-export@ruralcraft.global'
    },
    buyer: {
      name: 'Johnathan Doe',
      address: '450 Mission Street, Apt 12B',
      city: 'San Francisco',
      state: 'CA',
      country: 'United States',
      postal_code: '94105',
      email: 'john.doe@example.com',
      phone: '+1 415 555 0192'
    },
    country_of_origin: 'India',
    destination_country: 'United States',
    items: [
      {
        product_name: 'Handmade Bamboo Fruit & Bread Basket',
        hs_code: '4602.11',
        quantity: 2,
        unit_price_inr: 1200,
        total_price_inr: 2400,
        unit_price_converted: 14.22,
        total_price_converted: 28.44,
        weight_kg: 0.9
      },
      {
        product_name: 'Handwoven Organic Cotton Tote Bag',
        hs_code: '5208.52',
        quantity: 1,
        unit_price_inr: 1450,
        total_price_inr: 1450,
        unit_price_converted: 17.18,
        total_price_converted: 17.18,
        weight_kg: 0.35
      }
    ],
    currency: 'USD',
    exchange_rate: 0.01185,
    total_value_inr: 3850,
    total_value_converted: 45.62,
    total_weight_kg: 1.25,
    declaration: 'I hereby certify that the information provided in this document is accurate to the best of my knowledge and that the goods are authentic handmade crafts of Indian rural origin.',
    disclaimer: 'HS code shown is a system suggestion and must be verified by the exporter/customs professional. Student demo platform — not legally certified.',
    verification_status: 'Admin_Verified',
    verified_by: 'Dr. Vikramaditya Sen (Admin)',
    verified_at: '2026-02-21T09:00:00Z',
    created_at: '2026-02-20T14:35:00Z'
  };

  return {
    users,
    profiles,
    artisans,
    categories: INITIAL_CATEGORIES,
    products,
    hs_codes: INITIAL_HS_CODES,
    orders: [initialOrder],
    customs_documents: [initialCustomsDoc],
    currency_rates: INITIAL_CURRENCY_RATES,
    wishlists: [
      {
        id: 'wish-1',
        user_id: 'usr-customer',
        product_id: 'prod-4',
        created_at: '2026-02-15T12:00:00Z'
      }
    ]
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDir();
    this.data = this.loadData();
  }

  private ensureDir() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error loading database, initializing defaults:', err);
    }
    const initial = getInitialDatabase();
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save database file:', err);
    }
  }

  public get<K extends keyof DatabaseSchema>(collection: K): DatabaseSchema[K] {
    return this.data[collection];
  }

  public set<K extends keyof DatabaseSchema>(collection: K, value: DatabaseSchema[K]) {
    this.data[collection] = value;
    this.saveData(this.data);
  }

  public mutate(callback: (draft: DatabaseSchema) => void) {
    callback(this.data);
    this.saveData(this.data);
  }
}

export const db = new Database();
