import { motion } from "framer-motion";
import { MyScapeBoard } from "./MyScapeBoard";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import type { MyScapePlacedLandmark } from "../../types";
import type { UnlockedLandmarkAsset } from "../../utils/myScape";

interface ScapeBoardStageProps {
  assets: UnlockedLandmarkAsset[];
  boardRef: RefObject<HTMLDivElement>;
  dragPreview: { x: number; y: number } | null;
  draggingId: string | null;
  entryReady: boolean;
  isEditMode: boolean;
  newTodayIds: Set<string>;
  placedLandmarks: MyScapePlacedLandmark[];
  placementPreview: { col: number; row: number; valid: boolean; active: boolean } | null;
  selectedId: string | null;
  onItemPointerDown: (event: ReactPointerEvent<HTMLButtonElement>, itemId: string) => void;
  onSelectItem: (itemId: string) => void;
}

export const ScapeBoardStage = ({
  assets,
  boardRef,
  dragPreview,
  draggingId,
  entryReady,
  isEditMode,
  newTodayIds,
  placedLandmarks,
  placementPreview,
  selectedId,
  onItemPointerDown,
  onSelectItem,
}: ScapeBoardStageProps) => (
  <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
    <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8f5ee_0%,#f3f2eb_38%,#eef1e8_72%,#ebefe6_100%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(120%_78%_at_50%_0%,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.22)_38%,rgba(255,255,255,0)_68%)]" />
    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(232,238,228,0.24)_0%,rgba(232,238,228,0.08)_34%,rgba(232,238,228,0)_58%)]" />

    <motion.div
      className="relative z-10 h-full w-full"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={
        entryReady
          ? {
              opacity: 1,
              scale: isEditMode ? 0.96 : 1,
              y: isEditMode ? -48 : -18,
            }
          : { opacity: 0, scale: 0.96, y: -8 }
      }
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <MyScapeBoard
        boardRef={boardRef}
        assets={assets}
        placedLandmarks={placedLandmarks}
        selectedId={selectedId}
        draggingId={draggingId}
        entryReady={entryReady}
        dragPreview={dragPreview}
        placementPreview={placementPreview}
        isEditMode={isEditMode}
        newTodayIds={newTodayIds}
        onItemPointerDown={onItemPointerDown}
        onSelectItem={onSelectItem}
      />
    </motion.div>
  </section>
);
