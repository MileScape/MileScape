import type { Route } from "../types";

export const routes: Route[] = [
  {
    id: "west-lake-loop",
    name: "West Lake Loop",
    city: "Hangzhou",
    country: "China",
    totalDistanceKm: 20,
    coverImage: "/posters/westlake.jpg",
    description: "A poetic lakeside route that turns short neighborhood runs into a slow unfolding travel story.",
    motivation: "Collect waterside memories one kilometer at a time and let every run reveal a calmer view.",
    tier: "Advanced",
    priceStamps: 140,
    sourceType: "personal",
    sourceCrewId: null,
    landmarks: [
      { id: "broken-bridge", name: "Broken Bridge", milestoneKm: 3, description: "Your first iconic stop, where the route begins to feel real.", image: "" },
      { id: "leifeng-pagoda", name: "Leifeng Pagoda", milestoneKm: 9, description: "A milestone with elevation, history, and a sense of earned momentum.", image: "" },
      { id: "three-pools", name: "Three Pools Mirroring the Moon", milestoneKm: 16, description: "A quiet late-route unlock that marks serious commitment.", image: "" }
    ],
    decorations: [
      { id: "lotus-fan", name: "Lotus Fan", rarity: "common", description: "A breezy keepsake from the lake promenade." },
      { id: "tea-pavilion-lamp", name: "Tea Pavilion Lamp", rarity: "common", description: "A warm lantern for waterside evenings." },
      { id: "silk-parasol", name: "Silk Parasol", rarity: "rare", description: "A polished travel memento with Hangzhou flair." },
      { id: "jade-koi", name: "Jade Koi", rarity: "epic", description: "A carved lucky fish from the lake district." },
      { id: "moon-bridge-arch", name: "Moon Bridge Arch", rarity: "legendary", description: "A grand collectible inspired by the route's reflected skyline." }
    ]
  },
  {
    id: "central-park-loop",
    name: "Central Park Loop",
    city: "New York",
    country: "United States",
    totalDistanceKm: 10,
    coverImage: "/posters/centralpark.jpg",
    description: "A brisk city escape built for users who want fast progress and satisfying unlocks.",
    motivation: "Turn ordinary training days into a cinematic park circuit filled with familiar landmarks.",
    tier: "Standard",
    priceStamps: 70,
    sourceType: "personal",
    sourceCrewId: null,
    landmarks: [
      {
        id: "statue-of-liberty",
        name: "Statue of Liberty",
        milestoneKm: 2,
        description: "Your first New York memory appears after a real run in the park.",
        image: "/models/landmarks/central-park-route/statue-of-liberty.png"
      },
      { id: "bow-bridge", name: "Bow Bridge", milestoneKm: 5, description: "The midpoint unlock where consistency starts looking beautiful.", image: "" },
      { id: "belvedere-castle", name: "Belvedere Castle", milestoneKm: 8, description: "A near-finish reward that reframes the route as an adventure.", image: "" }
    ],
    decorations: [
      {
        id: "thanksgiving-turkey",
        name: "Thanksgiving Turkey",
        rarity: "common",
        description: "A classic holiday table drop from the New York route.",
        image: "/models/decoration/central-park-route/thanksgiving-turkey.png"
      },
      {
        id: "smartphone",
        name: "Smartphone",
        rarity: "common",
        description: "A city-life collectible for quick Central Park loops.",
        image: "/models/decoration/central-park-route/smartphone.png"
      },
      {
        id: "cola-bottle",
        name: "Cola Bottle",
        rarity: "rare",
        description: "A familiar refreshment reward from the updated New York set.",
        image: "/models/decoration/central-park-route/cola-bottle.png"
      },
      {
        id: "basketball",
        name: "Basketball",
        rarity: "rare",
        description: "A pickup-game collectible inspired by the city courts.",
        image: "/models/decoration/central-park-route/basketball.png"
      },
      {
        id: "fast-food-spot",
        name: "Fast Food Spot",
        rarity: "epic",
        description: "A bright street-corner reward from the New York route pool.",
        image: "/models/decoration/central-park-route/fast-food-spot.png"
      }
    ]
  },
  {
    id: "tokyo-city-route",
    name: "Tokyo City Route",
    city: "Tokyo",
    country: "Japan",
    totalDistanceKm: 18,
    coverImage: "/posters/Tokyo.jpg",
    description: "A neon-to-tranquil city journey that rewards persistence with memorable urban scenes.",
    motivation: "Build a personal travel diary through repeated short runs and unlock Tokyo piece by piece.",
    tier: "Advanced",
    priceStamps: 130,
    sourceType: "personal",
    sourceCrewId: null,
    landmarks: [
      {
        id: "shibuya",
        name: "Shibuya Crossing",
        milestoneKm: 4,
        description: "Your first Tokyo unlock now opens with the route's busiest, brightest street energy.",
        image: "/models/landmarks/tokyo-route/shibuya.png"
      },
      {
        id: "senso-ji",
        name: "Senso-ji",
        milestoneKm: 10,
        description: "Mid-route progress shifts from neon pace to a calmer historic Tokyo landmark.",
        image: "/models/landmarks/tokyo-route/senso-ji.png"
      },
      {
        id: "tokyo-tower",
        name: "Tokyo Tower",
        milestoneKm: 18,
        description: "The final Tokyo landmark now unlocks only when you fully complete the route.",
        image: "/models/landmarks/tokyo-route/tokyo-tower.png"
      }
    ],
    decorations: [
      {
        id: "sakura",
        name: "Sakura",
        rarity: "common",
        description: "A soft seasonal drop pulled from the refreshed Tokyo set.",
        image: "/models/decoration/tokyo-route/sakura.png"
      },
      {
        id: "maneki-neko",
        name: "Maneki Neko",
        rarity: "common",
        description: "A lucky cat decoration for repeat Tokyo runs.",
        image: "/models/decoration/tokyo-route/maneki-neko.png"
      },
      {
        id: "omamori",
        name: "Omamori",
        rarity: "rare",
        description: "A shrine charm that starts appearing more often as route familiarity grows.",
        image: "/models/decoration/tokyo-route/omamori.png"
      },
      {
        id: "takoyaki",
        name: "Takoyaki",
        rarity: "rare",
        description: "A classic street-food collectible from the Tokyo route pool.",
        image: "/models/decoration/tokyo-route/Takoyaki.png"
      },
      {
        id: "sukiyaki",
        name: "Sukiyaki",
        rarity: "epic",
        description: "A richer food-themed reward from the updated Tokyo collection.",
        image: "/models/decoration/tokyo-route/Sukiyaki.png"
      },
      {
        id: "torii-gate-decoration",
        name: "Torii Gate",
        rarity: "legendary",
        description: "A ceremonial Tokyo decoration using the new route-specific art set.",
        image: "/models/decoration/tokyo-route/torri-gate.png"
      }
    ]
  },
  {
    id: "lisbon-tram-route",
    name: "Lisbon Tram Route",
    city: "Lisbon",
    country: "Portugal",
    totalDistanceKm: 7,
    coverImage: "/posters/Lisbon.jpg",
    description: "A short scenic climb through bright streets and postcard turns, ideal for first shop unlocks.",
    motivation: "A compact route that gives fast payoff and makes even a short run feel collectible.",
    tier: "Starter",
    priceStamps: 50,
    sourceType: "personal",
    sourceCrewId: null,
    landmarks: [
      { id: "alfama-view", name: "Alfama Viewpoint", milestoneKm: 2, description: "A quick panoramic unlock above the city roofs.", image: "" },
      { id: "yellow-tram", name: "Historic Tram", milestoneKm: 4, description: "A route memory that turns progress into a recognizable city icon.", image: "" },
      { id: "commerce-square", name: "Commerce Square", milestoneKm: 6, description: "A late-route reward before full completion.", image: "" }
    ],
    decorations: [
      { id: "azulejo-tile", name: "Azulejo Tile", rarity: "common", description: "A blue ceramic pattern from Lisbon walls." },
      { id: "tram-ticket", name: "Tram Ticket", rarity: "common", description: "A bright little token from the yellow line." },
      { id: "fado-guitar", name: "Fado Guitar", rarity: "rare", description: "A soulful souvenir from the hilltop neighborhoods." },
      { id: "sunset-miradouro", name: "Sunset Miradouro", rarity: "epic", description: "A scenic overlook captured in warm evening light." },
      { id: "golden-tram-car", name: "Golden Tram Car", rarity: "legendary", description: "A gleaming tram display for repeat route veterans." }
    ]
  },
  {
    id: "barcelona-coast-route",
    name: "Barcelona Coast Route",
    city: "Barcelona",
    country: "Spain",
    totalDistanceKm: 12,
    coverImage: "/posters/Barcelona.jpg",
    description: "A balanced Mediterranean city route with beachside rhythm and landmark pacing for routine training.",
    motivation: "Stack everyday runs into a bright coastal journey from Gaudi icons to the waterfront.",
    tier: "Standard",
    priceStamps: 80,
    sourceType: "personal",
    sourceCrewId: null,
    landmarks: [
      { id: "sagrada-familia", name: "Sagrada Familia", milestoneKm: 3, description: "A vivid early unlock that anchors the route in Barcelona.", image: "" },
      { id: "barceloneta-beach", name: "Barceloneta Beach", milestoneKm: 7, description: "A breezy midpoint reward that opens the route toward the sea.", image: "" },
      { id: "park-guell", name: "Park Guell", milestoneKm: 11, description: "A near-finish reveal with color, height, and city views.", image: "" }
    ],
    decorations: [
      { id: "mosaic-shell", name: "Mosaic Shell", rarity: "common", description: "A beachside tile motif with Mediterranean color." },
      { id: "citrus-awning", name: "Citrus Awning", rarity: "common", description: "A bright striped market awning." },
      { id: "gaudi-lizard", name: "Gaudi Lizard", rarity: "rare", description: "A playful art-piece collectible." },
      { id: "beach-chiringuito", name: "Beach Chiringuito", rarity: "epic", description: "A full snack stand from the coast route." },
      { id: "sunburst-cathedral-window", name: "Sunburst Cathedral Window", rarity: "legendary", description: "A radiant showpiece inspired by Barcelona's skyline." }
    ]
  },
  {
    id: "london-landmark-route",
    name: "London Landmark Route",
    city: "London",
    country: "United Kingdom",
    totalDistanceKm: 22,
    coverImage: "/posters/london.jpg",
    description: "A longer city route stitched through iconic London stops for users chasing bigger progression.",
    motivation: "Build a serious travel arc through repeated sessions and visible achievement pacing.",
    tier: "Advanced",
    priceStamps: 150,
    sourceType: "personal",
    sourceCrewId: null,
    landmarks: [
      { id: "tower-bridge", name: "Tower Bridge", milestoneKm: 5, description: "A recognizable early unlock that makes the route feel ambitious.", image: "" },
      { id: "big-ben", name: "Big Ben", milestoneKm: 12, description: "A classic midpoint reward for sustained consistency.", image: "" },
      { id: "hyde-park", name: "Hyde Park", milestoneKm: 19, description: "A late-route green landmark before full completion.", image: "" }
    ],
    decorations: [
      { id: "tea-caddy", name: "Tea Caddy", rarity: "common", description: "A polished tin from a London pantry shelf." },
      { id: "rainy-umbrella", name: "Rainy Umbrella", rarity: "common", description: "A dependable city-weather keepsake." },
      { id: "red-phone-box", name: "Red Phone Box", rarity: "rare", description: "An unmistakable London street collectible." },
      { id: "double-decker-stop", name: "Double-Decker Stop", rarity: "epic", description: "A full bus-stop scene for your collection." },
      { id: "crown-archway", name: "Crown Archway", rarity: "legendary", description: "A regal route centerpiece earned through repeated long runs." }
    ]
  },
  {
    id: "paris-eiffel-route",
    name: "Eiffel Tower Route",
    city: "Paris",
    country: "France",
    totalDistanceKm: 30,
    coverImage: "/posters/paris.jpg",
    description: "A premium city journey for long-term players who want a more aspirational map to unlock.",
    motivation: "Save stamps, unlock Paris, and turn consistency into a richer destination chase.",
    tier: "Premium",
    priceStamps: 210,
    sourceType: "personal",
    sourceCrewId: null,
    landmarks: [
      {
        id: "louvre-courtyard",
        name: "Louvre Courtyard",
        milestoneKm: 8,
        description: "An elegant early landmark that sets the tone for the route.",
        image: "/models/landmarks/paris-route/louvre-courtyard.png"
      },
      {
        id: "eiffel-tower",
        name: "Eiffel Tower",
        milestoneKm: 16,
        description: "The route’s central reward and emotional midpoint.",
        image: "/models/landmarks/paris-route/eiffel-tower.png"
      },
      {
        id: "arc-de-triomphe",
        name: "Arc de Triomphe",
        milestoneKm: 27,
        description: "A premium late-route reveal before the final push.",
        image: "/models/landmarks/paris-route/arc-de-triomphe.png"
      }
    ],
    decorations: [
      {
        id: "baguette",
        name: "Baguette",
        rarity: "common",
        description: "A classic bakery drop from the Paris route.",
        image: "/models/decoration/paris-route/baguette.png"
      },
      {
        id: "chartreux",
        name: "Chartreux",
        rarity: "common",
        description: "A quiet Parisian cat collectible for repeat runs.",
        image: "/models/decoration/paris-route/chartreux.png"
      },
      {
        id: "clafoutis",
        name: "Clafoutis",
        rarity: "rare",
        description: "A warm dessert reward from the updated Paris set.",
        image: "/models/decoration/paris-route/clafoutis.png"
      },
      {
        id: "peach-melba",
        name: "Peach Melba",
        rarity: "rare",
        description: "A polished cafe dessert from the Paris route pool.",
        image: "/models/decoration/paris-route/peach-melba.png"
      },
      {
        id: "cabernet-sauvignon",
        name: "Cabernet Sauvignon",
        rarity: "epic",
        description: "A refined bottle reward for deeper Paris progress.",
        image: "/models/decoration/paris-route/cabernet-sauvignon.png"
      },
      {
        id: "luxury-bag",
        name: "Luxury Bag",
        rarity: "legendary",
        description: "A fashion showpiece reserved for dedicated Paris runners.",
        image: "/models/decoration/paris-route/luxury-bag.png"
      }
    ]
  },
  {
    id: "mount-fuji-route",
    name: "Mount Fuji Route",
    city: "Shizuoka",
    country: "Japan",
    totalDistanceKm: 35,
    coverImage: "/posters/fuji.jpg",
    description: "A high-value premium route that frames long-term effort as a slow ascent toward a legendary view.",
    motivation: "Reserve this for players who want their next major unlock target to feel special.",
    tier: "Premium",
    priceStamps: 250,
    sourceType: "personal",
    sourceCrewId: null,
    landmarks: [
      { id: "torii-gate", name: "Torii Gate", milestoneKm: 9, description: "A quiet early unlock that signals the route’s atmosphere.", image: "" },
      { id: "fuji-base-camp", name: "Fuji Base Camp", milestoneKm: 18, description: "The midpoint checkpoint where the route starts feeling substantial.", image: "" },
      { id: "fuji-summit-view", name: "Summit View", milestoneKm: 32, description: "A premium late-route memory before completion.", image: "" }
    ],
    decorations: [
      { id: "trail-bell", name: "Trail Bell", rarity: "common", description: "A mountain-path charm with a clear ring." },
      { id: "cedar-wayfinder", name: "Cedar Wayfinder", rarity: "common", description: "A weathered marker from the ascent trail." },
      { id: "summit-stamp", name: "Summit Stamp", rarity: "rare", description: "A climber's mark from higher elevation." },
      { id: "cloud-shrine", name: "Cloud Shrine", rarity: "epic", description: "A misty ridge shrine framed by the route." },
      { id: "fuji-sunrise-panorama", name: "Fuji Sunrise Panorama", rarity: "legendary", description: "A sweeping sunrise scene reserved for your longest journeys." }
    ]
  },
  {
    id: "aurora-harbor-route",
    name: "Aurora Harbor Route",
    city: "Reykjavik",
    country: "Iceland",
    totalDistanceKm: 14,
    coverImage: "/posters/Reykjavik.jpg",
    description: "A PaceCrew-only shoreline route unlocked through shared missions and held as a team reward.",
    motivation: "This destination belongs to your social archive rather than the solo unlock flow.",
    tier: "Standard",
    priceStamps: 0,
    sourceType: "pacecrew",
    crewOnly: true,
    sourceCrewId: null,
    landmarks: [
      { id: "glass-harbor", name: "Glass Harbor", milestoneKm: 3, description: "A reflective waterfront stop held inside the crew archive.", image: "" },
      { id: "aurora-point", name: "Aurora Point", milestoneKm: 8, description: "A northern-light memory unlocked for viewing in Paceport.", image: "" },
      { id: "lighthouse-dock", name: "Lighthouse Dock", milestoneKm: 13, description: "A late archive reward that stays exclusive to PaceCrew progress.", image: "" }
    ]
  },
  {
    id: "melbourne-laneway-route",
    name: "Melbourne Laneway Route",
    city: "Melbourne",
    country: "Australia",
    totalDistanceKm: 12,
    coverImage: "/posters/Melbourne.jpg",
    description: "A PaceCrew-only city route granted as a mission reward and displayed as a team-earned destination.",
    motivation: "This route cannot be bought or run individually. It exists as a shared crew reward inside Paceport.",
    tier: "Advanced",
    priceStamps: 0,
    sourceType: "pacecrew",
    crewOnly: true,
    sourceCrewId: null,
    landmarks: [
      { id: "flinders-street", name: "Flinders Street Station", milestoneKm: 3, description: "A classic city opening preserved as a crew unlock.", image: "" },
      { id: "hosier-lane", name: "Hosier Lane", milestoneKm: 7, description: "A central reward that marks shared team effort.", image: "" },
      { id: "royal-botanic-gardens", name: "Royal Botanic Gardens", milestoneKm: 11, description: "A late green memory that stays marked as PaceCrew-only.", image: "" }
    ]
  }
];
