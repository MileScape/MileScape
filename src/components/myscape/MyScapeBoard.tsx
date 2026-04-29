import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import type { MyScapePlacedLandmark } from "../../types";
import {
  gridToScreen,
  MY_SCAPE_GRID_COLUMNS,
  MY_SCAPE_GRID_ROWS,
  MY_SCAPE_TILE_HEIGHT,
  MY_SCAPE_TILE_WIDTH,
  type UnlockedLandmarkAsset,
} from "../../utils/myScape";
import { PlacedLandmark } from "./PlacedLandmark";

interface MyScapeBoardProps {
  boardRef: RefObject<HTMLDivElement>;
  assets: UnlockedLandmarkAsset[];
  placedLandmarks: MyScapePlacedLandmark[];
  selectedId: string | null;
  draggingId: string | null;
  dragPreview: { x: number; y: number } | null;
  placementPreview: { col: number; row: number; valid: boolean; active: boolean } | null;
  isEditMode: boolean;
  zoom: number;
  expanded?: boolean;
  onItemPointerDown: (event: ReactPointerEvent<HTMLButtonElement>, itemId: string) => void;
  onSelectItem: (itemId: string) => void;
}

export const MyScapeBoard = ({
  boardRef,
  assets,
  placedLandmarks,
  selectedId,
  draggingId,
  dragPreview,
  placementPreview,
  isEditMode,
  zoom,
  expanded = false,
  onItemPointerDown,
  onSelectItem,
}: MyScapeBoardProps) => {
  const assetMap = new Map(assets.map((asset) => [asset.id, asset]));
  const stageWidth = expanded ? 424 : 386;
  const stageHeight = expanded ? 356 : 327;
  const boardWidth = expanded ? 352 : 320;
  const boardHeight = expanded ? 222 : 196;
  const boardLeft = expanded ? 36 : 33;
  const boardTop = 24;
  const boardOriginX = boardLeft + boardWidth / 2;
  const boardOriginY = boardTop + boardHeight * 0.12 + 12;
  const gridHalfWidth = (MY_SCAPE_GRID_COLUMNS * MY_SCAPE_TILE_WIDTH) / 2;
  const gridHalfDepth = (MY_SCAPE_GRID_ROWS * MY_SCAPE_TILE_WIDTH) / 2;
  const platformThickness = expanded ? 52 : 44;
  const soilInset = expanded ? 12 : 10;
  const topPoint = `${boardOriginX},${boardOriginY - MY_SCAPE_TILE_HEIGHT / 2}`;
  const rightPoint = `${boardOriginX + gridHalfWidth},${boardOriginY + (MY_SCAPE_GRID_COLUMNS * MY_SCAPE_TILE_HEIGHT) / 2 - MY_SCAPE_TILE_HEIGHT / 2}`;
  const bottomPoint = `${boardOriginX},${boardOriginY + ((MY_SCAPE_GRID_COLUMNS + MY_SCAPE_GRID_ROWS) * MY_SCAPE_TILE_HEIGHT) / 2 - MY_SCAPE_TILE_HEIGHT / 2}`;
  const leftPoint = `${boardOriginX - gridHalfDepth},${boardOriginY + (MY_SCAPE_GRID_ROWS * MY_SCAPE_TILE_HEIGHT) / 2 - MY_SCAPE_TILE_HEIGHT / 2}`;
  const leftBottomPoint = `${boardOriginX},${boardOriginY + ((MY_SCAPE_GRID_COLUMNS + MY_SCAPE_GRID_ROWS) * MY_SCAPE_TILE_HEIGHT) / 2 - MY_SCAPE_TILE_HEIGHT / 2 + platformThickness}`;
  const rightBottomPoint = `${boardOriginX + gridHalfWidth},${boardOriginY + (MY_SCAPE_GRID_COLUMNS * MY_SCAPE_TILE_HEIGHT) / 2 - MY_SCAPE_TILE_HEIGHT / 2 + platformThickness}`;
  const leftFrontPoint = `${boardOriginX - gridHalfDepth},${boardOriginY + (MY_SCAPE_GRID_ROWS * MY_SCAPE_TILE_HEIGHT) / 2 - MY_SCAPE_TILE_HEIGHT / 2 + platformThickness}`;
  const innerTopPoint = `${boardOriginX},${boardOriginY - MY_SCAPE_TILE_HEIGHT / 2 + soilInset}`;
  const innerRightPoint = `${boardOriginX + gridHalfWidth - soilInset * 1.15},${boardOriginY + (MY_SCAPE_GRID_COLUMNS * MY_SCAPE_TILE_HEIGHT) / 2 - MY_SCAPE_TILE_HEIGHT / 2 + soilInset * 0.58}`;
  const innerBottomPoint = `${boardOriginX},${boardOriginY + ((MY_SCAPE_GRID_COLUMNS + MY_SCAPE_GRID_ROWS) * MY_SCAPE_TILE_HEIGHT) / 2 - MY_SCAPE_TILE_HEIGHT / 2 - soilInset}`;
  const innerLeftPoint = `${boardOriginX - gridHalfDepth + soilInset * 1.15},${boardOriginY + (MY_SCAPE_GRID_ROWS * MY_SCAPE_TILE_HEIGHT) / 2 - MY_SCAPE_TILE_HEIGHT / 2 + soilInset * 0.58}`;
  const gridLines = [];

    for (let col = 0; col < MY_SCAPE_GRID_COLUMNS; col += 1) {
    const start = gridToScreen(col, 0, boardWidth, boardHeight);
    const end = gridToScreen(col, MY_SCAPE_GRID_ROWS - 1, boardWidth, boardHeight);
    gridLines.push(
      <line
        key={`col-${col}`}
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke="rgba(255,255,255,0.36)"
        strokeWidth="1"
      />,
    );
  }

  for (let row = 0; row < MY_SCAPE_GRID_ROWS; row += 1) {
    const start = gridToScreen(0, row, boardWidth, boardHeight);
    const end = gridToScreen(MY_SCAPE_GRID_COLUMNS - 1, row, boardWidth, boardHeight);
    gridLines.push(
      <line
        key={`row-${row}`}
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke="rgba(188,203,193,0.5)"
        strokeWidth="1"
      />,
    );
  }

  const placementPreviewPolygon = placementPreview
    ? (() => {
        const center = gridToScreen(placementPreview.col, placementPreview.row, boardWidth, boardHeight);
        const top = `${center.x},${center.y - MY_SCAPE_TILE_HEIGHT / 2}`;
        const right = `${center.x + MY_SCAPE_TILE_WIDTH / 2},${center.y}`;
        const bottom = `${center.x},${center.y + MY_SCAPE_TILE_HEIGHT / 2}`;
        const left = `${center.x - MY_SCAPE_TILE_WIDTH / 2},${center.y}`;

        return `${top} ${right} ${bottom} ${left}`;
      })()
    : null;

  return (
    <div className="relative h-full min-h-[420px] overflow-hidden bg-[linear-gradient(180deg,#f6f4ee_0%,#eef2eb_36%,#edf1ea_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),rgba(255,255,255,0)_46%)]" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,rgba(238,242,235,0)_0%,rgba(238,242,235,0.88)_100%)]" />
      <div className="absolute inset-x-4 top-6 h-24 rounded-full bg-[radial-gradient(circle,rgba(190,213,195,0.3),rgba(190,213,195,0)_72%)] blur-2xl" />
      <div
        className={`absolute left-1/2 rounded-full bg-[radial-gradient(circle,rgba(57,77,63,0.14),rgba(57,77,63,0)_72%)] blur-md ${
          expanded ? "bottom-10 h-20 w-[364px] -translate-x-1/2" : "bottom-14 h-16 w-[306px] -translate-x-1/2"
        }`}
      />

      <div
        className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 ${
          expanded ? "top-[48%] h-[356px] w-[424px]" : "top-[49%] h-[327px] w-[386px]"
        }`}
        style={{
          transform: `translate(-50%, -50%) scale(${zoom})`,
          transformOrigin: "center center",
        }}
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
           className={expanded ? "absolute left-[36px] top-[24px] h-[222px] w-[352px]" : "absolute left-[33px] top-[24px] h-[196px] w-[320px]"}
        >
          {isEditMode ? (
            <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
              <defs>
                <filter id="myscape-grid-glow">
                  <feGaussianBlur stdDeviation="1.4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {placementPreview && placementPreviewPolygon ? (
                <g>
                  <polygon
                    points={placementPreviewPolygon}
                    fill={placementPreview.valid ? "rgba(76, 175, 80, 0.28)" : "rgba(231, 76, 60, 0.28)"}
                    stroke={placementPreview.valid ? "rgba(102, 187, 106, 0.92)" : "rgba(239, 83, 80, 0.94)"}
                    strokeWidth="2"
                  />
                  <polygon
                    points={placementPreviewPolygon}
                    fill="none"
                    stroke={placementPreview.valid ? "rgba(255,255,255,0.42)" : "rgba(255,255,255,0.28)"}
                    strokeWidth="0.8"
                  />
                </g>
              ) : null}
              <g filter="url(#myscape-grid-glow)">
                {gridLines}
              </g>
            </svg>
          ) : null}
          {placedLandmarks.map((item) => {
            const asset = assetMap.get(item.landmarkId);
            if (!asset) {
              return null;
            }

            const snappedPosition = gridToScreen(item.col, item.row, boardWidth, boardHeight);
            const isDragging = draggingId === item.id;
            const renderedPosition = isDragging && dragPreview ? dragPreview : snappedPosition;

            return (
              <PlacedLandmark
                key={item.id}
                asset={asset}
                item={item}
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

      {placedLandmarks.length === 0 ? (
        <div className="pointer-events-none absolute left-1/2 top-[43%] z-10 flex w-[220px] -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-[28px] bg-white/60 px-5 py-4 text-center shadow-[0_18px_36px_rgba(35,52,40,0.08)] ring-1 ring-white/80 backdrop-blur">

          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-sage-500">Under Construction</p>

        </div>
      ) : null}
    </div>
  );
};
