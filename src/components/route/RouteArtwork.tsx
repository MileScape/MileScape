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
  const [mapReady, setMapReady] = useState(false);
  const mapToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  const view = useMemo(() => routeMapViews[routeId] ?? defaultView, [routeId]);

  useEffect(() => {
    if (!containerRef.current || !mapToken) {
      setMapReady(false);
      return;
    }

    mapboxgl.accessToken = mapToken;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/standard",
      center: view.center,
      zoom: view.zoom,
      pitch: view.pitch,
      bearing: view.bearing,
      interactive: false,
      attributionControl: false,
      logoPosition: "bottom-left",
      antialias: true
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-left");

    map.once("load", () => {
      if (!map.getSource("mapbox-dem")) {
        map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14
        });
      }

      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
      map.setFog({
        color: "#f4f7f2",
        "high-color": "#eff6ff",
        "horizon-blend": 0.08,
        "space-color": "#f8fafc",
        "star-intensity": 0
      });

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
              "fill-extrusion-height": ["get", "height"],
              "fill-extrusion-base": ["get", "min_height"],
              "fill-extrusion-opacity": 0.62
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
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [mapToken, routeId, view]);

  useEffect(() => {
    if (!mapRef.current || !mapReady) {
      return;
    }

    mapRef.current.easeTo({
      center: view.center,
      zoom: view.zoom,
      pitch: view.pitch,
      bearing: view.bearing,
      duration: 900
    });

    if (markerRef.current && view.marker) {
      markerRef.current.setLngLat(view.marker);
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
          "absolute inset-0 overflow-hidden bg-[#0f172a]",
          variant === "hero" ? "rounded-none shadow-none" : "rounded-[32px] shadow-card",
        )}
      >
        <div ref={containerRef} className="absolute inset-0" />
        <div
          className={cn(
            "absolute inset-0",
            variant === "hero"
              ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_24%,transparent_72%,rgba(7,13,10,0.08))]"
              : "bg-[radial-gradient(circle_at_center,transparent_68%,rgba(10,20,30,0.08)_100%)]",
          )}
        />

        {!mapToken ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/25 text-white/85 backdrop-blur-[2px]">
            <AlertCircle className="h-5 w-5" />
            <span className={cn("font-medium", sizeStyle.label)}>Add Mapbox token</span>
          </div>
        ) : !mapReady ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/20 text-white/85 backdrop-blur-[1px]">
            <MapIcon className="h-5 w-5" />
            <span className={cn("font-medium", sizeStyle.label)}>Loading map</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};
