import { type CSSProperties, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/milescape.png";
import runnerMan from "../assets/runner_man.png";
import runnerWoman from "../assets/runner_woman.png";
import { MyScapeBoard } from "../components/myscape/MyScapeBoard";
import { routes } from "../data/routes";
import type { MyScapePlacedLandmark, RouteProgress } from "../types";
import { cn } from "../utils/cn";
import {
  clampGridPositionForFootprint,
  getAssetFootprint,
  getItemZIndex,
  getPlacementAnchorPoint,
  isGridCellOccupied,
  resolveMyScapeCatalogAssets,
  screenToGrid,
  type UnlockedLandmarkAsset,
} from "../utils/myScape";
import { formatDistance } from "../utils/progress";

const welcomePages = [
  {
    id: "cover",
  },
  {
    id: "routes",
  },
  {
    id: "collect",
  },
  {
    id: "crew",
  },
] as const;

const journeyRunners = [
  {
    id: "woman",
    name: "Woman",
    image: runnerWoman,
  },
  {
    id: "man",
    name: "Man",
    image: runnerMan,
  },
] as const;

const welcomePostcards = ["bangkok-floating-route", "seoul-heritage-route"]
  .map((routeId) => routes.find((route) => route.id === routeId))
  .filter((route): route is NonNullable<typeof route> => Boolean(route));

const postcardLayout = [
  "left-[0.2rem] top-[3.7rem] z-10 w-[min(69vw,310px)] sm:left-[8%] sm:top-[12%]",
  "right-[0.2rem] top-[13.2rem] z-20 w-[min(69vw,310px)] sm:right-[8%] sm:top-[34%]",
];
const postcardRotations = ["-5.5deg", "3.8deg"];

const welcomeScapeRouteIds = [
  "central-park-loop",
  "tokyo-city-route",
  "barcelona-coast-route",
  "london-landmark-route",
  "paris-eiffel-route",
  "cairo-pyramid-route",
  "seoul-heritage-route",
  "rome-heritage-route",
  "taipei-skyline-route",
];
const welcomeScapeLandmarkIds = [
  "shibuya",
  "senso-ji",
  "tokyo-tower",
  "sagrada-familia",
  "statue-of-liberty",
  "chrysler-building",
  "one-world-trade-center",
  "big-ben",
  "tower-bridge",
  "eiffel-tower",
  "arc-de-triomphe",
  "cairo-citadel",

  "colosseum",
  "taipei-101",
];
const welcomeScapePositions: Record<string, { col: number; row: number }> = {
  shibuya: { col: 0, row: 0 },
  "senso-ji": { col: 3, row: 0 },
  "statue-of-liberty": { col: 6, row: 0 },
  "sagrada-familia": { col: 1, row: 1 },
  "cairo-citadel": { col: 4, row: 1 },
  "one-world-trade-center": { col: 8, row: 2 },
  "tokyo-tower": { col: 3, row: 3 },
  "tower-bridge": { col: 5, row: 3 },

  "big-ben": { col: 0, row: 4 },
  "eiffel-tower": { col: 2, row: 5 },
  "chrysler-building": { col: 6, row: 5 },
  colosseum: { col: 0, row: 6 },
  "arc-de-triomphe": { col: 4, row: 6 },

  "taipei-101": { col: 1, row: 3 },
};

const getBoardLocalPoint = (board: HTMLDivElement, clientX: number, clientY: number) => {
  const boardRect = board.getBoundingClientRect();
  const scaleX = boardRect.width > 0 ? board.clientWidth / boardRect.width : 1;
  const scaleY = boardRect.height > 0 ? board.clientHeight / boardRect.height : 1;

  return {
    x: (clientX - boardRect.left) * scaleX,
    y: (clientY - boardRect.top) * scaleY,
  };
};

const buildWelcomeScapeLayout = (assets: UnlockedLandmarkAsset[]): MyScapePlacedLandmark[] =>
  assets.map((asset, index) => {
    const footprint = getAssetFootprint(asset);
    const preferred = welcomeScapePositions[asset.id] ?? { col: index + 1, row: index + 1 };
    const position = clampGridPositionForFootprint(preferred.col, preferred.row, footprint.width, footprint.height);

    return {
      id: `welcome-${asset.id}`,
      landmarkId: asset.id,
      col: position.col,
      row: position.row,
      scale: (asset.defaultScale ?? 1) * 0.72,
      zIndex: getItemZIndex(position.col, position.row),
    };
  });

export const HomePage = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState(0);
  const [flippedRouteIds, setFlippedRouteIds] = useState<string[]>([]);
  const [selectedRunnerId, setSelectedRunnerId] = useState<(typeof journeyRunners)[number]["id"]>("woman");
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [welcomeScapeItems, setWelcomeScapeItems] = useState<MyScapePlacedLandmark[]>([]);
  const [welcomeScapeArrangeReady, setWelcomeScapeArrangeReady] = useState(false);
  const [welcomeScapeDraggingId, setWelcomeScapeDraggingId] = useState<string | null>(null);
  const [welcomeScapeDragPreview, setWelcomeScapeDragPreview] = useState<{ x: number; y: number } | null>(null);
  const [welcomeScapeSelectedId, setWelcomeScapeSelectedId] = useState<string | null>(null);
  const welcomeScapeBoardRef = useRef<HTMLDivElement>(null);
  const welcomeScapeDropSeenRef = useRef(false);
  const previousActivePageRef = useRef(activePage);
  const welcomeScapeDragRef = useRef<{
    itemId: string;
    moved: boolean;
    pointerOffsetX: number;
    pointerOffsetY: number;
    previousCol: number;
    previousRow: number;
    startClientX: number;
    startClientY: number;
  } | null>(null);
  const isLastPage = activePage === welcomePages.length - 1;

  const welcomeScapeAssets = useMemo(() => {
    const progress: RouteProgress[] = routes
      .filter((route) => welcomeScapeRouteIds.includes(route.id))
      .map((route) => ({
        routeId: route.id,
        completedDistanceKm: route.totalDistanceKm,
        unlockedLandmarkIds: route.landmarks.map((landmark) => landmark.id),
        decorations: {},
        runCount: 1,
        achievementTier: "none",
        completed: true,
      }));

    return resolveMyScapeCatalogAssets(routes, progress)
      .filter((asset) => asset.assetType === "landmark" && welcomeScapeLandmarkIds.includes(asset.id))
      .sort((left, right) => welcomeScapeLandmarkIds.indexOf(left.id) - welcomeScapeLandmarkIds.indexOf(right.id));
  }, []);

  const welcomeScapeAssetMap = useMemo(
    () => new Map(welcomeScapeAssets.map((asset) => [asset.id, asset])),
    [welcomeScapeAssets],
  );

  const buildWelcomePlacementAssetLookup = (assetId: string) => {
    const lookup = new Map(welcomeScapeAssetMap);
    const asset = welcomeScapeAssetMap.get(assetId);
    if (asset) {
      lookup.set("__placement-preview__", asset);
    }
    return lookup;
  };

  const startJourney = () => {
    navigate("/run/setup", { state: { runnerId: selectedRunnerId } });
  };

  const goNext = () => {
    if (isLastPage) {
      startJourney();
      return;
    }

    setActivePage((current) => Math.min(current + 1, welcomePages.length - 1));
  };

  const goPrevious = () => {
    setActivePage((current) => Math.max(current - 1, 0));
  };

  const handleTouchEnd = (clientX: number) => {
    if (touchStartX === null) {
      return;
    }

    const deltaX = clientX - touchStartX;
    setTouchStartX(null);

    if (Math.abs(deltaX) < 42) {
      return;
    }

    if (deltaX < 0) {
      goNext();
      return;
    }

    goPrevious();
  };

  const toggleFlipped = (routeId: string) => {
    setFlippedRouteIds((current) =>
      current.includes(routeId) ? current.filter((entry) => entry !== routeId) : [...current, routeId],
    );
  };

  useEffect(() => {
    const previousPage = previousActivePageRef.current;
    previousActivePageRef.current = activePage;

    if (activePage !== 2 || welcomeScapeDropSeenRef.current) {
      return;
    }

    welcomeScapeDropSeenRef.current = true;
    setWelcomeScapeArrangeReady(false);
    setWelcomeScapeSelectedId(null);

    const dropTimer = window.setTimeout(() => {
      setWelcomeScapeItems(buildWelcomeScapeLayout(welcomeScapeAssets));
    }, previousPage === 1 ? 180 : 80);

    return () => {
      window.clearTimeout(dropTimer);
    };
  }, [activePage, welcomeScapeAssets]);

  const handleWelcomeScapePointerDown = (event: ReactPointerEvent<HTMLButtonElement>, itemId: string) => {
    if (!welcomeScapeArrangeReady) {
      return;
    }

    const board = welcomeScapeBoardRef.current;
    const item = welcomeScapeItems.find((entry) => entry.id === itemId);
    if (!board || !item) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);

    const asset = welcomeScapeAssetMap.get(item.landmarkId);
    const footprint = getAssetFootprint(asset);
    const anchorPoint = getPlacementAnchorPoint(
      item.col,
      item.row,
      footprint.width,
      footprint.height,
      board.clientWidth,
      board.clientHeight,
    );
    const localPointer = getBoardLocalPoint(board, event.clientX, event.clientY);

    welcomeScapeDragRef.current = {
      itemId,
      moved: false,
      pointerOffsetX: localPointer.x - anchorPoint.x,
      pointerOffsetY: localPointer.y - anchorPoint.y,
      previousCol: item.col,
      previousRow: item.row,
      startClientX: event.clientX,
      startClientY: event.clientY,
    };
    setWelcomeScapeSelectedId(itemId);
    setWelcomeScapeDraggingId(itemId);
    setWelcomeScapeDragPreview(anchorPoint);
  };

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const board = welcomeScapeBoardRef.current;
      const dragState = welcomeScapeDragRef.current;
      if (!board || !dragState) {
        return;
      }

      const deltaX = event.clientX - dragState.startClientX;
      const deltaY = event.clientY - dragState.startClientY;
      if (!dragState.moved && Math.hypot(deltaX, deltaY) > 5) {
        dragState.moved = true;
      }

      const localPointer = getBoardLocalPoint(board, event.clientX, event.clientY);
      setWelcomeScapeDragPreview({
        x: localPointer.x - dragState.pointerOffsetX,
        y: localPointer.y - dragState.pointerOffsetY,
      });
    };

    const handlePointerUp = () => {
      const board = welcomeScapeBoardRef.current;
      const dragState = welcomeScapeDragRef.current;
      if (!board || !dragState) {
        welcomeScapeDragRef.current = null;
        setWelcomeScapeDraggingId(null);
        setWelcomeScapeDragPreview(null);
        return;
      }

      const draggingItem = welcomeScapeItems.find((item) => item.id === dragState.itemId) ?? null;
      const draggingAsset = draggingItem ? welcomeScapeAssetMap.get(draggingItem.landmarkId) : null;
      const draggingFootprint = getAssetFootprint(draggingAsset);
      const previousAnchor = getPlacementAnchorPoint(
        dragState.previousCol,
        dragState.previousRow,
        draggingFootprint.width,
        draggingFootprint.height,
        board.clientWidth,
        board.clientHeight,
      );
      const finalPreview = welcomeScapeDragPreview ?? previousAnchor;
      const snapped = screenToGrid(finalPreview.x, finalPreview.y, board.clientWidth, board.clientHeight);
      const snappedGrid = clampGridPositionForFootprint(
        snapped.col,
        snapped.row,
        draggingFootprint.width,
        draggingFootprint.height,
      );

      setWelcomeScapeItems((current) =>
        current.map((item) => {
          if (item.id !== dragState.itemId) {
            return item;
          }

          const hasConflict = isGridCellOccupied(
            snappedGrid.col,
            snappedGrid.row,
            current,
            buildWelcomePlacementAssetLookup(item.landmarkId),
            item.id,
          );

          const nextCol = hasConflict ? dragState.previousCol : snappedGrid.col;
          const nextRow = hasConflict ? dragState.previousRow : snappedGrid.row;

          return {
            ...item,
            col: nextCol,
            row: nextRow,
            zIndex: getItemZIndex(nextCol, nextRow),
          };
        }),
      );

      welcomeScapeDragRef.current = null;
      setWelcomeScapeDraggingId(null);
      setWelcomeScapeDragPreview(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [welcomeScapeAssetMap, welcomeScapeDragPreview, welcomeScapeItems]);

  const welcomeScapePlacementPreview = useMemo(() => {
    if (!welcomeScapeArrangeReady || !welcomeScapeDraggingId || !welcomeScapeDragPreview || !welcomeScapeBoardRef.current) {
      return null;
    }

    const draggedItem = welcomeScapeItems.find((item) => item.id === welcomeScapeDraggingId) ?? null;
    const draggedAsset = draggedItem ? welcomeScapeAssetMap.get(draggedItem.landmarkId) : null;
    const footprint = getAssetFootprint(draggedAsset);
    const snapped = screenToGrid(
      welcomeScapeDragPreview.x,
      welcomeScapeDragPreview.y,
      welcomeScapeBoardRef.current.clientWidth,
      welcomeScapeBoardRef.current.clientHeight,
    );
    const clampedGrid = clampGridPositionForFootprint(snapped.col, snapped.row, footprint.width, footprint.height);
    const valid = !isGridCellOccupied(
      clampedGrid.col,
      clampedGrid.row,
      welcomeScapeItems,
      draggedItem ? buildWelcomePlacementAssetLookup(draggedItem.landmarkId) : welcomeScapeAssetMap,
      welcomeScapeDraggingId,
    );

    return {
      assetId: draggedItem?.landmarkId ?? "",
      col: clampedGrid.col,
      row: clampedGrid.row,
      valid,
      active: true,
    };
  }, [welcomeScapeArrangeReady, welcomeScapeAssetMap, welcomeScapeDragPreview, welcomeScapeDraggingId, welcomeScapeItems]);

  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden bg-[#f7f4ed] text-ink",
        isLastPage && "h-screen max-h-screen overscroll-none",
      )}
    >
      <div className="pointer-events-none absolute left-8 top-0 h-full w-px bg-[#d7b48a]/38" />
      <div className="pointer-events-none absolute left-11 top-0 h-full w-px bg-white/72" />

      <div className="relative z-10 flex min-h-screen flex-col px-7 pb-9 pt-12">
        <div className="flex items-center justify-end font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7a6b58]">
          {activePage > 0 ? (
            <button
              type="button"
              onClick={startJourney}
              className="px-1 py-1.5 transition hover:text-[#4f4437] focus:outline-none focus-visible:text-[#4f4437]"
            >
              Skip
            </button>
          ) : (
            <div className="h-[30px]" />
          )}
        </div>

        <div
          className="relative mt-6 flex flex-1 overflow-hidden"
          onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
          onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
        >
          <div
            className="flex w-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(-${activePage * 100}%)` }}
          >
            {welcomePages.map((page, index) => {
              return (
                <section
                  key={page.id}
                  className="flex min-w-full flex-col items-center justify-center text-center"
                  aria-hidden={activePage !== index}
                >
                  {page.id === "cover" ? (
                    <div className="relative h-full w-full">
                      <div className="welcome-cover-logo absolute left-1/2 flex h-64 w-80 items-center justify-center">
                        <img
                          src={logo}
                          alt="MileScape"
                          className="relative h-auto w-80 object-contain"
                        />
                      </div>
                      <p className="welcome-slogan absolute left-1/2 top-[61.8%] max-w-[31ch] text-center font-mono text-[12px] font-medium leading-7 text-[#6b6256]">
                        <span>run locally, explore globally</span>
                      </p>
                    </div>
                  ) : page.id === "routes" ? (
                    <div className="relative h-full w-full overflow-visible">
                      {welcomePostcards.map((route, postcardIndex) => {
                        const isFlipped = flippedRouteIds.includes(route.id);

                        return (
                          <article
                            key={route.id}
                            className={cn(
                              "welcome-postcard-mounted absolute",
                              postcardLayout[postcardIndex],
                              activePage === index && "is-mounted",
                            )}
                            style={
                              {
                                "--welcome-card-drop-rotate": postcardRotations[postcardIndex],
                                animationDelay: `${120 + postcardIndex * 135}ms`,
                              } as CSSProperties
                            }
                          >
                            <div className="pointer-events-none absolute left-1/2 top-[-14px] z-20 h-7 w-24 -translate-x-1/2 rotate-[-4deg] bg-[#e6d5ad]/70 mix-blend-multiply" />
                            <button
                              type="button"
                              onClick={() => toggleFlipped(route.id)}
                              className="relative block w-full text-left transition duration-500 [perspective:1400px] hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7d674d]/45"
                              aria-pressed={isFlipped}
                              aria-label={`Flip ${route.name} postcard`}
                            >
                              <div
                                className={cn(
                                  "relative transition duration-700 [transform-style:preserve-3d]",
                                  isFlipped && "[transform:rotateY(180deg)]",
                                )}
                              >
                                <div className="relative [backface-visibility:hidden]">
                                  <section className="relative overflow-hidden border border-white/70 bg-white">
                                    <div className="relative aspect-[4/5]">
                                      <img
                                        src={route.coverImage}
                                        alt=""
                                        className="absolute inset-0 h-full w-full object-cover"
                                        loading="eager"
                                        decoding="async"
                                        fetchPriority="high"
                                      />
                                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,24,39,0.02)_0%,rgba(17,24,39,0.18)_100%)]" />
                                      <div className="absolute inset-x-4 bottom-4 bg-black/20 px-4 py-3 text-left text-white backdrop-blur-sm">
                                        <p className="text-2xl font-semibold tracking-[-0.05em]">{route.name}</p>
                                      </div>
                                    </div>
                                  </section>
                                </div>

                                <div className="absolute inset-0 flex aspect-[4/5] flex-col justify-between overflow-hidden border border-[#816646]/30 bg-[#f7f1df] p-5 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                                  <div className="pointer-events-none absolute inset-[10px] border border-[#816646]/24" />
                                  <div className="relative">
                                    <h3 className="max-w-[14ch] font-mono text-[1.55rem] font-semibold uppercase leading-[0.98] text-[#263229]/90">
                                      {route.name}
                                    </h3>
                                  </div>

                                  <div className="relative space-y-4">
                                    <div className="border-y border-dashed border-[#816646]/34 py-3">
                                      <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#816646]/72">
                                        Total Route
                                      </p>
                                      <p className="mt-2 font-mono text-[1.9rem] font-semibold leading-none text-[#263229]/90">
                                        {formatDistance(route.totalDistanceKm)}
                                      </p>
                                    </div>
                                    <p className="font-mono text-[0.7rem] font-semibold uppercase leading-5 tracking-[0.15em] text-[#53685f]/74">
                                      Tap to return to the fieldbook cover
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </button>
                          </article>
                        );
                      })}
                      <p
                        className={cn(
                          "absolute bottom-[1.15rem] left-1/2 -translate-x-1/2 whitespace-nowrap text-center font-mono text-[12px] font-semibold tracking-[0.16em] text-[#6b6256] opacity-0 transition-opacity duration-500",
                          activePage === index && "opacity-100",
                        )}
                      >
                        Run. Collect. Remember.
                      </p>
                    </div>
                  ) : page.id === "collect" ? (
                    <div className="relative h-full w-full overflow-visible">
                      <p className="absolute left-1/2 top-[18%] w-[calc(100vw-6rem)] max-w-[520px] -translate-x-1/2 whitespace-nowrap text-center font-mono text-[12px] font-semibold uppercase leading-6 tracking-[0.12em] text-[#6b6256]">
                        EVERY RUN LEAVES A PLACE TAKES ROOT
                      </p>
                      <div className="absolute left-1/2 top-[62%] h-[440px] w-full max-w-[440px] -translate-x-1/2 -translate-y-1/2 overflow-visible">
                        <MyScapeBoard
                          boardRef={welcomeScapeBoardRef}
                          assets={welcomeScapeAssets}
                          placedLandmarks={welcomeScapeItems}
                          selectedId={null}
                          draggingId={null}
                          dragPreview={null}
                          placementPreview={null}
                          isEditMode={false}
                          newTodayIds={new Set()}
                          entryReady={activePage === index}
                          entryAnimation="drop"
                          boardScaleOverride={0.68}
                          showAmbientBackground={false}
                          overflowVisible
                          onItemPointerDown={() => undefined}
                          onSelectItem={() => undefined}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="relative flex h-full max-h-full w-full touch-none flex-col items-center overflow-hidden overscroll-none px-1 pb-2 pt-2">
                      <div
                        className={cn(
                          "relative z-10 mt-2 flex flex-col items-center opacity-0 transition duration-700",
                          activePage === index && "translate-y-0 opacity-100",
                          activePage !== index && "translate-y-4",
                        )}
                      >
                        <img
                          src={logo}
                          alt="MileScape"
                          className="h-auto w-[min(64vw,250px)] object-contain"
                        />
                      </div>

                      <div className="relative z-10 mt-2 flex w-full flex-1 flex-col">
                        <p className="absolute bottom-[calc(14vh+1rem)] left-[2%] z-30 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b6256]">
                          Choose your runner
                        </p>

                        <div className="-mt-1 flex min-h-0 w-full flex-1 items-end justify-center gap-[min(4vw,18px)]">
                        {journeyRunners.map((runner) => {
                          const selected = selectedRunnerId === runner.id;

                          return (
                            <button
                              key={runner.id}
                              type="button"
                              onClick={() => setSelectedRunnerId(runner.id)}
                              className={cn(
                                "group relative flex min-w-0 flex-1 basis-0 items-end justify-center bg-transparent pb-3 pt-4 transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-700/35",
                                selected ? "z-20 scale-[1.18]" : "z-10 scale-90 opacity-55 hover:scale-95 hover:opacity-80",
                              )}
                              aria-pressed={selected}
                              aria-label={`Choose ${runner.name} runner`}
                            >
                              <img
                                src={runner.image}
                                alt=""
                                className={cn(
                                  "relative h-auto max-h-[42vh] w-full max-w-[182px] object-contain object-bottom transition duration-300",
                                  selected ? "saturate-100" : "saturate-[0.72]",
                                )}
                                draggable={false}
                              />
                            </button>
                          );
                        })}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={startJourney}
                        className="relative z-20 mb-1 mt-4 flex h-14 w-full max-w-[360px] items-center justify-center rounded-full bg-sage-700/95 px-6 text-base font-semibold text-white transition hover:bg-sage-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-700/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f4ed]"
                      >
                        Start Journey
                      </button>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>

        {activePage === 0 ? (
          <p className="welcome-cover-footer mt-6 text-center font-mono text-[14px] font-semibold tracking-[0.12em] text-[#6f675c]">
            by CPT208 GROUP C12
          </p>
        ) : null}

        <div
          className={cn(
            "flex items-center justify-center gap-1.5",
            activePage === 0 && "welcome-cover-footer",
            activePage === 0 ? "mt-5" : "mt-6",
          )}
        >
          {welcomePages.map((page, index) => (
            <button
              key={page.id}
              type="button"
              onClick={() => setActivePage(index)}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition",
                activePage === index ? "bg-sage-700" : "bg-sage-300/70",
              )}
              aria-label={`Go to welcome page ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
