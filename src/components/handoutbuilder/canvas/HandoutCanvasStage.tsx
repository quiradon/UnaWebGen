import { Rnd } from "react-rnd";

import type { CSSVars, HandoutCanvasDocV1, Layer, SnapGuide } from "@/components/handoutbuilder/handoutCanvasTypes";
import { clamp } from "@/components/handoutbuilder/handoutCanvasUtils";
import { HandoutCanvasLayer, HandoutCanvasLayerContext } from "@/components/handoutbuilder/canvas/HandoutCanvasLayer";
import { HandoutCanvasTransformOverlay } from "@/components/handoutbuilder/canvas/HandoutCanvasTransformOverlay";

type HandoutCanvasStageProps = {
  stageRef: React.RefObject<HTMLDivElement>;
  pageRef: React.RefObject<HTMLDivElement>;
  doc: HandoutCanvasDocV1;
  derivedPage: { width: number; height: number; vars: CSSVars };
  templateClass: string;
  isPaperTransparent: boolean;
  snapGuides: SnapGuide[];
  layerContext: HandoutCanvasLayerContext;
  selectionBounds: { x: number; y: number; width: number; height: number } | null;
  selectedLayers: Layer[];
  selectedIds: string[];
  isGroupLocked: boolean;
  activeGroupOffset: { dx: number; dy: number } | null;
  snapEnabled: boolean;
  handleStageMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
  handleStageContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  addImages: (files: FileList) => void | Promise<void>;
  clearSelection: () => void;
  finishTextEditing: () => void;
  groupDragRef: React.MutableRefObject<{
    ids: string[];
    startBounds: { x: number; y: number; width: number; height: number };
    startLayers: Record<string, { x: number; y: number; width: number; height: number }>;
  } | null>;
  groupDragAnchorRef: React.MutableRefObject<{ offsetX: number; offsetY: number } | null>;
  scheduleGroupDragUpdate: (dx: number, dy: number) => void;
  cancelGroupDragUpdate: () => void;
  setDoc: React.Dispatch<React.SetStateAction<HandoutCanvasDocV1>>;
};

