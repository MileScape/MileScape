import { LocateFixed, Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import type { MyScapePlacedLandmark } from "../../types";
import {
  getAssetFootprint,
  getPlacementAnchorPoint,
  getPlacementPreviewCells,
  gridToScreen,
  getItemZIndex,
  MY_SCAPE_DEFAULT_GRID_SIZE,
  MY_SCAPE_TILE_HEIGHT,
  MY_SCAPE_TILE_WIDTH,
  type MyScapeGridSize,
  type UnlockedLandmarkAsset,
} from "../../utils/myScape";
import { PlacedLandmark } from "./PlacedLandmark";

const isFiniteNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const MAP_ZOOM_LEVELS = [0.2, 0.5, 0.75, 1, 1.25, 1.5] as const;
const VIRTUAL_GRID_OVERSCAN_PX = 192;

interface MyScapeBoardProps {
  boardRef: RefObject<HTMLDivElement>;
  assets: UnlockedLandmarkAsset[];
  placedLandmarks: MyScapePlacedLandmark[];
  selectedId: string | null;
  draggingId: string | null;
  entryReady?: boolean;
  dragPreview: { x: number; y: number } | null;
  placementPreview: { assetId: string; col: number; row: number; valid: boolean; active: boolean } | null;
  isEditMode: boolean;
  newTodayIds: Set<string>;
  expanded?: boolean;
  gridSize?: MyScapeGridSize;
  scrollable?: boolean;
  onItemPointerDown: (event: ReactPointerEvent<HTMLButtonElement>, itemId: string) => void;
  onSelectItem: (itemId: string) => void;
}

export const MyScapeBoard = ({
  boardRef,
  assets,
  placedLandmarks,
  selectedId,
  draggingId,
  entryReady = false,
  dragPreview,
  placementPreview,
  isEditMode,
  newTodayIds,
  expanded = false,
  gridSize = MY_SCAPE_DEFAULT_GRID_SIZE,
  scrollable = false,
  onItemPointerDown,
  onSelectItem,
}: MyScapeBoardProps) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const panStateRef = useRef<{
    scrollLeft: number;
    scrollTop: number;
    startX: number;
    startY: number;
  } | null>(null);
  const [mapZoom, setMapZoom] = useState(1);
  const [viewportBounds, setViewportBounds] = useState({
    height: 0,
    scrollLeft: 0,
    scrollTop: 0,
    width: 0,
  });
  const safeGridColumns = Math.max(1, Math.round(gridSize.columns));
  const safeGridRows = Math.max(1, Math.round(gridSize.rows));
  const boardScale = scrollable ? 1 : expanded ? 1 : 0.76;
  const assetMap = new Map(assets.map((asset) => [asset.id, asset]));
  const gridPixelWidth = ((safeGridColumns + safeGridRows) * MY_SCAPE_TILE_WIDTH) / 2;
  const gridPixelHeight = ((safeGridColumns + safeGridRows) * MY_SCAPE_TILE_HEIGHT) / 2;
  const stageWidth = scrollable ? gridPixelWidth + 352 : expanded ? 424 : 386;
  const stageHeight = scrollable ? gridPixelHeight + 464 : expanded ? 356 : 327;
  const boardWidth = scrollable ? gridPixelWidth : expanded ? 352 : 320;
  const boardHeight = scrollable ? gridPixelHeight + 128 : expanded ? 222 : 196;
  const boardLeft = scrollable ? 176 : expanded ? 36 : 33;
  const boardTop = scrollable ? 176 : 24;
  const scaledStageWidth = stageWidth * mapZoom;
  const scaledStageHeight = stageHeight * mapZoom;
  const boardOriginX = boardLeft + boardWidth / 2;
  const boardOriginY = boardTop + boardHeight * 0.12 + 12;
  const gridHalfWidth = (safeGridColumns * MY_SCAPE_TILE_WIDTH) / 2;
  const gridHalfDepth = (safeGridRows * MY_SCAPE_TILE_WIDTH) / 2;
  const platformThickness = scrollable ? 64 : expanded ? 52 : 44;
  const soilInset = scrollable ? 16 : expanded ? 12 : 10;
  const topPoint = `${boardOriginX},${boardOriginY - MY_SCAPE_TILE_HEIGHT / 2}`;
  const rightPoint = `${boardOriginX + gridHalfWidth},${boardOriginY + (safeGridColumns * MY_SCAPE_TILE_HEIGHT) / 2 - MY_SCAPE_TILE_HEIGHT / 2}`;
  const bottomPoint = `${boardOriginX},${boardOriginY + ((safeGridColumns + safeGridRows) * MY_SCAPE_TILE_HEIGHT) / 2 - MY_SCAPE_TILE_HEIGHT / 2}`;
  const leftPoint = `${boardOriginX - gridHalfDepth},${boardOriginY + (safeGridRows * MY_SCAPE_TILE_HEIGHT) / 2 - MY_SCAPE_TILE_HEIGHT / 2}`;
  const leftBottomPoint = `${boardOriginX},${boardOriginY + ((safeGridColumns + safeGridRows) * MY_SCAPE_TILE_HEIGHT) / 2 - MY_SCAPE_TILE_HEIGHT / 2 + platformThickness}`;
  const rightBottomPoint = `${boardOriginX + gridHalfWidth},${boardOriginY + (safeGridColumns * MY_SCAPE_TILE_HEIGHT) / 2 - MY_SCAPE_TILE_HEIGHT / 2 + platformThickness}`;
  const leftFrontPoint = `${boardOriginX - gridHalfDepth},${boardOriginY + (safeGridRows * MY_SCAPE_TILE_HEIGHT) / 2 - MY_SCAPE_TILE_HEIGHT / 2 + platformThickness}`;
  const innerTopPoint = `${boardOriginX},${boardOriginY - MY_SCAPE_TILE_HEIGHT / 2 + soilInset}`;
  const innerRightPoint = `${boardOriginX + gridHalfWidth - soilInset * 1.15},${boardOriginY + (safeGridColumns * MY_SCAPE_TILE_HEIGHT) / 2 - MY_SCAPE_TILE_HEIGHT / 2 + soilInset * 0.58}`;
  const innerBottomPoint = `${boardOriginX},${boardOriginY + ((safeGridColumns + safeGridRows) * MY_SCAPE_TILE_HEIGHT) / 2 - MY_SCAPE_TILE_HEIGHT / 2 - soilInset}`;
  const innerLeftPoint = `${boardOriginX - gridHalfDepth + soilInset * 1.15},${boardOriginY + (safeGridRows * MY_SCAPE_TILE_HEIGHT) / 2 - MY_SCAPE_TILE_HEIGHT / 2 + soilInset * 0.58}`;

  useEffect(() => {
    if (!scrollable) {
      return;
    }

    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    viewport.scrollLeft = Math.max(0, (viewport.scrollWidth - viewport.clientWidth) / 2);
    viewport.scrollTop = Math.max(0, (viewport.scrollHeight - viewport.clientHeight) / 2 - 24);
    setViewportBounds({
      height: viewport.clientHeight,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
      width: viewport.clientWidth,
    });
  }, [scrollable, stageHeight, stageWidth]);

  const updateViewportBounds = () => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    setViewportBounds({
      height: viewport.clientHeight,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
      width: viewport.clientWidth,
    });
  };

  useEffect(() => {
    if (!scrollable) {
      return;
    }

    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const handleResize = () => updateViewportBounds();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [scrollable]);

  const setMapZoomAroundViewportCenter = (nextZoom: number) => {
    const viewport = viewportRef.current;
    const safeNextZoom = MAP_ZOOM_LEVELS.includes(nextZoom as (typeof MAP_ZOOM_LEVELS)[number]) ? nextZoom : 1;

    if (!viewport) {
      setMapZoom(safeNextZoom);
      return;
    }

    const centerX = (viewport.scrollLeft + viewport.clientWidth / 2) / mapZoom;
    const centerY = (viewport.scrollTop + viewport.clientHeight / 2) / mapZoom;

    setMapZoom(safeNextZoom);
    window.requestAnimationFrame(() => {
      viewport.scrollLeft = centerX * safeNextZoom - viewport.clientWidth / 2;
      viewport.scrollTop = centerY * safeNextZoom - viewport.clientHeight / 2;
      updateViewportBounds();
    });
  };

  const currentZoomIndex = MAP_ZOOM_LEVELS.findIndex((level) => level === mapZoom);
  const canZoomOut = currentZoomIndex > 0;
  const canZoomIn = currentZoomIndex >= 0 && currentZoomIndex < MAP_ZOOM_LEVELS.length - 1;

  const handleZoomStep = (step: -1 | 1) => {
    const nextIndex = Math.min(Math.max(currentZoomIndex + step, 0), MAP_ZOOM_LEVELS.length - 1);
    const nextZoom = MAP_ZOOM_LEVELS[nextIndex] ?? 1;
    setMapZoomAroundViewportCenter(nextZoom);
  };

  const handleCenterMap = () => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    viewport.scrollTo({
      left: Math.max(0, (scaledStageWidth - viewport.clientWidth) / 2),
      top: Math.max(0, (scaledStageHeight - viewport.clientHeight) / 2 - 24),
      behavior: "smooth",
    });
    window.requestAnimationFrame(updateViewportBounds);
  };

  const handleViewportPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!scrollable || event.button !== 0 || (event.target instanceof Element && event.target.closest("button"))) {
      return;
    }

    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    panStateRef.current = {
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
      startX: event.clientX,
      startY: event.clientY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleViewportPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    const panState = panStateRef.current;
    if (!viewport || !panState) {
      return;
    }

    viewport.scrollLeft = panState.scrollLeft - (event.clientX - panState.startX);
    viewport.scrollTop = panState.scrollTop - (event.clientY - panState.startY);
    updateViewportBounds();
  };

  const handleViewportPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!panStateRef.current) {
      return;
    }

    panStateRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const safePlacementPreview =
    placementPreview && isFiniteNumber(placementPreview.col) && isFiniteNumber(placementPreview.row)
      ? placementPreview
      : null;

  const placementPreviewPolygon = safePlacementPreview
    ? (() => {
        const previewAsset = assetMap.get(safePlacementPreview.assetId);
        const footprint = getAssetFootprint(previewAsset);

        return getPlacementPreviewCells(
          safePlacementPreview.col,
          safePlacementPreview.row,
          footprint.width,
          footprint.height,
        ).map((cell) => {
          const center = gridToScreen(cell.col, cell.row, boardWidth, boardHeight);
          const top = `${center.x},${center.y - MY_SCAPE_TILE_HEIGHT / 2}`;
          const right = `${center.x + MY_SCAPE_TILE_WIDTH / 2},${center.y}`;
          const bottom = `${center.x},${center.y + MY_SCAPE_TILE_HEIGHT / 2}`;
          const left = `${center.x - MY_SCAPE_TILE_WIDTH / 2},${center.y}`;

          return `${top} ${right} ${bottom} ${left}`;
        });
      })()
    : null;
  const gridCells = useMemo(() => {
    const minX = scrollable
      ? Math.max(0, viewportBounds.scrollLeft / mapZoom - boardLeft - VIRTUAL_GRID_OVERSCAN_PX)
      : 0;
    const maxX = scrollable
      ? viewportBounds.scrollLeft / mapZoom + viewportBounds.width / mapZoom - boardLeft + VIRTUAL_GRID_OVERSCAN_PX
      : boardWidth;
    const minY = scrollable
      ? Math.max(0, viewportBounds.scrollTop / mapZoom - boardTop - VIRTUAL_GRID_OVERSCAN_PX)
      : 0;
    const maxY = scrollable
      ? viewportBounds.scrollTop / mapZoom + viewportBounds.height / mapZoom - boardTop + VIRTUAL_GRID_OVERSCAN_PX
      : boardHeight;

    const cells: Array<{ id: string; points: string }> = [];

    for (let row = 0; row < safeGridRows; row += 1) {
      for (let col = 0; col < safeGridColumns; col += 1) {
        const center = gridToScreen(col, row, boardWidth, boardHeight);
        if (
          center.x + MY_SCAPE_TILE_WIDTH / 2 < minX ||
          center.x - MY_SCAPE_TILE_WIDTH / 2 > maxX ||
          center.y + MY_SCAPE_TILE_HEIGHT / 2 < minY ||
          center.y - MY_SCAPE_TILE_HEIGHT / 2 > maxY
        ) {
          continue;
        }

        const top = `${center.x},${center.y - MY_SCAPE_TILE_HEIGHT / 2}`;
        const right = `${center.x + MY_SCAPE_TILE_WIDTH / 2},${center.y}`;
        const bottom = `${center.x},${center.y + MY_SCAPE_TILE_HEIGHT / 2}`;
        const left = `${center.x - MY_SCAPE_TILE_WIDTH / 2},${center.y}`;
        cells.push({ id: `${col}-${row}`, points: `${top} ${right} ${bottom} ${left}` });
      }
    }

    return cells;
  }, [
    boardHeight,
    boardLeft,
    boardTop,
    boardWidth,
    mapZoom,
    safeGridColumns,
    safeGridRows,
    scrollable,
    viewportBounds.height,
    viewportBounds.scrollLeft,
    viewportBounds.scrollTop,
    viewportBounds.width,
  ]);

  return (
    <div className="relative h-full min-h-[420px] overflow-hidden bg-transparent">
      <div className="absolute inset-0 bg-[radial-gradient(88%_58%_at_50%_18%,rgba(255,255,255,0.34)_0%,rgba(255,255,255,0.08)_42%,rgba(255,255,255,0)_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(247,244,237,0.14)_0%,rgba(239,243,234,0.05)_54%,rgba(235,239,230,0)_100%)]" />

      <div
        ref={viewportRef}
        className={
          scrollable
            ? "absolute inset-0 cursor-grab overflow-auto overscroll-contain active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : `absolute left-1/2 -translate-x-1/2 -translate-y-1/2 ${
                expanded ? "top-[48%] h-[356px] w-[424px]" : "top-[45%] h-[327px] w-[386px]"
              }`
        }
        style={
          scrollable
            ? undefined
            : {
                transform: `translate(-50%, -50%) scale(${boardScale})`,
                transformOrigin: "center center",
              }
        }
        onPointerDown={handleViewportPointerDown}
        onPointerMove={handleViewportPointerMove}
        onPointerUp={handleViewportPointerUp}
        onPointerCancel={handleViewportPointerUp}
        onScroll={scrollable ? updateViewportBounds : undefined}
      >
        <div
          className={scrollable ? "relative" : "relative h-full w-full"}
          style={scrollable ? { height: scaledStageHeight, width: scaledStageWidth } : undefined}
        >
        <div
          className={scrollable ? "absolute left-0 top-0" : "relative h-full w-full"}
          style={
            scrollable
              ? {
                  height: stageHeight,
                  transform: `scale(${mapZoom})`,
                  transformOrigin: "left top",
                  width: stageWidth,
                }
              : undefined
          }
        >
        <svg viewBox={`0 0 ${stageWidth} ${stageHeight}`} className="pointer-events-none h-full w-full overflow-visible">
            <defs>
              <linearGradient id="myscape-top" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#eef5ec" />
                <stop offset="52%" stopColor="#d9e6d7" />
                <stop offset="100%" stopColor="#bdd1c0" />
              </linearGradient>
              <linearGradient id="myscape-left" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8fa594" />
                <stop offset="100%" stopColor="#728677" />
              </linearGradient>
              <linearGradient id="myscape-right" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7e9384" />
                <stop offset="100%" stopColor="#617568" />
              </linearGradient>
              <linearGradient id="myscape-soil-left" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#98866d" />
                <stop offset="100%" stopColor="#7c6b55" />
              </linearGradient>
              <linearGradient id="myscape-soil-right" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#877662" />
                <stop offset="100%" stopColor="#6e5e4d" />
              </linearGradient>
              <pattern id="myscape-soil-dots" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="6" fill="rgba(134,115,91,0.24)" />
                <circle cx="23" cy="22" r="5" fill="rgba(171,152,126,0.14)" />
              </pattern>
              <pattern id="myscape-grass-speckles" width="34" height="34" patternUnits="userSpaceOnUse">
                <circle cx="9" cy="9" r="3.2" fill="rgba(255,255,255,0.14)" />
                <circle cx="24" cy="18" r="2.6" fill="rgba(171,194,177,0.18)" />
                <circle cx="16" cy="28" r="2.2" fill="rgba(123,151,131,0.08)" />
              </pattern>
            </defs>

            <polygon points={`${topPoint} ${rightPoint} ${bottomPoint} ${leftPoint}`} fill="url(#myscape-top)" />
            <polygon points={`${leftPoint} ${bottomPoint} ${leftBottomPoint} ${leftFrontPoint}`} fill="url(#myscape-left)" />
            <polygon points={`${rightPoint} ${bottomPoint} ${leftBottomPoint} ${rightBottomPoint}`} fill="url(#myscape-right)" />

            <polygon points={`${innerTopPoint} ${innerRightPoint} ${innerBottomPoint} ${innerLeftPoint}`} fill="url(#myscape-grass-speckles)" opacity="0.9" />
            <polygon points={`${leftPoint} ${bottomPoint} ${leftBottomPoint} ${leftFrontPoint}`} fill="url(#myscape-soil-left)" opacity="0.9" />
            <polygon points={`${rightPoint} ${bottomPoint} ${leftBottomPoint} ${rightBottomPoint}`} fill="url(#myscape-soil-right)" opacity="0.94" />
            <polygon points={`${leftPoint} ${bottomPoint} ${leftBottomPoint} ${leftFrontPoint}`} fill="url(#myscape-soil-dots)" opacity="0.82" />
            <polygon points={`${rightPoint} ${bottomPoint} ${leftBottomPoint} ${rightBottomPoint}`} fill="url(#myscape-soil-dots)" opacity="0.72" />

            <polygon points={`${topPoint} ${rightPoint} ${bottomPoint} ${leftPoint}`} fill="rgba(255,255,255,0.06)" />
            <path d={`M ${topPoint} L ${rightPoint}`} stroke="rgba(255,255,255,0.24)" strokeWidth="2" />
            <path d={`M ${topPoint} L ${leftPoint}`} stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
            <path d={`M ${leftPoint} L ${bottomPoint} L ${rightPoint}`} fill="none" stroke="rgba(96,121,109,0.24)" strokeWidth="1.5" />
            <path d={`M ${leftPoint} L ${leftFrontPoint} L ${leftBottomPoint} L ${rightBottomPoint} L ${rightPoint}`} fill="none" stroke="rgba(70,88,52,0.14)" strokeWidth="1.5" />
        </svg>
        <div
          ref={boardRef}
          className="absolute"
          style={{
            height: boardHeight,
            left: boardLeft,
            top: boardTop,
            width: boardWidth,
          }}
        >
          {isEditMode ? (
            <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
              {gridCells.map((cell) => (
                <polygon
                  key={cell.id}
                  points={cell.points}
                  className="myscape-grid-cell"
                  fill="rgba(255,255,255,0.02)"
                  stroke="rgba(98,122,108,0.18)"
                  strokeWidth="1"
                />
              ))}
            </svg>
          ) : null}
          {isEditMode ? (
            <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
              {safePlacementPreview && placementPreviewPolygon ? (
                <g>
                  {placementPreviewPolygon.map((points, index) => (
                    <g key={`${safePlacementPreview.assetId}-${safePlacementPreview.col}-${safePlacementPreview.row}-${index}`}>
                      <polygon
                        points={points}
                        fill={safePlacementPreview.valid ? "rgba(76, 175, 80, 0.28)" : "rgba(231, 76, 60, 0.28)"}
                        stroke={safePlacementPreview.valid ? "rgba(102, 187, 106, 0.92)" : "rgba(239, 83, 80, 0.94)"}
                        strokeWidth="2"
                      />
                      <polygon
                        points={points}
                        fill="none"
                        stroke={safePlacementPreview.valid ? "rgba(255,255,255,0.42)" : "rgba(255,255,255,0.28)"}
                        strokeWidth="0.8"
                      />
                    </g>
                  ))}
                </g>
              ) : null}
            </svg>
          ) : null}
          {placedLandmarks.map((item) => {
            const asset = assetMap.get(item.landmarkId);
            if (!asset) {
              return null;
            }

            const safeCol = isFiniteNumber(item.col) ? item.col : 0;
            const safeRow = isFiniteNumber(item.row) ? item.row : 0;
            const safeScale = isFiniteNumber(item.scale) ? item.scale : 1;
            const safeZIndex = isFiniteNumber(item.zIndex) ? item.zIndex : getItemZIndex(safeCol, safeRow);
            const footprint = getAssetFootprint(asset);
            const snappedPosition = getPlacementAnchorPoint(
              safeCol,
              safeRow,
              footprint.width,
              footprint.height,
              boardWidth,
              boardHeight,
            );
            const isDragging = draggingId === item.id;
            const renderedPosition =
              isDragging && dragPreview && isFiniteNumber(dragPreview.x) && isFiniteNumber(dragPreview.y)
                ? dragPreview
                : snappedPosition;
            const safeItem = {
              ...item,
              col: safeCol,
              row: safeRow,
              scale: safeScale,
              zIndex: safeZIndex,
            };

            return (
              <PlacedLandmark
                key={item.id}
                asset={asset}
                item={safeItem}
                animateIn={entryReady}
                editable={isEditMode}
                index={placedLandmarks.findIndex((entry) => entry.id === item.id)}
                screenX={renderedPosition.x}
                screenY={renderedPosition.y}
                isEditMode={isEditMode}
                selected={selectedId === item.id}
                dragging={isDragging}
                onPointerDown={onItemPointerDown}
                onSelect={onSelectItem}
              />
            );
          })}
        </div>
        </div>
        </div>
      </div>

      {scrollable ? (
        <div className="absolute right-4 top-1/2 z-30 flex -translate-y-1/2 flex-col overflow-hidden rounded-[22px] border border-white/70 bg-white/62 p-1.5 shadow-[0_18px_34px_rgba(45,62,53,0.16)] backdrop-blur-2xl">
          <button
            type="button"
            onClick={() => handleZoomStep(1)}
            disabled={!canZoomIn}
            title="Zoom in"
            aria-label="Zoom in"
            className="flex h-10 w-10 items-center justify-center rounded-[16px] text-[#314238] transition hover:bg-white/72 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Plus className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            onClick={() => handleZoomStep(-1)}
            disabled={!canZoomOut}
            title="Zoom out"
            aria-label="Zoom out"
            className="flex h-10 w-10 items-center justify-center rounded-[16px] text-[#314238] transition hover:bg-white/72 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Minus className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            onClick={handleCenterMap}
            title="Center map"
            aria-label="Center map"
            className="flex h-10 w-10 items-center justify-center rounded-[16px] text-[#314238] transition hover:bg-white/72"
          >
            <LocateFixed className="h-4.5 w-4.5" />
          </button>
        </div>
      ) : null}

    </div>
  );
};
