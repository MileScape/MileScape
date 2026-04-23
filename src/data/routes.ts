import type { Route } from "../types";

export const routes: Route[] = [
  {
    id: "west-lake-loop",
    name: "West Lake Loop",
    city: "Hangzhou",
    country: "China",
    totalDistanceKm: 20,
    coverImage: "",
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
    ]
  },
  {
    id: "central-park-loop",
    name: "Central Park Loop",
    city: "New York",
    country: "United States",
    totalDistanceKm: 10,
    coverImage: "",
    description: "A brisk city escape built for users who want fast progress and satisfying unlocks.",
    motivation: "Turn ordinary training days into a cinematic park circuit filled with familiar landmarks.",
    tier: "Standard",
    priceStamps: 70,
    sourceType: "personal",
    sourceCrewId: null,
    landmarks: [
      { id: "statue-of-liberty", name: "Statue of Liberty", milestoneKm: 2, description: "Your first New York memory appears after a real run in the park.", image: "" },
      { id: "bow-bridge", name: "Bow Bridge", milestoneKm: 5, description: "The midpoint unlock where consistency starts looking beautiful.", image: "" },
      { id: "belvedere-castle", name: "Belvedere Castle", milestoneKm: 8, description: "A near-finish reward that reframes the route as an adventure.", image: "" }
    ]
  },
  {
    id: "tokyo-city-route",
    name: "Tokyo City Route",
    city: "Tokyo",
    country: "Japan",
    totalDistanceKm: 18,
    coverImage: "",
    description: "A neon-to-tranquil city journey that rewards persistence with memorable urban scenes.",
    motivation: "Build a personal travel diary through repeated short runs and unlock Tokyo piece by piece.",
    tier: "Advanced",
    priceStamps: 130,
    sourceType: "personal",
    sourceCrewId: null,
    landmarks: [
      { id: "torii-gate", name: "Torii Gate", milestoneKm: 4, description: "The first Tokyo landmark arrives after your opening real run progress.", image: "" },
      { id: "tokyo-tower", name: "Tokyo Tower", milestoneKm: 10, description: "A bigger Tokyo memory unlocks later as the route deepens.", image: "" }
    ]
  },
  {
    id: "lisbon-tram-route",
    name: "Lisbon Tram Route",
    city: "Lisbon",
    country: "Portugal",
    totalDistanceKm: 7,
    coverImage: "",
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
    ]
  },
  {
    id: "seoul-river-route",
    name: "Seoul River Route",
    city: "Seoul",
    country: "South Korea",
    totalDistanceKm: 12,
    coverImage: "",
    description: "A balanced urban route with riverfront momentum and landmark pacing that fits routine training.",
    motivation: "Stack everyday runs into a smooth city journey with clear mid-length milestones.",
    tier: "Standard",
    priceStamps: 80,
    sourceType: "personal",
    sourceCrewId: null,
    landmarks: [
      { id: "banpo-bridge", name: "Banpo Bridge", milestoneKm: 3, description: "A calm early unlock over the river.", image: "" },
      { id: "namsan-view", name: "Namsan View", milestoneKm: 7, description: "A midpoint reward that makes the route feel expansive.", image: "" },
      { id: "dongdaemun-design", name: "Dongdaemun Design Plaza", milestoneKm: 11, description: "A near-finish reveal with a futuristic feel.", image: "" }
    ]
  },
  {
    id: "manhattan-landmark-route",
    name: "Manhattan Landmark Route",
    city: "New York",
    country: "United States",
    totalDistanceKm: 22,
    coverImage: "",
    description: "A longer city route stitched through iconic Manhattan stops for users chasing bigger progression.",
    motivation: "Build a serious travel arc through repeated sessions and visible achievement pacing.",
    tier: "Advanced",
    priceStamps: 150,
    sourceType: "personal",
    sourceCrewId: null,
    landmarks: [
      { id: "flatiron-building", name: "Flatiron Building", milestoneKm: 5, description: "A recognizable early unlock that makes the route feel ambitious.", image: "" },
      { id: "times-square", name: "Times Square", milestoneKm: 12, description: "A bright midpoint reward for sustained consistency.", image: "" },
      { id: "brooklyn-view", name: "Brooklyn Bridge View", milestoneKm: 19, description: "A late-route landmark before full completion.", image: "" }
    ]
  },
  {
    id: "paris-eiffel-route",
    name: "Eiffel Tower Route",
    city: "Paris",
    country: "France",
    totalDistanceKm: 30,
    coverImage: "",
    description: "A premium city journey for long-term players who want a more aspirational map to unlock.",
    motivation: "Save stamps, unlock Paris, and turn consistency into a richer destination chase.",
    tier: "Premium",
    priceStamps: 210,
    sourceType: "personal",
    sourceCrewId: null,
    landmarks: [
      { id: "louvre-courtyard", name: "Louvre Courtyard", milestoneKm: 8, description: "An elegant early landmark that sets the tone for the route.", image: "" },
      { id: "eiffel-tower", name: "Eiffel Tower", milestoneKm: 16, description: "The route’s central reward and emotional midpoint.", image: "" },
      { id: "arc-de-triomphe", name: "Arc de Triomphe", milestoneKm: 27, description: "A premium late-route reveal before the final push.", image: "" }
    ]
  },
  {
    id: "mount-fuji-route",
    name: "Mount Fuji Route",
    city: "Shizuoka",
    country: "Japan",
    totalDistanceKm: 35,
    coverImage: "",
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
    ]
  },
  {
    id: "aurora-harbor-route",
    name: "Aurora Harbor Route",
    city: "Reykjavik",
    country: "Iceland",
    totalDistanceKm: 14,
    coverImage: "",
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
    id: "midnight-river-route",
    name: "Midnight River Route",
    city: "Singapore",
    country: "Singapore",
    totalDistanceKm: 16,
    coverImage: "",
    description: "A PaceCrew-only night route granted as a mission reward and displayed as a team-earned destination.",
    motivation: "This route cannot be bought or run individually. It exists as a crew reward inside Paceport.",
    tier: "Advanced",
    priceStamps: 0,
    sourceType: "pacecrew",
    crewOnly: true,
    sourceCrewId: null,
    landmarks: [
      { id: "neon-quay", name: "Neon Quay", milestoneKm: 4, description: "A night-lit river opening preserved as a crew unlock.", image: "" },
      { id: "skybridge-deck", name: "Skybridge Deck", milestoneKm: 9, description: "A central reward that marks shared team effort.", image: "" },
      { id: "lantern-market", name: "Lantern Market", milestoneKm: 15, description: "A late memory that stays marked as PaceCrew-only.", image: "" }
    ]
  }
];