export function HandoutCanvasStage(props: HandoutCanvasStageProps) {
  const {
    stageRef,
    pageRef,
    doc,
    derivedPage,
    templateClass,
    isPaperTransparent,
    snapGuides,
    layerContext,
    selectionBounds,
    selectedLayers,
    selectedIds,
    isGroupLocked,
    activeGroupOffset,
    snapEnabled,
    handleStageMouseDown,
    handleStageContextMenu,
    addImages,
    clearSelection,
    finishTextEditing,
    groupDragRef,
    groupDragAnchorRef,
    scheduleGroupDragUpdate,
    cancelGroupDragUpdate,
    setDoc,
  } = props;
  const primarySelectedLayer = layerContext.selectedId
    ? doc.layers.find((layer) => layer.id === layerContext.selectedId) ?? null
    : null;
  const showTransformOverlay =
    Boolean(primarySelectedLayer) &&
    !layerContext.isGroupSelection &&
    layerContext.editingId !== primarySelectedLayer?.id;
  const uiScale = doc.zoom > 0 ? 1 / doc.zoom : 1;
  const uiVars: CSSVars = {
    "--handout-handle-size": `${12 * uiScale}px`,
    "--handout-handle-border": `${2 * uiScale}px`,
    "--handout-rotate-size": `${18 * uiScale}px`,
    "--handout-rotate-offset": `${28 * uiScale}px`,
    "--handout-rotate-stem-top": `${16 * uiScale}px`,
    "--handout-rotate-stem-width": `${2 * uiScale}px`,
    "--handout-rotate-stem-length": `${12 * uiScale}px`,
    "--handout-rotate-icon-size": `${14 * uiScale}px`,
    "--handout-label-font": `${12 * uiScale}px`,
    "--handout-label-pad-x": `${6 * uiScale}px`,
    "--handout-label-pad-y": `${4 * uiScale}px`,
    "--handout-label-radius": `${10 * uiScale}px`,
    "--handout-label-offset": `${8 * uiScale}px`,
    "--handout-label-border": `${1 * uiScale}px`,
  };

  return (
    <div
      ref={stageRef}
      className="handout-preview-stage handout-canvas-stage"
      onMouseDown={handleStageMouseDown}
      onContextMenu={handleStageContextMenu}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files;
        if (files && files.length) void addImages(files);
      }}
    >
      <div
        className="handout-canvas-zoom"
        style={{
          transform: `scale(${doc.zoom})`,
          transformOrigin: "top left",
          marginLeft: `${(derivedPage.width * (1 - doc.zoom)) / 2}px`,
          ...uiVars,
        }}
      >
        <div
          ref={pageRef}
          className={`handout-page handout-print-target handout-canvas-page ${templateClass} ${isPaperTransparent ? "is-transparent" : ""}`}
          style={{
            ...derivedPage.vars,
            width: `${derivedPage.width}px`,
            height: `${derivedPage.height}px`,
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              clearSelection();
              finishTextEditing();
            }
          }}
        >
          {snapGuides.length > 0 && (
            <div className="handout-snap-guides">
              {snapGuides.map((guide, idx) => (
                <div
                  key={`${guide.axis}-${guide.value}-${idx}`}
                  className={`handout-snap-guide ${guide.axis === "x" ? "is-vertical" : "is-horizontal"}`}
                  style={guide.axis === "x" ? { left: `${guide.value}px` } : { top: `${guide.value}px` }}
                />
              ))}
            </div>
          )}

          {doc.layers.map((layer) => (
            <HandoutCanvasLayer key={layer.id} layer={layer} context={layerContext} />
          ))}
          {showTransformOverlay && primarySelectedLayer && (
            <HandoutCanvasTransformOverlay layer={primarySelectedLayer} context={layerContext} />
          )}

          {selectionBounds && (
            <Rnd
              bounds="parent"
              size={{ width: selectionBounds.width, height: selectionBounds.height }}
              position={
                activeGroupOffset
                  ? { x: selectionBounds.x + activeGroupOffset.dx, y: selectionBounds.y + activeGroupOffset.dy }
                  : { x: selectionBounds.x, y: selectionBounds.y }
              }
              scale={doc.zoom}
              disableDragging={isGroupLocked}
              enableResizing={!isGroupLocked}
              onDragStart={(event) => {
                if (!selectionBounds) return;
                layerContext.clearSnapGuides();
                cancelGroupDragUpdate();
                const pointer = layerContext.getPointerCanvasPosition(event as MouseEvent | TouchEvent);
                if (pointer) {
                  groupDragAnchorRef.current = {
                    offsetX: pointer.x - selectionBounds.x,
                    offsetY: pointer.y - selectionBounds.y,
                  };
                  scheduleGroupDragUpdate(0, 0);
                }
                groupDragRef.current = {
                  ids: selectedLayers.map((layer) => layer.id),
                  startBounds: { ...selectionBounds },
                  startLayers: selectedLayers.reduce(
                    (acc, layer) => {
                      acc[layer.id] = {
                        x: layer.x,
                        y: layer.y,
                        width: layer.width,
                        height: layer.height,
                      };
                      return acc;
                    },
                    {} as Record<string, { x: number; y: number; width: number; height: number }>,
                  ),
                };
                if (snapEnabled) layerContext.prepareSnapTargets(selectedLayers.map((layer) => layer.id));
                layerContext.setManipulatingId("group");
              }}
              onDrag={(event) => {
                const refData = groupDragRef.current;
                if (!refData) return;
                const pointer = layerContext.getPointerCanvasPosition(event as MouseEvent | TouchEvent);
                const anchor = groupDragAnchorRef.current;
                if (!pointer || !anchor || !selectionBounds) return;
                const maxX = Math.max(0, derivedPage.width - selectionBounds.width);
                const maxY = Math.max(0, derivedPage.height - selectionBounds.height);
                const nextX = clamp(pointer.x - anchor.offsetX, 0, maxX);
                const nextY = clamp(pointer.y - anchor.offsetY, 0, maxY);
                scheduleGroupDragUpdate(nextX - refData.startBounds.x, nextY - refData.startBounds.y);
              }}
              onDragStop={(event, data) => {
                const refData = groupDragRef.current;
                if (refData) {
                  const targets = layerContext.snapTargetsRef.current ?? layerContext.getSnapTargets(refData.ids);
                  let baseX = data.x;
                  let baseY = data.y;
                  const anchor = groupDragAnchorRef.current;
                  const pointer = layerContext.getPointerCanvasPosition(event as MouseEvent | TouchEvent);
                  if (anchor && pointer && selectionBounds) {
                    const maxX = Math.max(0, derivedPage.width - selectionBounds.width);
                    const maxY = Math.max(0, derivedPage.height - selectionBounds.height);
                    baseX = clamp(pointer.x - anchor.offsetX, 0, maxX);
                    baseY = clamp(pointer.y - anchor.offsetY, 0, maxY);
                  } else if (activeGroupOffset && selectionBounds) {
                    baseX = selectionBounds.x + activeGroupOffset.dx;
                    baseY = selectionBounds.y + activeGroupOffset.dy;
                  }
                  const result = layerContext.computeSnapResultWithTargets(
                    {
                      x: baseX,
                      y: baseY,
                      width: refData.startBounds.width,
                      height: refData.startBounds.height,
                    },
                    targets,
                  );
                  const dx = result.x - refData.startBounds.x;
                  const dy = result.y - refData.startBounds.y;
                  const idSet = new Set(refData.ids);
                  setDoc((prev) => ({
                    ...prev,
                    layers: prev.layers.map((layer) => {
                      if (!idSet.has(layer.id)) return layer;
                      const start = refData.startLayers[layer.id];
                      return {
                        ...layer,
                        x: start.x + dx,
                        y: start.y + dy,
                      };
                    }),
                  }));
                }
                cancelGroupDragUpdate();
                layerContext.clearSnapGuides();
                layerContext.clearSnapTargets();
                layerContext.setManipulatingId(null);
                groupDragRef.current = null;
              }}
              onResizeStart={() => {
                if (!selectionBounds) return;
                groupDragRef.current = {
                  ids: selectedLayers.map((layer) => layer.id),
                  startBounds: { ...selectionBounds },
                  startLayers: selectedLayers.reduce(
                    (acc, layer) => {
                      acc[layer.id] = {
                        x: layer.x,
                        y: layer.y,
                        width: layer.width,
                        height: layer.height,
                      };
                      return acc;
                    },
                    {} as Record<string, { x: number; y: number; width: number; height: number }>,
                  ),
                };
                layerContext.setManipulatingId("group");
              }}
              onResize={(_, __, ref, ___, position) => {
                const refData = groupDragRef.current;
                if (!refData) return;
                const nextWidth = Math.max(1, Number(ref.style.width.replace("px", "")));
                const nextHeight = Math.max(1, Number(ref.style.height.replace("px", "")));
                const scaleX = nextWidth / refData.startBounds.width;
                const scaleY = nextHeight / refData.startBounds.height;
                const idSet = new Set(refData.ids);
                setDoc((prev) => ({
                  ...prev,
                  layers: prev.layers.map((layer) => {
                    if (!idSet.has(layer.id)) return layer;
                    const start = refData.startLayers[layer.id];
                    const relX = start.x - refData.startBounds.x;
                    const relY = start.y - refData.startBounds.y;
                    return {
                      ...layer,
                      x: position.x + relX * scaleX,
                      y: position.y + relY * scaleY,
                      width: Math.max(20, start.width * scaleX),
                      height: Math.max(20, start.height * scaleY),
                    };
                  }),
                }));
              }}
              onResizeStop={() => {
                layerContext.clearSnapGuides();
                layerContext.setManipulatingId(null);
                groupDragRef.current = null;
              }}
              className="handout-group-bounds"
            >
              <div className="handout-group-inner" />
            </Rnd>
          )}
        </div>
      </div>
    </div>
  );
}
