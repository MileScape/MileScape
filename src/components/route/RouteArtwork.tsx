import mapboxgl from "mapbox-gl";
import { AlertCircle, MapIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { routeMapViews } from "../../data/routeMapViews";
import { cn } from "../../utils/cn";

interface RouteArtworkProps {
  routeId: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  active?: boolean;
  variant?: "card" | "hero";
  className?: string;
}

const palettes: Record<
  string,
  {
    glow: string;
    accent: string;
  }
> = {
  "west-lake-loop": {
    glow: "from-emerald-100/80 to-sky-100/30",
    accent: "bg-emerald-500"
  },
  "central-park-loop": {
    glow: "from-green-100/80 to-blue-100/35",
    accent: "bg-blue-500"
  },
  "tokyo-city-route": {
    glow: "from-sky-100/80 to-cyan-100/30",
    accent: "bg-cyan-500"
  }
};

const sizeStyles = {
  sm: {
    wrapper: "h-24 w-36",
    label: "text-[10px]"
  },
  md: {
    wrapper: "h-32 w-48",
    label: "text-xs"
  },
  lg: {
    wrapper: "h-52 w-full",
    label: "text-sm"
  }
};

const defaultView = {
  center: [0, 0] as [number, number],
  zoom: 1.4,
  pitch: 0,
  bearing: 0
};

const simplifyMapLabels = (map: mapboxgl.Map) => {
  const setBasemapConfig = (property: string, value: boolean | string) => {
    try {
      map.setConfigProperty("basemap", property, value);
    } catch {
      // Older/custom styles may not expose Standard basemap config.
    }
  };

  setBasemapConfig("language", "en");
  setBasemapConfig("showPointOfInterestLabels", false);
  setBasemapConfig("showTransitLabels", false);
  setBasemapConfig("showRoadLabels", false);
  setBasemapConfig("showPlaceLabels", true);

  const styleLayers = map.getStyle().layers ?? [];
  styleLayers.forEach((layer) => {
    if (layer.type !== "symbol") {
      return;
    }

    const layerId = layer.id.toLowerCase();
    const shouldKeep =
      layerId.includes("place") ||
      layerId.includes("settlement") ||
      layerId.includes("water") ||
      layerId.includes("road-label") ||
      layerId.includes("road-number");

    try {
      map.setLayoutProperty(layer.id, "visibility", shouldKeep ? "visible" : "none");
      if (shouldKeep) {
        map.setLayoutProperty(layer.id, "text-field", [
          "coalesce",
          ["get", "name_en"],
          ["get", "name"],
        ]);
        map.setPaintProperty(layer.id, "text-opacity", layerId.includes("road") ? 0.36 : 0.5);
      }
    } catch {
      // Some imported Standard style layers cannot be controlled directly.
    }
  });
};

export const RouteArtwork = ({
  routeId,
  label: _label,
  size = "lg",
  active = false,
  variant = "card",
  className
}: RouteArtworkProps) => {
  const palette = palettes[routeId] ?? palettes["central-park-loop"];
  const sizeStyle = sizeStyles[size];
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const mapToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  const view = useMemo(() => routeMapViews[routeId] ?? defaultView, [routeId]);

  useEffect(() => {
    if (!containerRef.current || !mapToken) {
      setMapReady(false);
      return;
    }

    mapboxgl.accessToken = mapToken;
    mapboxgl.prewarm();

    const container = containerRef.current;
    const map = new mapboxgl.Map({
      container,
      style: "mapbox://styles/mapbox/standard",
      config: {
        basemap: {
          language: "en",
          showPointOfInterestLabels: false,
          showTransitLabels: false,
          showRoadLabels: false,
          showPlaceLabels: false
        }
      },
      center: view.center,
      zoom: view.zoom,
      pitch: view.pitch,
      bearing: view.bearing,
      interactive: false,
      attributionControl: false,
      logoPosition: "bottom-left",
      antialias: true,
      fadeDuration: 80
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-left");

    resizeObserverRef.current = new ResizeObserver(() => {
      window.requestAnimationFrame(() => {
        map.resize();
        map.triggerRepaint();
      });
    });
    resizeObserverRef.current.observe(container);

    map.once("load", () => {
      if (!map.getSource("mapbox-dem")) {
        map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14
        });
      }

      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.85 });
      map.setFog({
        color: "#f4f7f2",
        "high-color": "#eff6ff",
        "horizon-blend": 0.08,
        "space-color": "#f8fafc",
        "star-intensity": 0
      });
      simplifyMapLabels(map);

      const styleLayers = map.getStyle().layers ?? [];
      const labelLayerId = styleLayers.find(
        (layer) => layer.type === "symbol" && layer.layout?.["text-field"],
      )?.id;

      if (!map.getLayer("3d-buildings")) {
        map.addLayer(
          {
            id: "3d-buildings",
            source: "composite",
            "source-layer": "building",
            filter: ["==", "extrude", "true"],
            type: "fill-extrusion",
            minzoom: 11,
            paint: {
              "fill-extrusion-color": "#d7e6d7",
              "fill-extrusion-height": ["*", ["coalesce", ["get", "height"], 18], 1.18],
              "fill-extrusion-base": ["get", "min_height"],
              "fill-extrusion-opacity": 0.7
            }
          },
          labelLayerId,
        );
      }

      const waterLayerIds = ["water", "water-shadow", "waterway"];
      const greenLayerIds = ["park", "grass", "wood", "natural"];

      waterLayerIds.forEach((layerId) => {
        if (map.getLayer(layerId)) {
          try {
            map.setPaintProperty(layerId, "fill-color", "#82cfff");
          } catch {
            try {
              map.setPaintProperty(layerId, "line-color", "#82cfff");
            } catch {
              // Ignore unsupported paint properties on style layers.
            }
          }
        }
      });

      greenLayerIds.forEach((layerId) => {
        if (map.getLayer(layerId)) {
          try {
            map.setPaintProperty(layerId, "fill-color", "#a8d89a");
          } catch {
            // Ignore unsupported paint properties on style layers.
          }
        }
      });

      if (view.marker) {
        const markerNode = document.createElement("div");
        markerNode.className =
          "h-3.5 w-3.5 rounded-full border-2 border-white bg-sage-700 shadow-[0_0_0_6px_rgba(255,255,255,0.24)]";
        markerRef.current = new mapboxgl.Marker({ element: markerNode })
          .setLngLat(view.marker)
          .addTo(map);
      }

      setMapReady(true);
      window.setTimeout(() => map.resize(), 40);
    });

    return () => {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [mapToken]);

  useEffect(() => {
    if (!mapRef.current || !mapReady) {
      return;
    }

    if (transitionTimeoutRef.current) {
      window.clearTimeout(transitionTimeoutRef.current);
    }

    setIsTransitioning(true);
    mapRef.current.stop();
    mapRef.current.easeTo({
      center: view.center,
      zoom: view.zoom,
      pitch: view.pitch,
      bearing: view.bearing,
      duration: 720,
      essential: true
    });

    mapRef.current.triggerRepaint();

    transitionTimeoutRef.current = window.setTimeout(() => {
      setIsTransitioning(false);
      transitionTimeoutRef.current = null;
    }, 920);

    if (markerRef.current && view.marker) {
      markerRef.current.setLngLat(view.marker);
    } else if (!markerRef.current && view.marker) {
      const markerNode = document.createElement("div");
      markerNode.className =
        "h-3.5 w-3.5 rounded-full border-2 border-white bg-sage-700 shadow-[0_0_0_6px_rgba(255,255,255,0.24)]";
      markerRef.current = new mapboxgl.Marker({ element: markerNode })
        .setLngLat(view.marker)
        .addTo(mapRef.current);
    } else if (markerRef.current && !view.marker) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  }, [mapReady, view]);

  return (
    <div
      className={cn(
        "route-map-shell relative overflow-hidden",
        variant === "hero" ? "h-full w-full" : sizeStyle.wrapper,
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br blur-2xl",
          variant === "hero" ? "rounded-none opacity-0" : "rounded-[32px]",
          palette.glow,
          active ? "opacity-100" : "opacity-75",
        )}
      />
      <div
        className={cn(
          "absolute inset-0 overflow-hidden bg-[#edf4ef]",
          variant === "hero" ? "rounded-none shadow-none" : "rounded-[32px] shadow-card",
        )}
      >
        <div ref={containerRef} className="absolute inset-0 bg-[#edf4ef]" />
        <div
          className={cn(
            "absolute inset-0",
            variant === "hero"
              ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_24%,transparent_72%,rgba(7,13,10,0.08))]"
              : "bg-[radial-gradient(circle_at_center,transparent_68%,rgba(10,20,30,0.08)_100%)]",
          )}
        />
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(235,244,235,0.22),rgba(205,224,211,0.14)_46%,rgba(123,151,132,0.08)_100%)] transition-opacity duration-300",
            isTransitioning ? "opacity-100" : "opacity-0",
          )}
        />

        {!mapToken ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-sage-900/20 text-white/85 backdrop-blur-[2px]">
            <AlertCircle className="h-5 w-5" />
            <span className={cn("font-medium", sizeStyle.label)}>Add Mapbox token</span>
          </div>
        ) : !mapReady ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-sage-900/15 text-white/85 backdrop-blur-[1px]">
            <MapIcon className="h-5 w-5" />
            <span className={cn("font-medium", sizeStyle.label)}>Loading map</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};
