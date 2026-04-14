import type { Route } from "../types";

export const routes: Route[] = [
  {
    id: "west-lake-loop",
    name: "West Lake Loop",
    city: "Hangzhou",
    country: "China",
    totalDistanceKm: 20,
    coverImage:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    description:
      "A poetic lakeside route that turns short neighborhood runs into a slow unfolding travel story.",
    motivation:
      "Collect waterside memories one kilometer at a time and let every run reveal a calmer view.",
    landmarks: [
      {
        id: "broken-bridge",
        name: "Broken Bridge",
        milestoneKm: 3,
        description: "Your first iconic stop, where the route begins to feel real.",
        image:
          "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=900&q=80"
      },
      {
        id: "leifeng-pagoda",
        name: "Leifeng Pagoda",
        milestoneKm: 9,
        description: "A milestone with elevation, history, and a sense of earned momentum.",
        image:
          "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80"
      },
      {
        id: "three-pools",
        name: "Three Pools Mirroring the Moon",
        milestoneKm: 16,
        description: "A quiet late-route unlock that marks serious commitment.",
        image:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"
      }
    ]
  },
  {
    id: "central-park-loop",
    name: "Central Park Loop",
    city: "New York",
    country: "United States",
    totalDistanceKm: 10,
    coverImage:
      "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=1200&q=80",
    description:
      "A brisk city escape built for users who want fast progress and satisfying unlocks.",
    motivation:
      "Turn ordinary training days into a cinematic park circuit filled with familiar landmarks.",
    landmarks: [
      {
        id: "bethesda-terrace",
        name: "Bethesda Terrace",
        milestoneKm: 2,
        description: "A quick early reward that makes the first run feel meaningful.",
        image:
          "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=900&q=80"
      },
      {
        id: "bow-bridge",
        name: "Bow Bridge",
        milestoneKm: 5,
        description: "The midpoint unlock where consistency starts looking beautiful.",
        image:
          "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=900&q=80"
      },
      {
        id: "belvedere-castle",
        name: "Belvedere Castle",
        milestoneKm: 8,
        description: "A near-finish reward that reframes the route as an adventure.",
        image:
          "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=900&q=80"
      }
    ]
  },
  {
    id: "tokyo-city-route",
    name: "Tokyo City Route",
    city: "Tokyo",
    country: "Japan",
    totalDistanceKm: 18,
    coverImage:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80",
    description:
      "A neon-to-tranquil city journey that rewards persistence with memorable urban scenes.",
    motivation:
      "Build a personal travel diary through repeated short runs and unlock Tokyo piece by piece.",
    landmarks: [
      {
        id: "shibuya-crossing",
        name: "Shibuya Crossing",
        milestoneKm: 4,
        description: "The energy-packed first reveal that turns progress into place.",
        image:
          "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=900&q=80"
      },
      {
        id: "meiji-shrine",
        name: "Meiji Shrine",
        milestoneKm: 10,
        description: "A calm, reflective midpoint reward that slows the rhythm beautifully.",
        image:
          "https://images.unsplash.com/photo-1526481280695-3c4691d4b375?auto=format&fit=crop&w=900&q=80"
      },
      {
        id: "tokyo-tower",
        name: "Tokyo Tower",
        milestoneKm: 17,
        description: "The final dramatic unlock before full route completion.",
        image:
          "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=900&q=80"
      }
    ]
  }
];
