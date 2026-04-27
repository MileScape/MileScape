import mapboxgl from "mapbox-gl";
import { AlertCircle, MapIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export interface PaceportCountrySummary {
  code: string;
  name: string;
  routeCount: number;
  unlockedRouteCount: number;
  lockedRouteCount: number;
  completedRouteCount: number;
  visitedRouteCount: number;
  progressPercent: number;
}

interface WorldProgressMapProps {
  countries: PaceportCountrySummary[];
  selectedCountryCode: string | null;
  onSelectCountry: (countryCode: string) => void;
}

const mapSourceId = "paceport-country-boundaries";
const routeFillLayerId = "paceport-country-route-fill";
const routeLineLayerId = "paceport-country-route-line";
const selectedFillLayerId = "paceport-country-selected-fill";
const selectedLineLayerId = "paceport-country-selected-line";
const sourceLayer = "country_boundaries";
const mapStyle = "mapbox://styles/mapbox/standard";
const alpha3ByAlpha2: Record<string, string> = {
  AU: "AUS",
  CN: "CHN",
  ES: "ESP",
  FR: "FRA",
  GB: "GBR",
  IS: "ISL",
  JP: "JPN",
  PT: "PRT",
  US: "USA",
};

const alpha2ByAlpha3 = Object.fromEntries(
  Object.entries(alpha3ByAlpha2).map(([alpha2, alpha3]) => [alpha3, alpha2]),
);

const toAlpha3Codes = (codes: string[]) => codes.map((code) => alpha3ByAlpha2[code]).filter(Boolean);

const createCountryMatchExpression = (codes: string[]): mapboxgl.ExpressionSpecification =>
  codes.length > 0
    ? [
        "any",
        ["match", ["get", "iso_3166_1"], codes, true, false],
        ["match", ["get", "iso_3166_1_alpha_3"], toAlpha3Codes(codes), true, false],
      ]
    : ["==", ["get", "iso_3166_1"], ""];

const createCountryFilter = (codes: string[]): mapboxgl.FilterSpecification => [
  "all",
  createCountryMatchExpression(codes),
];

const createSelectedFilter = (countryCode: string | null): mapboxgl.FilterSpecification => [
  "all",
  countryCode ? createCountryMatchExpression([countryCode]) : ["==", ["get", "iso_3166_1"], ""],
];

const createFillColorExpression = (
  selectedCountryCode: string | null,
  completedCountryCodes: string[],
  visitedCountryCodes: string[],
  unlockedCountryCodes: string[],
): mapboxgl.ExpressionSpecification => [
  "case",
  createCountryMatchExpression(selectedCountryCode ? [selectedCountryCode] : []),
  "#405f49",
  createCountryMatchExpression(completedCountryCodes),
  "#6e8f70",
  createCountryMatchExpression(visitedCountryCodes),
  "#91ad91",
  createCountryMatchExpression(unlockedCountryCodes),
  "#9fb99f",
  "#9fb99f",
];

const getCountryCodeFromFeature = (feature?: mapboxgl.MapboxGeoJSONFeature) => {
  const alpha2 = feature?.properties?.iso_3166_1 as string | undefined;
  const alpha3 = feature?.properties?.iso_3166_1_alpha_3 as string | undefined;
  return alpha2 ?? (alpha3 ? alpha2ByAlpha3[alpha3] : undefined);
};

const setBasemapConfig = (map: mapboxgl.Map, property: string, value: boolean | string) => {
  try {
    map.setConfigProperty("basemap", property, value);
  } catch {
    // Standard basemap config is not available for every Mapbox style.
  }
};

const simplifyWorldMapLabels = (map: mapboxgl.Map) => {
  setBasemapConfig(map, "language", "en");
  setBasemapConfig(map, "showPointOfInterestLabels", false);
  setBasemapConfig(map, "showTransitLabels", false);
  setBasemapConfig(map, "showRoadLabels", false);
  setBasemapConfig(map, "showPlaceLabels", true);
  setBasemapConfig(map, "showRoadsAndTransit", false);

  const styleLayers = map.getStyle().layers ?? [];
  styleLayers.forEach((layer) => {
    if (layer.type !== "symbol") {
      return;
    }

    const layerId = layer.id.toLowerCase();
    const shouldKeep = layerId.includes("country") || layerId.includes("place") || layerId.includes("settlement");

    try {
      map.setLayoutProperty(layer.id, "visibility", shouldKeep ? "visible" : "none");
      if (shouldKeep) {
        map.setPaintProperty(layer.id, "text-opacity", 0.42);
      }
    } catch {
      // Imported Standard style layers do not always allow direct edits.
    }
  });
};

export const WorldProgressMap = ({ countries, selectedCountryCode, onSelectCountry }: WorldProgressMapProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const countrySummariesRef = useRef(new Map<string, PaceportCountrySummary>());
  const onSelectCountryRef = useRef(onSelectCountry);
  const [mapReady, setMapReady] = useState(false);
  const mapToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  const countryGroups = useMemo(() => {
    const routeCountryCodes = countries.map((country) => country.code);
    const unlockedCountryCodes = countries
      .filter((country) => country.unlockedRouteCount > 0)
      .map((country) => country.code);
    const visitedCountryCodes = countries
      .filter((country) => country.visitedRouteCount > 0)
      .map((country) => country.code);
    const completedCountryCodes = countries
      .filter((country) => country.completedRouteCount === country.routeCount && country.routeCount > 0)
      .map((country) => country.code);

    return {
      routeCountryCodes,
      unlockedCountryCodes,
      visitedCountryCodes,
      completedCountryCodes,
    };
  }, [countries]);

  useEffect(() => {
    countrySummariesRef.current = new Map(countries.map((country) => [country.code, country]));
  }, [countries]);

  useEffect(() => {
    onSelectCountryRef.current = onSelectCountry;
  }, [onSelectCountry]);

  useEffect(() => {
    if (!containerRef.current || !mapToken) {
      setMapReady(false);
      return;
    }

    mapboxgl.accessToken = mapToken;
    mapboxgl.prewarm();

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: mapStyle,
      config: {
        basemap: {
          language: "en",
          show3dObjects: false,
          showPointOfInterestLabels: false,
          showTransitLabels: false,
          showRoadLabels: false,
          showRoadsAndTransit: false,
          showPlaceLabels: true,
        },
      },
      center: [12, 18],
      zoom: 0.55,
      minZoom: 0.55,
      maxZoom: 0.55,
      pitch: 0,
      bearing: 0,
      projection: "mercator",
      maxBounds: [
        [-180, -72],
        [180, 82],
      ],
      renderWorldCopies: false,
      attributionControl: false,
      fadeDuration: 140,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-left");
    map.scrollZoom.disable();
    map.boxZoom.disable();
    map.dragRotate.disable();
    map.keyboard.disable();
    map.doubleClickZoom.disable();
    map.touchZoomRotate.disable();
    map.touchZoomRotate.disableRotation();
    map.dragPan.enable();

    resizeObserverRef.current = new ResizeObserver(() => {
      window.requestAnimationFrame(() => {
        map.resize();
        map.triggerRepaint();
      });
    });
    resizeObserverRef.current.observe(containerRef.current);

    const addPaceportLayers = () => {
      simplifyWorldMapLabels(map);
      map.setFog({
        color: "#f5f3ee",
        "high-color": "#edf5ef",
        "horizon-blend": 0.04,
        "space-color": "#f8faf5",
        "star-intensity": 0,
      });

      if (!map.getSource(mapSourceId)) {
        map.addSource(mapSourceId, {
          type: "vector",
          url: "mapbox://mapbox.country-boundaries-v1",
        });
      }

      if (!map.getLayer(routeFillLayerId)) {
        map.addLayer({
          id: routeFillLayerId,
          type: "fill",
          source: mapSourceId,
          "source-layer": sourceLayer,
          filter: createCountryFilter(countryGroups.routeCountryCodes),
          paint: {
            "fill-color": createFillColorExpression(
              selectedCountryCode,
              countryGroups.completedCountryCodes,
              countryGroups.visitedCountryCodes,
              countryGroups.unlockedCountryCodes,
            ),
            "fill-opacity": [
              "case",
              createCountryMatchExpression(selectedCountryCode ? [selectedCountryCode] : []),
              0.66,
              createCountryMatchExpression(countryGroups.unlockedCountryCodes),
              0.5,
              0.5,
            ],
          },
        });
      }

      if (!map.getLayer(routeLineLayerId)) {
        map.addLayer({
          id: routeLineLayerId,
          type: "line",
          source: mapSourceId,
          "source-layer": sourceLayer,
          filter: createCountryFilter(countryGroups.routeCountryCodes),
          paint: {
            "line-color": "rgba(255,255,255,0.72)",
            "line-width": [
              "case",
              createCountryMatchExpression(countryGroups.unlockedCountryCodes),
              1.2,
              0.7,
            ],
          },
        });
      }

      if (!map.getLayer(selectedFillLayerId)) {
        map.addLayer({
          id: selectedFillLayerId,
          type: "fill",
          source: mapSourceId,
          "source-layer": sourceLayer,
          filter: createSelectedFilter(selectedCountryCode),
          paint: {
            "fill-color": "#405f49",
            "fill-opacity": 0.22,
          },
        });
      }

      if (!map.getLayer(selectedLineLayerId)) {
        map.addLayer({
          id: selectedLineLayerId,
          type: "line",
          source: mapSourceId,
          "source-layer": sourceLayer,
          filter: createSelectedFilter(selectedCountryCode),
          paint: {
            "line-color": "#243228",
            "line-opacity": 0.58,
            "line-width": 2.2,
          },
        });
      }

      map.on("click", routeFillLayerId, (event) => {
        const countryCode = getCountryCodeFromFeature(event.features?.[0]);
        const summary = countryCode ? countrySummariesRef.current.get(countryCode) : undefined;

        if (countryCode && summary) {
          onSelectCountryRef.current(countryCode);
        }
      });

      map.on("mousemove", routeFillLayerId, (event) => {
        const countryCode = getCountryCodeFromFeature(event.features?.[0]);
        const summary = countryCode ? countrySummariesRef.current.get(countryCode) : undefined;
        map.getCanvas().style.cursor = summary ? "pointer" : "";
      });

      map.on("mouseleave", routeFillLayerId, () => {
        map.getCanvas().style.cursor = "";
      });

      setMapReady(true);
      window.setTimeout(() => map.resize(), 40);
    };

    map.once("load", addPaceportLayers);

    return () => {
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [mapToken]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) {
      return;
    }

    if (map.getLayer(routeFillLayerId)) {
      map.setFilter(routeFillLayerId, createCountryFilter(countryGroups.routeCountryCodes));
      map.setPaintProperty(
        routeFillLayerId,
        "fill-color",
        createFillColorExpression(
          selectedCountryCode,
          countryGroups.completedCountryCodes,
          countryGroups.visitedCountryCodes,
          countryGroups.unlockedCountryCodes,
        ),
      );
      map.setPaintProperty(routeFillLayerId, "fill-opacity", [
        "case",
        createCountryMatchExpression(selectedCountryCode ? [selectedCountryCode] : []),
        0.66,
        createCountryMatchExpression(countryGroups.unlockedCountryCodes),
        0.5,
        0.5,
      ]);
    }

    if (map.getLayer(routeLineLayerId)) {
      map.setFilter(routeLineLayerId, createCountryFilter(countryGroups.routeCountryCodes));
      map.setPaintProperty(routeLineLayerId, "line-width", [
        "case",
        createCountryMatchExpression(countryGroups.unlockedCountryCodes),
        1.2,
        0.7,
      ]);
    }

    if (map.getLayer(selectedFillLayerId)) {
      map.setFilter(selectedFillLayerId, createSelectedFilter(selectedCountryCode));
    }

    if (map.getLayer(selectedLineLayerId)) {
      map.setFilter(selectedLineLayerId, createSelectedFilter(selectedCountryCode));
    }
  }, [countryGroups, mapReady, selectedCountryCode]);

  return (
    <div className="paceport-world-map route-map-shell relative h-full w-full overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.96)_0%,rgba(245,243,238,0.28)_48%,rgba(198,218,205,0.28)_100%)]" />
      <div ref={containerRef} className="absolute inset-0 bg-[#edf4ef]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[linear-gradient(180deg,#f5f3ee_0%,rgba(245,243,238,0.9)_18%,rgba(239,246,241,0.52)_46%,rgba(239,246,241,0.16)_72%,rgba(239,246,241,0)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_50%,rgba(245,243,238,0.5)_100%)]" />

      {!mapToken ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-sage-900/15 text-white/90 backdrop-blur-[2px]">
          <AlertCircle className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-[0.24em]">Add Mapbox token</span>
        </div>
      ) : !mapReady ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-sage-900/12 text-white/90 backdrop-blur-[1px]">
          <MapIcon className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-[0.24em]">Loading world map</span>
        </div>
      ) : null}
    </div>
  );
};
