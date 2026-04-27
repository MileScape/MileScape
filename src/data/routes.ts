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
    coverImage: "/posters/Tokyo.jpg",
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
