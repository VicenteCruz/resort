/* ==========================================================================
   Platinum Yucatán Princess — Verified Trip & Resort Dataset
   Stay: Nov 28 – Dec 8, 2026 (10 Nights)
   Flights: AC 811 -> AC 1812 (Outbound) | AC 1373 -> AC 810 (Return)
   ========================================================================== */

window.DEFAULT_TRIP_DATA = {
  version: 1,
  wallet: {
    travelerName: 'Vicente Cruz',
    airCanadaPnr: '',
    resortBookingRef: '',
    suiteBuilding: 'Suite TBD (Check-in Nov 28)',
    transferProvider: 'NexusTours / Pre-booked Shuttle',
    canadaEta: 'Ready',
    mexicoVisitax: 'Pending',
    notes: 'Remember: 50% off Spa massages if booked within first 24h of arrival. Bring US Type A/B plug adapter (110V) and closed shoes + long trousers for à la carte dinners.'
  },

  flights: {
    outbound: {
      dateLabel: 'Saturday, 28 November 2026',
      summary: 'Lisbon (LIS) → Toronto (YYZ) → Cancún (CUN)',
      totalJourney: '~16h 15m door-to-airport + 48m resort transfer',
      legs: [
        {
          id: 'ac811',
          flightNumber: 'AC 811',
          airline: 'Air Canada',
          aircraft: 'Boeing 787-8 Dreamliner',
          fromCode: 'LIS',
          fromCity: 'Lisbon Humberto Delgado',
          fromTerminal: 'Terminal 1',
          depTime: '10:55',
          depTz: 'WET (UTC+0)',
          depIso: '2026-11-28T10:55:00Z',
          toCode: 'YYZ',
          toCity: 'Toronto Pearson Intl',
          toTerminal: 'Terminal 1',
          arrTime: '14:00',
          arrTz: 'EST (UTC-5)',
          duration: '8h 05m',
          gate: 'TBD',
          seat: 'TBD',
          baggageNote: 'Checked through to CUN (verify CUN tag at LIS bag drop)'
        },
        {
          id: 'ac1812',
          flightNumber: 'AC 1812',
          airline: 'Air Canada',
          aircraft: 'Boeing 737 MAX 8',
          fromCode: 'YYZ',
          fromCity: 'Toronto Pearson Intl',
          fromTerminal: 'Terminal 1',
          depTime: '17:10',
          depTz: 'EST (UTC-5)',
          depIso: '2026-11-28T22:10:00Z',
          toCode: 'CUN',
          toCity: 'Cancún International',
          toTerminal: 'Terminal 3',
          arrTime: '20:10',
          arrTz: 'EST (UTC-5)',
          duration: '4h 00m',
          gate: 'F / E Gates',
          seat: 'TBD',
          baggageNote: 'Claim bags at CUN Terminal 3 after Mexican immigration'
        }
      ],
      layovers: [
        {
          afterLegId: 'ac811',
          title: 'Toronto Pearson (YYZ) Terminal 1 — 3h 10m International Transit',
          badge: 'Same Terminal (T1)',
          steps: [
            'Follow the purple "Connections — International (E Gates)" signs inside Terminal 1; do not exit to Canadian baggage claim.',
            'Have your passport and Canada eTA ready for the quick automated transit verification kiosk.',
            'Clear transit security screening and head to International departures (Air Canada Maple Leaf Lounge is near Gate E77 if eligible).',
            'Toronto (EST) and Cancún (Quintana Roo EST) share the exact same clock time in November/December—no timezone shift on Leg 2!'
          ]
        },
        {
          afterLegId: 'ac1812',
          title: 'Cancún Terminal 3 Arrival → Platinum Yucatán Princess (~48 min)',
          badge: 'Late Arrival Plan',
          steps: [
            'Clear Mexican immigration (e-Gates available for eligible biometric passports; keep receipt if printed) and collect luggage.',
            'Walk straight past the indoor timeshare/taxi "shark tank" corridor without stopping until you exit outdoors to the official pre-booked transfer area.',
            'Drive ~52 km south on Federal Hwy 307 to Playa del Carmen (~21:45 arrival at resort).',
            'Hungry after check-in? Yucatán Buffet serves late snacks & drinks 22:30–07:00, Plaza Bar is open 24h, and 24/7 Room Service is included!'
          ]
        }
      ]
    },

    inbound: {
      dateLabel: 'Tuesday, 8 December 2026 (Arrives 9 Dec)',
      summary: 'Cancún (CUN) → Toronto (YYZ) → Lisbon (LIS)',
      totalJourney: 'Depart resort ~11:15 · Land in Lisbon 08:55 Wed 9 Dec',
      legs: [
        {
          id: 'ac1373',
          flightNumber: 'AC 1373',
          airline: 'Air Canada',
          aircraft: 'Boeing 737 MAX 8',
          fromCode: 'CUN',
          fromCity: 'Cancún International',
          fromTerminal: 'Terminal 3',
          depTime: '15:10',
          depTz: 'EST (UTC-5)',
          depIso: '2026-12-08T20:10:00Z',
          toCode: 'YYZ',
          toCity: 'Toronto Pearson Intl',
          toTerminal: 'Terminal 1',
          arrTime: '19:05',
          arrTz: 'EST (UTC-5)',
          duration: '3h 55m',
          gate: 'TBD',
          seat: 'TBD',
          baggageNote: 'Check bags through to LIS at Air Canada CUN Terminal 3 desk'
        },
        {
          id: 'ac810',
          flightNumber: 'AC 810',
          airline: 'Air Canada',
          aircraft: 'Boeing 787-9 Dreamliner',
          fromCode: 'YYZ',
          fromCity: 'Toronto Pearson Intl',
          fromTerminal: 'Terminal 1',
          depTime: '20:55',
          depTz: 'EST (UTC-5)',
          depIso: '2026-12-09T01:55:00Z',
          toCode: 'LIS',
          toCity: 'Lisbon Humberto Delgado',
          toTerminal: 'Terminal 1',
          arrTime: '08:55 +1',
          arrTz: 'WET (UTC+0)',
          duration: '7h 00m',
          gate: 'E Gates',
          seat: 'TBD',
          baggageNote: 'Arrives Wednesday 9 December morning in Lisbon T1'
        }
      ],
      layovers: [
        {
          beforeFirstLeg: true,
          title: 'Resort Check-Out & CUN Terminal 3 Departure Prep',
          badge: 'Pickup ~11:15',
          steps: [
            'Check out at Platinum Lobby by 11:00–11:15 (allow 50 min drive + 3h international check-in buffer at CUN T3).',
            'Keep your Quintana Roo Visitax QR payment screenshot handy on your phone before entering CUN security.',
            'Return room towel cards and verify safe (46×21.5×34 cm) is completely empty.'
          ]
        },
        {
          afterLegId: 'ac1373',
          title: 'Toronto Pearson (YYZ) Terminal 1 — 1h 50m Connection to Lisbon',
          badge: 'Efficient Transit',
          steps: [
            'Follow purple International Connections signs inside Terminal 1 directly to the E-gate pier.',
            'Your bags transfer automatically between AC 1373 and AC 810 unless instructed otherwise at CUN.',
            'Set watch +5 hours ahead for morning arrival in Lisbon (08:55 WET on Wed 9 Dec).'
          ]
        }
      ]
    }
  },

  venues: [
    {
      id: 'yucatan-buffet',
      name: 'Yucatán Buffet',
      category: 'buffet',
      location: 'Platinum Yucatán Main Plaza',
      cuisine: 'International & Mexican Gastronomy',
      included: true,
      reservationRequired: false,
      dressCode: 'Casual (dry clothing, sleeved shirt for men, footwear required)',
      hoursLabel: '07:00–10:30 · 12:00–15:00 · 18:00–22:00 · Late Snacks 22:30–07:00',
      openIntervals: [
        { start: '07:00', end: '10:30' },
        { start: '12:00', end: '15:00' },
        { start: '18:00', end: '22:00' },
        { start: '22:30', end: '07:00' }
      ],
      description: 'Show-cooking stations, fresh tropical fruit, chilaquiles & omelet bar in the morning, themed dinners, and overnight snack service—ideal on your Nov 28 arrival night.',
      visited: false,
      favorite: false
    },
    {
      id: 'kotatsu',
      name: 'Kotatsu',
      category: 'alacarte',
      location: 'Platinum Yucatán Dining Promenade',
      cuisine: 'Asian Fusion, Sushi & Teppanyaki',
      included: true,
      reservationRequired: true,
      dressCode: 'Smart Casual (Men: long trousers, closed shoes, sleeved shirt)',
      hoursLabel: 'Dinner 18:00–22:00',
      openIntervals: [{ start: '18:00', end: '22:00' }],
      description: 'Signature Asian à la carte featuring sushi rolls, wok specialties, and live Teppanyaki grill tables. Reserve Teppanyaki early in your stay with the Platinum concierge!',
      visited: false,
      favorite: true
    },
    {
      id: 'bruschetta',
      name: 'La Bruschetta',
      category: 'alacarte',
      location: 'Platinum Yucatán Dining Promenade',
      cuisine: 'Trattoria & Artisanal Italian',
      included: true,
      reservationRequired: false,
      dressCode: 'Smart Casual (Men: long trousers, closed shoes, sleeved shirt)',
      hoursLabel: 'Dinner 18:00–22:00',
      openIntervals: [{ start: '18:00', end: '22:00' }],
      description: 'Refined Italian antipasti, handmade pastas, risottos, and wood-oven flavors in an intimate air-conditioned dining room with outdoor terrace.',
      visited: false,
      favorite: false
    },
    {
      id: 'rodeo-grill',
      name: 'Rodeo Grill',
      category: 'alacarte',
      location: 'Poolside & Lagoon Terrace',
      cuisine: 'Prime Steakhouse & Tex-Mex Grill',
      included: true,
      reservationRequired: false,
      dressCode: 'Day: Resort Casual · Dinner: Smart Casual (long trousers & closed shoes)',
      hoursLabel: 'Breakfast 07:00–10:00 · Lunch 12:00–15:00 · Dinner 18:00–22:00',
      openIntervals: [
        { start: '07:00', end: '10:00' },
        { start: '12:00', end: '15:00' },
        { start: '18:00', end: '22:00' }
      ],
      description: 'À la carte breakfast and grilled lunches by day; prime cuts & Tex-Mex by night. Ask concierge to book the romantic over-water Canopy nesting tables!',
      visited: false,
      favorite: true
    },
    {
      id: 'aroma',
      name: 'Aroma',
      category: 'alacarte',
      location: 'Platinum Yucatán Main Building',
      cuisine: 'Contemporary International Gourmet',
      included: true,
      reservationRequired: false,
      dressCode: 'Smart Casual (Men: long trousers, closed shoes, sleeved shirt)',
      hoursLabel: 'Dinner 18:00–22:00',
      openIntervals: [{ start: '18:00', end: '22:00' }],
      description: 'Fine contemporary tasting plates, seafood, and gourmet international entrées under warm golden pendant lighting.',
      visited: false,
      favorite: false
    },
    {
      id: 'skylights',
      name: 'Skylights',
      category: 'alacarte',
      location: 'Exclusive Rooftop Terrace',
      cuisine: 'Mediterranean Gourmet & Wine Pairing',
      included: false,
      reservationRequired: true,
      dressCode: 'Smart Elegant (Men: dress trousers, closed shoes, collared shirt)',
      hoursLabel: '18:00–23:00 (Extra charge · Verify seasonal opening with concierge)',
      openIntervals: [{ start: '18:00', end: '23:00' }],
      description: 'Elevated rooftop dining overlooking the jungle canopy toward Cozumel. Not part of standard all-inclusive; check availability at concierge for special celebrations.',
      visited: false,
      favorite: false
    },
    {
      id: 'gelato-coffee',
      name: 'Gelato & Coffee House',
      category: 'bars',
      location: 'Opposite Kotatsu & Bruschetta',
      cuisine: 'Artisanal Gelato, Espresso & Pastries',
      included: true,
      reservationRequired: false,
      dressCode: 'Resort Casual (dry clothes)',
      hoursLabel: 'Daily 16:00–20:00',
      openIntervals: [{ start: '16:00', end: '20:00' }],
      description: 'Perfect post-pool afternoon stop for iced lattes, cappuccinos, sweet crêpes, and scoops of house gelato before getting ready for dinner.',
      visited: false,
      favorite: false
    },
    {
      id: 'plaza-bar',
      name: 'Plaza Bar (24 Hours)',
      category: 'bars',
      location: 'Central Open-Air Plaza',
      cuisine: 'Premium Cocktails, Live Bands & Nightly Shows',
      included: true,
      reservationRequired: false,
      dressCode: 'Resort Casual',
      hoursLabel: 'Open 24 Hours',
      openIntervals: [{ start: '00:00', end: '24:00' }],
      description: 'Open around the clock with premium spirits, evening live bands, Reggae night, and social lounge seating.',
      visited: false,
      favorite: false
    },
    {
      id: 'platinum-pool-bar',
      name: 'Platinum & Main Swim-Up Bars',
      category: 'bars',
      location: 'Crystal Pools & Building 5 Swim-Out',
      cuisine: 'Swim-Up Tropical Cocktails & Aguachile/Poolside Service',
      included: true,
      reservationRequired: false,
      dressCode: 'Swimwear',
      hoursLabel: 'Daily 09:00–18:00 (Plus Beach Bar 09:00–18:00)',
      openIntervals: [{ start: '09:00', end: '18:00' }],
      description: 'Two wet swim-up pool bars plus beachfront palapa service. Tip: bring an insulated tumbler to keep frozen mango margaritas and mojitos ice-cold!',
      visited: false,
      favorite: false
    },
    {
      id: 'bar-de-espera-salsa',
      name: 'Bar de Espera & Salsa Disco',
      category: 'bars',
      location: 'Dining Promenade & Plaza Nightclub',
      cuisine: 'Craft Aperitifs (18:00–22:00) & Late Nightclub (22:00–01:00)',
      included: true,
      reservationRequired: false,
      dressCode: 'Evening Casual',
      hoursLabel: 'Aperitifs 18:00–22:00 · Teatro 22:00–23:00 · Salsa Disco 22:00–01:00',
      openIntervals: [{ start: '18:00', end: '01:00' }],
      description: 'Start with a bartender-crafted cocktail at Bar de Espera before dinner, catch the 22:00 Princess Theatre show, then dance until 01:00 at Salsa Disco.',
      visited: false,
      favorite: false
    },
    {
      id: 'spa-sports',
      name: 'Princess Spa & Sports Park',
      category: 'wellness',
      location: 'Wellness Pavilion & Building 5 Edge',
      cuisine: 'Hydrotherapy, Couples Massages, Tennis, Padel & Golf',
      included: true,
      reservationRequired: false,
      dressCode: 'Athletic / Swimwear for Water Circuit',
      hoursLabel: 'Sports Courts 07:00–20:00 (Free) · Spa 09:00–19:00 (50% off 1st 24h!)',
      openIntervals: [{ start: '07:00', end: '20:00' }],
      description: 'Free tennis, padel, racquets/balls, 2-hole golf practice & water sports. Spa hydrotherapy circuit is 500 MXN, and massages are 50% off during your first 24 hours!',
      visited: false,
      favorite: false
    },
    {
      id: 'sister-resorts',
      name: 'Sister Resorts: La Hacienda & La Fondue',
      category: 'sister',
      location: 'Grand Riviera & Grand Sunset Princess (Shuttle every 15m)',
      cuisine: 'Authentic Mexican, Swiss Fondue, Las Olas Seafood & Bars',
      included: true,
      reservationRequired: true,
      dressCode: 'Smart Casual (Men: long trousers, closed shoes, sleeved shirt)',
      hoursLabel: 'Shuttle Train 07:00–23:30 · À La Carte Dinners 18:00–22:30',
      openIntervals: [{ start: '18:00', end: '22:30' }],
      description: 'As a Platinum Yucatán guest you enjoy full "Stay at 1, Play at 3" access to Grand Riviera & Grand Sunset Princess restaurants, pools, and bars (except Chill Out club).',
      visited: false,
      favorite: false
    }
  ],

  days: [
    {
      dayNumber: 1,
      date: '2026-11-28',
      shortDate: 'Sat 28 Nov',
      theme: 'Departure & Arrival Night',
      dinnerChoice: 'Yucatán Buffet Late Snacks / 24h Room Service',
      notes: 'Long travel day from Lisbon via Toronto. Keep swimsuit & flip-flops in carry-on for morning!',
      items: [
        { id: 'd1-1', time: '07:55', title: 'Arrive Lisbon Airport (LIS Terminal 1)', note: 'Bag drop for AC 811; verify bags are tagged all the way to CUN.', done: false },
        { id: 'd1-2', time: '10:55', title: 'Fly AC 811 (LIS → YYZ) & Transit T1', note: '3h 10m connection at Toronto Pearson T1 before AC 1812 at 17:10.', done: false },
        { id: 'd1-3', time: '20:10', title: 'Land at Cancún (CUN T3) & Shuttle to Resort', note: 'Walk straight outside T3 to official pre-booked transfer (~48 min drive).', done: false },
        { id: 'd1-4', time: '22:00', title: 'Platinum Check-In, Welcome Drink & Late Bite', note: 'Plaza Bar (24h) or Yucatán Buffet late-night snacks (from 22:30).', done: false }
      ]
    },
    {
      dayNumber: 2,
      date: '2026-11-29',
      shortDate: 'Sun 29 Nov',
      theme: 'Resort Orientation & Spa Deal',
      dinnerChoice: 'Aroma (International Gourmet)',
      notes: 'Claim the 50% first-24h massage discount at the Spa desk today!',
      items: [
        { id: 'd2-1', time: '08:30', title: 'À La Carte Breakfast at Rodeo Grill', note: 'Huevos rancheros, fresh papaya & Mexican coffee by the water.', done: false },
        { id: 'd2-2', time: '10:00', title: 'Concierge Desk: Book Kotatsu & 50% Spa Offer', note: 'Reserve Teppanyaki night + Rodeo Canopy table + 1st-day massage deal.', done: false },
        { id: 'd2-3', time: '12:00', title: 'Unwind at Platinum Pool & Beach Palapas', note: 'Swim-up cocktails at Platinum Pool Bar; gelato & espresso at 16:30.', done: false },
        { id: 'd2-4', time: '19:30', title: 'Dinner at Aroma + Live Band at La Plaza', note: 'Smart casual dress code (long trousers & closed shoes).', done: false }
      ]
    },
    {
      dayNumber: 3,
      date: '2026-11-30',
      shortDate: 'Mon 30 Nov',
      theme: 'Caribbean Beach & Hydrotherapy',
      dinnerChoice: 'La Bruschetta (Italian)',
      notes: '',
      items: [
        { id: 'd3-1', time: '09:30', title: 'Morning Beach Walk & Non-Motorized Kayaking', note: 'Visit water sports hut on the beach while sea breeze is calm.', done: false },
        { id: 'd3-2', time: '14:30', title: 'Spa Hydrotherapy Circuit & Massage', note: 'Relax in the 3 jacuzzis, steam room & couples treatment suite.', done: false },
        { id: 'd3-3', time: '18:30', title: 'Craft Aperitif at Bar de Espera', note: 'Located right between Bruschetta and Kotatsu.', done: false },
        { id: 'd3-4', time: '19:30', title: 'Italian Dinner at La Bruschetta', note: 'Antipasti, handmade pasta & tiramisu.', done: false }
      ]
    },
    {
      dayNumber: 4,
      date: '2026-12-01',
      shortDate: 'Tue 1 Dec',
      theme: 'Cenotes Discovery Morning',
      dinnerChoice: 'Kotatsu (Sushi & Teppanyaki)',
      notes: 'Use only biodegradable reef-safe sunscreen or UV rashguard at cenotes.',
      items: [
        { id: 'd4-1', time: '08:30', title: 'Morning Excursion: Cenote Azul & Jardín del Edén', note: '25 min south of Playa del Carmen; crystal-clear limestone pools before crowds.', done: false },
        { id: 'd4-2', time: '13:30', title: 'Return for Grilled Lunch at Rodeo Grill', note: 'Afternoon siesta on suite terrace.', done: false },
        { id: 'd4-3', time: '19:00', title: 'Kotatsu Teppanyaki & Sushi Experience', note: 'Advance reservation night.', done: false },
        { id: 'd4-4', time: '22:00', title: 'Princess Theatre Show & Teatro Bar', note: 'Seat-side drink service during the nightly production.', done: false }
      ]
    },
    {
      dayNumber: 5,
      date: '2026-12-02',
      shortDate: 'Wed 2 Dec',
      theme: 'Sports Park & Sister Resorts Tour',
      dinnerChoice: 'La Hacienda (Mexican at Grand Riviera)',
      notes: '',
      items: [
        { id: 'd5-1', time: '08:30', title: 'Morning Tennis / Padel or Golf Practice', note: 'Sports Park next to Building 5 (racquets & balls provided free).', done: false },
        { id: 'd5-2', time: '11:30', title: 'Main Pool Activities & Swim-Up Bar', note: 'Aqua fitness, music & poolside aguachile/snacks.', done: false },
        { id: 'd5-3', time: '17:30', title: 'Ride Internal Train to Grand Riviera Princess', note: 'Explore lush jungle walkways (watch for friendly coatis & iguanas!).', done: false },
        { id: 'd5-4', time: '19:30', title: 'Authentic Mexican Dinner at La Hacienda', note: 'Included via Platinum Yucatán reciprocal privileges.', done: false }
      ]
    },
    {
      dayNumber: 6,
      date: '2026-12-03',
      shortDate: 'Thu 3 Dec',
      theme: 'Playa del Carmen & Quinta Avenida',
      dinnerChoice: 'Rodeo Grill (Canopy Terrace)',
      notes: 'Official lobby taxi to Quinta Avenida is ~400 MXN each way (~15 min).',
      items: [
        { id: 'd6-1', time: '10:00', title: 'Lazy Morning by the Swim-Out / Platinum Pool', note: 'Read in a shaded Bali bed or palapa.', done: false },
        { id: 'd6-2', time: '15:30', title: 'Explore Playa del Carmen & Quinta Avenida', note: 'Artisanal shops, Parque Fundadores Mesoamerican portal & local cafés.', done: false },
        { id: 'd6-3', time: '20:00', title: 'Romantic Canopy Nesting-Table Dinner at Rodeo Grill', note: 'Over-water candlelit terrace at Platinum Yucatán.', done: false }
      ]
    },
    {
      dayNumber: 7,
      date: '2026-12-04',
      shortDate: 'Fri 4 Dec',
      theme: 'Tulum Ruins or Xcaret Eco-Park',
      dinnerChoice: 'Yucatán Buffet Theme Night',
      notes: 'Bring hat, water bottle, sunglasses, and comfortable walking sandals.',
      items: [
        { id: 'd7-1', time: '08:00', title: 'Clifftop Mayan Ruins of Tulum (or Xcaret Full Day)', note: 'Beat the midday heat at Tulum (~55 min south) overlooking turquoise surf.', done: false },
        { id: 'd7-2', time: '15:00', title: 'Afternoon Pool Cool-Down & Gelato House', note: 'Iced coffee & gelato between 16:00 and 20:00.', done: false },
        { id: 'd7-3', time: '19:30', title: 'Relaxed Dinner + Salsa Disco Nightlife', note: 'Casual buffet evening followed by dancing at Salsa Bar (22:00–01:00).', done: false }
      ]
    },
    {
      dayNumber: 8,
      date: '2026-12-05',
      shortDate: 'Sat 5 Dec',
      theme: 'Pure Resort Indulgence',
      dinnerChoice: 'La Fondue (Swiss) or Las Olas (Seafood)',
      notes: '',
      items: [
        { id: 'd8-1', time: '09:00', title: 'Room Service Breakfast on Private Terrace', note: '24/7 room service is included—order coffee, fruit & pastries to your suite.', done: false },
        { id: 'd8-2', time: '11:30', title: 'Beach Bar & Caribbean Sea Swim', note: 'Full unhurried beach day.', done: false },
        { id: 'd8-3', time: '19:30', title: 'Sister Resort Specialty Dinner (La Fondue / Las Olas)', note: 'Ask Platinum concierge in the morning to confirm preferred seating.', done: false }
      ]
    },
    {
      dayNumber: 9,
      date: '2026-12-06',
      shortDate: 'Sun 6 Dec',
      theme: 'Cozumel Reef Snorkel / Catamaran',
      dinnerChoice: 'Aroma or Bruschetta',
      notes: '',
      items: [
        { id: 'd9-1', time: '09:30', title: 'Catamaran Reef Snorkeling or Cozumel Ferry', note: 'Ferry departs downtown Playa del Carmen (35 min crossing to Cozumel).', done: false },
        { id: 'd9-2', time: '16:30', title: 'Sunset Cocktails at Lobby Bar', note: 'Specialty coffees & signature mezcal cocktails.', done: false },
        { id: 'd9-3', time: '19:30', title: 'Revisit Favorite À La Carte Restaurant', note: 'Repeat your top pick between Aroma, Bruschetta, or Kotatsu.', done: false }
      ]
    },
    {
      dayNumber: 10,
      date: '2026-12-07',
      shortDate: 'Mon 7 Dec',
      theme: 'Final Full Day in Paradise',
      dinnerChoice: 'Farewell Dinner (Kotatsu / Skylights)',
      notes: 'Check in online for Air Canada AC 1373 & AC 810 at 15:10 today (24h before departure)!',
      items: [
        { id: 'd10-1', time: '10:00', title: 'Final Full Beach & Platinum Swim-Up Day', note: 'Soak up the Caribbean sun and pick up any souvenirs (vanilla, mezcal, crafts).', done: false },
        { id: 'd10-2', time: '15:10', title: 'Air Canada Online Check-In Opens (AC 1373 + AC 810)', note: 'Confirm seats & save digital boarding passes offline; verify Visitax QR.', done: false },
        { id: 'd10-3', time: '19:30', title: 'Farewell Celebration Dinner & Plaza Nightcap', note: 'Toast to 10 unforgettable nights in Riviera Maya.', done: false }
      ]
    },
    {
      dayNumber: 11,
      date: '2026-12-08',
      shortDate: 'Tue 8 Dec',
      theme: 'Check-Out & Flights Home',
      dinnerChoice: 'In-Flight / Toronto Pearson T1',
      notes: 'AC 810 lands in Lisbon (LIS) on Wednesday 9 December at 08:55 WET.',
      items: [
        { id: 'd11-1', time: '08:00', title: 'Final Breakfast & Morning Pool Dip', note: 'Pack dry clothes, check room safe, and return pool towel cards.', done: false },
        { id: 'd11-2', time: '11:15', title: 'Check-Out & Airport Transfer to CUN Terminal 3', note: 'Allow ~50m transfer + 3h check-in buffer before 15:10 flight.', done: false },
        { id: 'd11-3', time: '15:10', title: 'Depart AC 1373 (CUN → YYZ, lands 19:05 EST)', note: '1h 50m connection at Toronto Pearson T1.', done: false },
        { id: 'd11-4', time: '20:55', title: 'Depart AC 810 Overnight (YYZ → LIS, 08:55+1)', note: 'Welcome home to Lisbon on Wednesday morning!', done: false }
      ]
    }
  ],

  packing: [
    { id: 'p1', category: 'Documents & Transit', item: 'Passport (valid 6+ months) & Air Canada PNR', checked: true },
    { id: 'p2', category: 'Documents & Transit', item: 'Canada eTA (mandatory for Toronto YYZ international transit!)', checked: false },
    { id: 'p3', category: 'Documents & Transit', item: 'Quintana Roo Visitax receipt QR saved offline on phone', checked: false },
    { id: 'p4', category: 'Documents & Transit', item: 'Resort voucher + CUN–Hotel roundtrip transfer confirmation', checked: false },
    { id: 'p5', category: 'Documents & Transit', item: 'Travel & medical insurance policy PDF', checked: false },
    { id: 'p6', category: 'À La Carte Dress Code', item: '2–3 pairs of lightweight linen/chino long trousers (required at dinner)', checked: false },
    { id: 'p7', category: 'À La Carte Dress Code', item: 'Closed-toe loafers or smart sneakers (required at 4 à la cartes)', checked: false },
    { id: 'p8', category: 'À La Carte Dress Code', item: '4–5 collared polo or linen button-down shirts', checked: false },
    { id: 'p9', category: 'Electronics & 110V Power', item: 'EU (Type C/F) to US/Mexico (Type A/B, 110V) plug adapters (x2)', checked: false },
    { id: 'p10', category: 'Electronics & 110V Power', item: 'Power bank & charging cables (in carry-on for LIS–YYZ–CUN)', checked: false },
    { id: 'p11', category: 'Electronics & 110V Power', item: 'Waterproof phone pouch for cenotes & swim-up pool bars', checked: false },
    { id: 'p12', category: 'Beach, Pool & Cenotes', item: 'Reef-safe biodegradable sunscreen (strictly required at cenotes/Xcaret)', checked: false },
    { id: 'p13', category: 'Beach, Pool & Cenotes', item: 'Insulated tumbler / thermal cup (keeps swim-up drinks icy for hours)', checked: false },
    { id: 'p14', category: 'Beach, Pool & Cenotes', item: '3–4 swimsuits, polarized sunglasses, sun hat & flip-flops', checked: false },
    { id: 'p15', category: 'Health & Money', item: 'Small MXN peso notes (20, 50, 100 MXN) or USD $1/$5 bills for tips', checked: false },
    { id: 'p16', category: 'Health & Money', item: 'Evening mosquito repellent, aloe after-sun & travel electrolytes', checked: false }
  ],

  rates: {
    eurToMxn: 21.6,
    eurToUsd: 1.06,
    eurToCad: 1.48
  },

  expenses: [
    { id: 'exp-sample-1', label: 'Quintana Roo Visitax (estimate)', amount: 275, currency: 'MXN', date: '2026-11-28' }
  ],

  phrases: [
    { es: 'Hola, buenos días / buenas noches', en: 'Hello, good morning / good evening', phonetic: 'OH-lah, BWEH-nohs DEE-ahs / BWEH-nahs NOH-chehs' },
    { es: '¿Nos puede reservar una mesa para las ocho?', en: 'Could you reserve a table for us at 8:00 PM?', phonetic: 'nohs PWEH-deh reh-ser-VAR OO-nah MEH-sah PAH-rah lahs OH-choh' },
    { es: 'Dos margaritas de mango sin sal, por favor', en: 'Two mango margaritas without salt, please', phonetic: 'dohs mar-gah-REE-tahs deh MAHN-goh seen sahl, por fah-VOR' },
    { es: 'Agua embotellada sin gas, por favor', en: 'Still bottled water, please', phonetic: 'AH-gwah em-boh-teh-YAH-dah seen gahs' },
    { es: '¿Cuánto cuesta el taxi a la Quinta Avenida?', en: 'How much is the taxi to 5th Avenue? (~400 MXN)', phonetic: 'KWAHN-toh KWEHS-tah el TAK-see ah lah KEEN-tah ah-veh-NEE-dah' },
    { es: 'Muchas gracias por su excelente servicio', en: 'Thank you very much for your wonderful service', phonetic: 'MOO-chahs GRAH-syahs por soo ek-seh-LEN-teh ser-VEE-syoh' }
  ]
};
