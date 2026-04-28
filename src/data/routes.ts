import type { Decoration, Landmark, Rarity, Route } from "../types";

const landmark = (
  id: string,
  name: string,
  milestoneKm: number,
  description: string,
  image: string,
): Landmark => ({
  id,
  name,
  milestoneKm,
  description,
  image,
});

const decoration = (
  id: string,
  name: string,
  rarity: Rarity,
  description: string,
  image: string,
): Decoration => ({
  id,
  name,
  rarity,
  description,
  image,
});

export const routes: Route[] = [
  {
    id: "central-park-loop",
    name: "Manhattan Lights Trail",
    city: "New York",
    country: "United States",
    totalDistanceKm: 10,
    coverImage: "/posters/centralpark.jpg",
    description: "A compact New York route rebuilt around the city landmarks now available in the collection.",
    motivation: "Turn short runs into a sharp city archive from Liberty Island to the skyline.",
    tier: "Standard",
    priceStamps: 70,
    sourceType: "personal",
    sourceCrewId: null,
    landmarks: [
      landmark("statue-of-liberty", "Statue of Liberty", 2, "The opening New York icon for your first real progress.", "/models/landmarks/central-park-route/statue-of-liberty.png"),
      landmark("metropolitan-museum", "The Metropolitan Museum of Art", 5, "A cultural midpoint reward from the park edge.", "/models/landmarks/central-park-route/The-Metropolitan-Museum-of-Art.png"),
      landmark("chrysler-building", "Chrysler Building", 8, "A polished skyline landmark for steady city miles.", "/models/landmarks/central-park-route/Chrysler-Building.png"),
      landmark("one-world-trade-center", "One World Trade Center", 10, "The route completion landmark for the New York set.", "/models/landmarks/central-park-route/one-world-trade-center.png")
    ],
    decorations: [
      decoration("bethesda-fountain", "Bethesda Fountain", "common", "A park keepsake from the Central Park collection.", "/models/decoration/central-park-route/Bethesda-Fountain.png"),
      decoration("subway", "Subway", "common", "A daily city token from New York runs.", "/models/decoration/New York-route/subway.png"),
      decoration("jazz-club", "Jazz Club", "rare", "A night-scene collectible from the city rhythm.", "/models/decoration/New York-route/jazz-club.png"),
      decoration("empire-state-building", "Empire State Building", "rare", "A skyline souvenir for repeat route progress.", "/models/decoration/New York-route/Empire-State-Building.png"),
      decoration("one-vanderbilt-building", "One Vanderbilt Building", "epic", "A modern tower reward from deeper New York runs.", "/models/decoration/New York-route/One-Vanderbilt-Building.png"),
      decoration("rockefeller-center-tree", "Rockefeller Center Christmas Tree", "legendary", "A festive showpiece for dedicated New York runners.", "/models/decoration/New York-route/Rockefeller-Center-Christmas-Tree.png")
    ]
  },
  {
    id: "tokyo-city-route",
    name: "Neon Sakura Circuit",
    city: "Tokyo",
    country: "Japan",
    totalDistanceKm: 18,
    coverImage: "/posters/Tokyo.jpg",
    description: "A neon-to-temple Tokyo journey using the refreshed route-specific landmark set.",
    motivation: "Build a Tokyo travel diary one landmark unlock at a time.",
    tier: "Advanced",
    priceStamps: 130,
    sourceType: "personal",
    sourceCrewId: null,
    landmarks: [
      landmark("shibuya", "Shibuya Crossing", 4, "Your first Tokyo unlock opens with the city's busiest street energy.", "/models/landmarks/tokyo-route/shibuya.png"),
      landmark("senso-ji", "Senso-ji", 10, "Mid-route progress shifts from neon pace to historic Tokyo.", "/models/landmarks/tokyo-route/senso-ji.png"),
      landmark("tokyo-tower", "Tokyo Tower", 18, "The final Tokyo landmark unlocks when you complete the route.", "/models/landmarks/tokyo-route/tokyo-tower.png")
    ],
    decorations: [
      decoration("sakura", "Sakura", "common", "A soft seasonal drop from the Tokyo set.", "/models/decoration/tokyo-route/sakura.png"),
      decoration("maneki-neko", "Maneki Neko", "common", "A lucky cat decoration for repeat Tokyo runs.", "/models/decoration/tokyo-route/maneki-neko.png"),
      decoration("omamori", "Omamori", "rare", "A shrine charm for growing route familiarity.", "/models/decoration/tokyo-route/omamori.png"),
      decoration("takoyaki", "Takoyaki", "rare", "A street-food collectible from the Tokyo route pool.", "/models/decoration/tokyo-route/Takoyaki.png"),
      decoration("sukiyaki", "Sukiyaki", "epic", "A richer food-themed reward from the Tokyo collection.", "/models/decoration/tokyo-route/Sukiyaki.png"),
      decoration("torii-gate-decoration", "Torii Gate", "legendary", "A ceremonial Tokyo decoration using the route art set.", "/models/decoration/tokyo-route/torri-gate.png")
    ]
  },
  {
    id: "barcelona-coast-route",
    name: "Gaudi Coastline Walk",
    city: "Barcelona",
    country: "Spain",
    totalDistanceKm: 12,
    coverImage: "/posters/Barcelona.jpg",
    description: "A Spanish city route rebuilt around the Barcelona landmark assets now in the project.",
    motivation: "Stack everyday runs into a bright Mediterranean landmark collection.",
    tier: "Standard",
    priceStamps: 80,
    sourceType: "personal",
    sourceCrewId: null,
    landmarks: [
      landmark("sagrada-familia", "La Sagrada Familia", 3, "A vivid early unlock that anchors the route in Barcelona.", "/models/landmarks/Barcelona/LaSagradaFamilia.png"),
      landmark("bullring", "Bullring", 7, "A strong midpoint landmark from the Spanish route set.", "/models/landmarks/Barcelona/Bullring.png"),
      landmark("mestalla-stadium", "Mestalla Stadium", 12, "The completion landmark for the Spanish city route.", "/models/landmarks/Barcelona/MestallaStadium.png")
    ],
    decorations: [
      decoration("olive-oil", "Olive Oil", "common", "A kitchen-table collectible from the Spanish route set.", "/models/decoration/Barcelona/OliveOil.png"),
      decoration("fuet", "Fuet", "common", "A savory snack drop for easy route repeats.", "/models/decoration/Barcelona/Fuet.png"),
      decoration("gambas-al-ajillo", "Gambas al Ajillo", "rare", "A warm tapas reward from the city pool.", "/models/decoration/Barcelona/GambasalAjillo.png"),
      decoration("paella", "Paella", "rare", "A classic shared-table collectible.", "/models/decoration/Barcelona/Paella.png"),
      decoration("burnt-basque-cheesecake", "Burnt Basque Cheesecake", "epic", "A rich dessert reward from deeper progress.", "/models/decoration/Barcelona/BurntBasqueCheesecake.png"),
      decoration("guernica", "Guernica", "legendary", "An art landmark decoration for dedicated Spanish route runners.", "/models/decoration/Barcelona/Guernica.png")
    ]
  },
  {
    id: "london-landmark-route",
    name: "Thames Crown Trail",
    city: "London",
    country: "United Kingdom",
    totalDistanceKm: 22,
    coverImage: "/posters/london.jpg",
    description: "A longer London route rebuilt around the five available landmark models.",
    motivation: "Build a serious travel arc through repeated sessions and visible achievement pacing.",
    tier: "Advanced",
    priceStamps: 150,
    sourceType: "personal",
    sourceCrewId: null,
    landmarks: [
      landmark("big-ben", "Big Ben", 4, "A classic opening reward for the London route.", "/models/landmarks/london-route/BigBen.png"),
      landmark("westminster-abbey", "Westminster Abbey", 8, "A historic midpoint step toward the city core.", "/models/landmarks/london-route/WestminsterAbbey.png"),
      landmark("museum", "Museum", 12, "A cultural unlock for sustained consistency.", "/models/landmarks/london-route/Museum.png"),
      landmark("tower-bridge", "Tower Bridge", 17, "A recognizable late-route London landmark.", "/models/landmarks/london-route/TowerBridge.png"),
      landmark("windsor-castle", "Windsor Castle", 22, "The completion reward for the London collection.", "/models/landmarks/london-route/WindsorCastle.png")
    ],
    decorations: [
      decoration("english-breakfast", "English Breakfast", "common", "A hearty London drop for easy repeats.", "/models/decoration/london-route/EnglishBreakfast.png"),
      decoration("newsboy-cap", "Newsboy Cap", "common", "A city-street collectible with London character.", "/models/decoration/london-route/NewsboyCap.png"),
      decoration("fish-and-chips", "Fish and Chips", "rare", "A classic food reward from the route pool.", "/models/decoration/london-route/FishandChips.png"),
      decoration("red-telephone-box", "Red Telephone Box", "rare", "A bright street icon for your collection.", "/models/decoration/london-route/RedTelephoneBox.png"),
      decoration("double-decker-bus", "Double-Decker Bus", "epic", "A full city transport showpiece.", "/models/decoration/london-route/Double-Decker Bus.png"),
      decoration("victorian-tea-set", "Victorian Tea Set", "legendary", "A polished London reward for dedicated runners.", "/models/decoration/london-route/VictorianTeaSet.png")
    ]
  },
  {
    id: "paris-eiffel-route",
    name: "Seine Romance Path",
    city: "Paris",
    country: "France",
    totalDistanceKm: 30,
    coverImage: "/posters/paris.jpg",
    description: "A premium Paris route rebuilt around the Louvre, Eiffel Tower, and Arc de Triomphe set.",
    motivation: "Save stamps, unlock Paris, and turn consistency into a richer destination chase.",
    tier: "Premium",
    priceStamps: 210,
    sourceType: "personal",
    sourceCrewId: null,
    landmarks: [
      landmark("louvre-courtyard", "Louvre Courtyard", 8, "An elegant early landmark that sets the route tone.", "/models/landmarks/paris-route/louvre-courtyard.png"),
      landmark("eiffel-tower", "Eiffel Tower", 16, "The route's central reward and emotional midpoint.", "/models/landmarks/paris-route/eiffel-tower.png"),
      landmark("arc-de-triomphe", "Arc de Triomphe", 30, "A premium completion reveal for the final push.", "/models/landmarks/paris-route/arc-de-triomphe.png")
    ],
    decorations: [
      decoration("baguette", "Baguette", "common", "A classic bakery drop from the Paris route.", "/models/decoration/paris-route/baguette.png"),
      decoration("chartreux", "Chartreux", "common", "A quiet Parisian cat collectible for repeat runs.", "/models/decoration/paris-route/chartreux.png"),
      decoration("clafoutis", "Clafoutis", "rare", "A warm dessert reward from the Paris set.", "/models/decoration/paris-route/clafoutis.png"),
      decoration("peach-melba", "Peach Melba", "rare", "A polished cafe dessert from the Paris route pool.", "/models/decoration/paris-route/peach-melba.png"),
      decoration("cabernet-sauvignon", "Cabernet Sauvignon", "epic", "A refined bottle reward for deeper Paris progress.", "/models/decoration/paris-route/cabernet-sauvignon.png"),
      decoration("luxury-bag", "Luxury Bag", "legendary", "A fashion showpiece reserved for dedicated Paris runners.", "/models/decoration/paris-route/luxury-bag.png")
    ]
  },
  {
    id: "cairo-pyramid-route",
    name: "Nile Pyramid Quest",
    city: "Cairo",
    country: "Egypt",
    totalDistanceKm: 16,
    coverImage: "/posters/Reykjavik.jpg",
    description: "A desert-history route using the Cairo landmark models now available in the asset library.",
    motivation: "Move from citadel stone to ancient icons as your weekly distance grows.",
    tier: "Advanced",
    priceStamps: 130,
    sourceType: "personal",
    sourceCrewId: null,
    landmarks: [
      landmark("cairo-citadel", "Cairo Citadel", 4, "A fortified opening landmark for the Cairo route.", "/models/landmarks/egpty-route/CairoCitadel.png"),
      landmark("the-sphinx", "The Sphinx", 9, "A mythic midpoint reward from the Egyptian set.", "/models/landmarks/egpty-route/The Sphinx.png"),
      landmark("the-great-pyramid", "The Great Pyramid", 16, "The completion landmark for the Cairo collection.", "/models/landmarks/egpty-route/TheGreatPyramid.png")
    ],
    decorations: [
      decoration("anubis", "Anubis", "common", "A guardian figure from the Cairo route pool.", "/models/decoration/Cairo-route/Anubis.png"),
      decoration("egyptian-mummy", "Egyptian Mummy", "common", "A museum-style collectible for repeat runs.", "/models/decoration/Cairo-route/EgyptianMummy.png"),
      decoration("egyptian-sun-barge", "Egyptian Sun Barge", "rare", "A ceremonial reward from deeper progress.", "/models/decoration/Cairo-route/EgyptianSunBarge.png"),
      decoration("catacombs-kom-el-shoqafa", "Catacombs of Kom El Shoqafa", "rare", "A subterranean history drop from the route.", "/models/decoration/Cairo-route/CatacombsofKomElShoqafa.png"),
      decoration("pharaoh-crook-flail", "Pharaoh's Crook and Flail", "epic", "A royal symbol for committed route runs.", "/models/decoration/Cairo-route/Pharaoh'sCrookandFlail.png"),
      decoration("pharaoh-nemes", "Pharaoh's Nemes", "legendary", "A legendary Egyptian showpiece.", "/models/decoration/Cairo-route/PharaohsNemes.png")
    ]
  },
  {
    id: "seoul-heritage-route",
    name: "Han River Memory Trail",
    city: "Seoul",
    country: "South Korea",
    totalDistanceKm: 12,
    coverImage: "/posters/Tokyo.jpg",
    description: "A compact Seoul route built from the Korean landmark models currently in the project.",
    motivation: "Collect palace, mountain, and memorial landmarks through steady short runs.",
    tier: "Standard",
    priceStamps: 85,
    sourceType: "personal",
    sourceCrewId: null,
    landmarks: [
      landmark("gyeongbokgung-palace", "Gyeongbokgung Palace", 3, "The opening palace landmark for the Seoul route.", "/models/landmarks/koera-route/GyeongbokgungPalace.png"),
      landmark("korean-tomb", "Korean Tomb", 7, "A quiet historical midpoint reward.", "/models/landmarks/koera-route/KoreanTomb.png"),
      landmark("mountain-side-elevator", "Mountain-side Elevator", 12, "The completion landmark for the Seoul set.", "/models/landmarks/koera-route/Mountain-sideElevator.png")
    ],
    decorations: [
      decoration("kimchi", "Kimchi", "common", "A staple food collectible from the Seoul route.", "/models/decoration/Seoul-route/Kimchi.png"),
      decoration("tteokbokki", "Tteokbokki", "common", "A street-food drop for short route repeats.", "/models/decoration/Seoul-route/Tteokbokki.png"),
      decoration("soju", "Soju", "rare", "A small bottle reward from the city pool.", "/models/decoration/Seoul-route/Soju.png"),
      decoration("buldak-bokkeum-myeon", "Buldak Bokkeum Myeon", "rare", "A spicy route collectible for regular runners.", "/models/decoration/Seoul-route/Buldak Bokkeum Myeon.png"),
      decoration("korean-fried-chicken", "Korean Fried Chicken", "epic", "A rich food reward from deeper progress.", "/models/decoration/Seoul-route/Korean Fried Chicken.png"),
      decoration("korean-hanbok", "Korean Hanbok", "legendary", "A ceremonial showpiece from the Seoul collection.", "/models/decoration/Seoul-route/Korean Hanbok.png")
    ]
  },
  {
    id: "sydney-harbor-route",
    name: "Harbour Horizon Run",
    city: "Sydney",
    country: "Australia",
    totalDistanceKm: 14,
    coverImage: "/posters/Melbourne.jpg",
    description: "A harbor route rebuilt around the Sydney landmark images in the asset library.",
    motivation: "Run toward the opera house, bridge, and skyline as a clean crew-worthy destination.",
    tier: "Standard",
    priceStamps: 95,
    sourceType: "pacecrew",
    crewOnly: true,
    sourceCrewId: null,
    landmarks: [
      landmark("sydney-opera-house", "Sydney Opera House", 4, "The opening harbor icon for this route.", "/models/landmarks/sydney-route/SydneyOperaHouse.png"),
      landmark("harbour-bridge", "Harbour Bridge", 9, "A strong midpoint landmark across the water.", "/models/landmarks/sydney-route/HarbourBridge.png"),
      landmark("sydney-skyline", "Sydney Skyline", 14, "The completion view for the Sydney route.", "/models/landmarks/sydney-route/Skyline.png")
    ],
    decorations: [
      decoration("australian-meat-pie", "Australian Meat Pie", "common", "A savory local drop from the Sydney set.", "/models/decoration/Sydney-route/AustralianMeatPie.png"),
      decoration("boomerang", "Boomerang", "common", "A curved keepsake from the route pool.", "/models/decoration/Sydney-route/Boomerang.png"),
      decoration("coral-reef", "Coral Reef", "rare", "A bright coastal reward for repeated runs.", "/models/decoration/Sydney-route/CoralReef.png"),
      decoration("koala", "Koala", "rare", "A soft wildlife collectible.", "/models/decoration/Sydney-route/Koala.png"),
      decoration("platypus", "Platypus", "epic", "A distinctive wildlife reward.", "/models/decoration/Sydney-route/Platypus.png"),
      decoration("wallaby", "Wallaby", "legendary", "A rare animal showpiece for the Sydney set.", "/models/decoration/Sydney-route/Wallaby.png")
    ]
  },
  {
    id: "rome-heritage-route",
    name: "Eternal City Path",
    city: "Rome",
    country: "Italy",
    totalDistanceKm: 18,
    coverImage: "/posters/paris.jpg",
    description: "A classical heritage route using the Rome landmark models currently in the project.",
    motivation: "Turn longer sessions into a collection of ancient stone, baths, and arenas.",
    tier: "Advanced",
    priceStamps: 145,
    sourceType: "personal",
    sourceCrewId: null,
    landmarks: [
      landmark("colosseum", "Colosseum", 4, "The route opens with Rome's arena landmark.", "/models/landmarks/roma/Colosseum.png"),
      landmark("roman-bath", "Roman Bath", 8, "A historical midpoint reward from the route set.", "/models/landmarks/roma/Roman Bath.png"),
      landmark("greek-amphitheater", "Greek Amphitheater", 13, "A classical stage landmark for sustained progress.", "/models/landmarks/roma/GreekAmphitheater.png"),
      landmark("parthenon", "Parthenon", 18, "The completion landmark for the classical route.", "/models/landmarks/roma/Parthenon.png")
    ],
    decorations: [
      decoration("espresso", "Espresso", "common", "A quick cafe drop from the Rome set.", "/models/decoration/roma/Espresso.png"),
      decoration("margherita-pizza", "Margherita Pizza", "common", "A classic food collectible.", "/models/decoration/roma/MargheritaPizza.png"),
      decoration("lasagne", "Lasagne", "rare", "A rich route reward from repeat runs.", "/models/decoration/roma/Lasagne.png"),
      decoration("roman-laurel-wreath", "Roman Laurel Wreath", "rare", "A victory symbol for steady progress.", "/models/decoration/roma/RomanLaurelWreath.png"),
      decoration("roman-gladiator-helmet", "Roman Gladiator Helmet", "epic", "A bold arena reward.", "/models/decoration/roma/RomanGladiatorHelmet.png"),
      decoration("roman-mosaic-floor", "Roman Mosaic Floor", "legendary", "A patterned showpiece for dedicated runners.", "/models/decoration/roma/RomanMosaicFloor.png")
    ]
  },
  {
    id: "california-discovery-route",
    name: "Pacific Golden Trail",
    city: "California",
    country: "United States",
    totalDistanceKm: 20,
    coverImage: "/posters/centralpark.jpg",
    description: "A California route rebuilt around the San folder landmark models.",
    motivation: "Move from tech campus to observatory to national-park scale.",
    tier: "Advanced",
    priceStamps: 150,
    sourceType: "personal",
    sourceCrewId: null,
    landmarks: [
      landmark("apple-park", "Apple Park", 5, "A modern opening landmark from the California set.", "/models/landmarks/san/ApplePark.png"),
      landmark("gravitational-wave-observatory", "Gravitational Wave Observatory", 12, "A science landmark for the route midpoint.", "/models/landmarks/san/GravitationalWaveObservatory.png"),
      landmark("yosemite-national-park", "Yosemite National Park", 20, "The completion reward for the California route.", "/models/landmarks/san/YosemiteNationalPark.png")
    ],
    decorations: [
      decoration("avocado", "Avocado", "common", "A California food collectible.", "/models/decoration/san/Avocado.png"),
      decoration("beach", "Beach", "common", "A coastal drop from easy repeats.", "/models/decoration/san/Beach.png"),
      decoration("cowboy-hat", "Cowboy Hat", "rare", "A western-style route reward.", "/models/decoration/san/CowboyHat.png"),
      decoration("gramophone", "Gramophone", "rare", "A classic entertainment collectible.", "/models/decoration/san/Gramophone.png"),
      decoration("hollywood", "Hollywood", "epic", "A bright show-business reward.", "/models/decoration/san/Hollywood.png"),
      decoration("award-statue", "Award Statue", "legendary", "A trophy-like route showpiece.", "/models/decoration/san/Award Statue.png")
    ]
  },
  {
    id: "taipei-skyline-route",
    name: "Elephant Mountain Glow",
    city: "Taipei",
    country: "Taiwan",
    totalDistanceKm: 16,
    coverImage: "/posters/Tokyo.jpg",
    description: "A Taiwan route rebuilt around the Taipei folder landmark set.",
    motivation: "Climb through skyline, lakeside, mountain, and southern city memories.",
    tier: "Standard",
    priceStamps: 100,
    sourceType: "personal",
    sourceCrewId: null,
    landmarks: [
      landmark("taipei-101", "Taipei 101", 4, "The opening skyline landmark for the Taiwan route.", "/models/landmarks/Taipei/Taipei-101.png"),
      landmark("sun-moon-lake", "Sun Moon Lake", 8, "A calmer midpoint memory from the route set.", "/models/landmarks/Taipei/sun-moon-lake.png"),
      landmark("yushan", "Yushan", 12, "A mountain landmark for sustained progress.", "/models/landmarks/Taipei/Yushan.png"),
      landmark("kaohsiung-85-sky-tower", "Kaohsiung 85 Sky Tower", 16, "The completion landmark for the Taiwan route.", "/models/landmarks/Taipei/Kaohsiung-85-Sky-Tower.png")
    ],
    decorations: [
      decoration("bubble-tea", "Bubble Tea", "common", "A sweet drink drop from the Taiwan set.", "/models/decoration/Taipei/bubble-tea.png"),
      decoration("taiwan-beef-noodle", "Taiwan Beef Noodle", "rare", "A warm food reward from repeat runs.", "/models/decoration/Taipei/Taiwan-beef-noodle.png"),
      decoration("taiwan-blue-magpie", "Taiwan Blue Magpie", "epic", "A vivid wildlife collectible.", "/models/decoration/Taipei/Taiwan-Blue-Magpie.png")
    ]
  },
  {
    id: "bangkok-floating-route",
    name: "Chao Phraya Drift",
    city: "Bangkok",
    country: "Thailand",
    totalDistanceKm: 9,
    coverImage: "/posters/Lisbon.jpg",
    description: "A short Bangkok route using the current floating market and Buddha landmark assets.",
    motivation: "Collect a compact route with bright market motion and temple calm.",
    tier: "Starter",
    priceStamps: 55,
    sourceType: "pacecrew",
    crewOnly: true,
    sourceCrewId: null,
    landmarks: [
      landmark("floating-market", "Floating Market", 4, "A colorful opening landmark from the Bangkok set.", "/models/landmarks/bamkok/floating-market.png"),
      landmark("buddha", "Buddha", 9, "The completion landmark for this compact Bangkok route.", "/models/landmarks/bamkok/buddha.png")
    ],
    decorations: [
      decoration("palm", "Palm", "common", "A tropical route drop for easy repeats.", "/models/decoration/bamkok/palm.png"),
      decoration("mango-rice", "Mango Rice", "common", "A sweet food collectible from the Bangkok set.", "/models/decoration/bamkok/mango-rice.png"),
      decoration("pad-thai", "Pad Thai", "rare", "A classic street-food reward.", "/models/decoration/bamkok/pad-thai.png"),
      decoration("banh-lot-noodles", "Banh Lot Noodles", "rare", "A chilled dessert-style route collectible.", "/models/decoration/bamkok/Banh-Lot-Noodles.png"),
      decoration("tourist-duck-car", "Tourist Duck Car", "epic", "A playful vehicle reward from the route pool.", "/models/decoration/bamkok/tourist-duck-car.png")
    ]
  }
];
