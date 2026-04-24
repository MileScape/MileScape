import { Compass, Grid2X2, Sparkles } from "lucide-react";
import { useEffect, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import type { MyScapePlacedLandmark } from "../../types";
import type { UnlockedLandmarkAsset } from "../../utils/myScape";
import { cn } from "../../utils/cn";
import { MyScapeScene } from "./MyScapeScene";

interface MyScapeBoardProps {
  boardRef: RefObject<HTMLDivElement>;
  assets: UnlockedLandmarkAsset[];
  placedLandmarks: MyScapePlacedLandmark[];
  selectedId: string | null;
  onItemPointerDown: (event: ReactPointerEvent<HTMLButtonElement>, itemId: string) => void;
  onSelectItem: (itemId: string) => void;
}

export const MyScapeBoard = ({
  boardRef,
  assets,
  placedLandmarks,
  selectedId,
  onItemPointerDown,
  onSelectItem,
}: MyScapeBoardProps) => {
  const [boardSize, setBoardSize] = useState({ width: 320, height: 430 });

  useEffect(() => {
    const board = boardRef.current;
    if (!board) {
      return undefined;
    }

    const updateSize = () => {
      setBoardSize({
        width: board.clientWidth,
        height: board.clientHeight,
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(board);

    return () => observer.disconnect();
  }, [boardRef]);

  return (
    <section className="rounded-[36px] bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(241,245,240,0.92))] p-3 shadow-[0_26px_60px_rgba(36,55,41,0.1)] ring-1 ring-white/85 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between px-1.5">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-sage-500">Personal World</p>
          <h2 className="mt-1 text-[1.2rem] font-semibold tracking-[-0.03em] text-ink">3D Miniature Board</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white/72 px-3 py-2 text-[11px] font-medium text-sage-600 ring-1 ring-sage-900/8">
          <Grid2X2 className="h-3.5 w-3.5" />
          Snap grid on
        </div>
      </div>

      <div
        ref={boardRef}
        className="relative h-[430px] overflow-hidden rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,#f7f6f1_0%,#edf2eb_100%)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.86),rgba(255,255,255,0)_42%)]" />
        <div className="absolute inset-0">
          <MyScapeScene
            assets={assets}
            placedLandmarks={placedLandmarks}
            selectedId={selectedId}
            boardWidth={boardSize.width}
            boardHeight={boardSize.height}
            onSelectItem={onSelectItem}
          />
        </div>

        <div className="pointer-events-none absolute left-6 top-6 flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-[11px] font-medium text-sage-600 ring-1 ring-white/80 backdrop-blur">
          <Compass className="h-3.5 w-3.5" />
          3D collectible world
        </div>
        <div className="pointer-events-none absolute bottom-6 right-6 flex items-center gap-2 rounded-full bg-white/74 px-3 py-2 text-[11px] font-medium text-sage-600 ring-1 ring-white/80 backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" />
          Orbit and arrange
        </div>

        {placedLandmarks.map((item) => (
          <button
            key={item.id}
            type="button"
            onPointerDown={(event) => onItemPointerDown(event, item.id)}
            onClick={() => onSelectItem(item.id)}
            className={cn(
              "absolute touch-none select-none rounded-full",
              selectedId === item.id ? "z-30" : "z-20",
            )}
            style={{
              left: item.x,
              top: item.y,
              width: 92 * item.scale,
              height: 112 * item.scale,
              opacity: 0,
              transform: "translate(-8px, -20px)",
            }}
            aria-label={`Select placed landmark ${item.landmarkId}`}
          />
        ))}

        {placedLandmarks.length === 0 ? (
          <div className="absolute inset-x-8 bottom-24 rounded-[28px] bg-white/68 px-5 py-4 text-center shadow-[0_16px_34px_rgba(36,55,42,0.08)] ring-1 ring-white/80 backdrop-blur">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-sage-500">First Placement</p>
            <p className="mt-2 text-sm leading-6 text-sage-600">
              Choose an unlocked landmark below and it will appear as a 3D collectible on your island.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
};
