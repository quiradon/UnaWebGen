import { useState } from "react";
import { Rnd } from "react-rnd";
import { RotateCcw } from "lucide-react";

import type { Layer, TextLayer } from "@/components/handoutbuilder/handoutCanvasTypes";
import { clamp } from "@/components/handoutbuilder/handoutCanvasUtils";
import type { HandoutCanvasLayerContext } from "@/components/handoutbuilder/canvas/HandoutCanvasLayer";

type HandoutCanvasTransformOverlayProps = {
  layer: Layer;
  context: HandoutCanvasLayerContext;
};

export function HandoutCanvasTransformOverlay({ layer, context }: HandoutCanvasTransformOverlayProps) {
  const {
    zoom,
    pageWidth,
    pageHeight,
    selectedIds,
    selectedId,
    editingId,
    manipulatingId,
    isGroupSelection,
    activeGroupOffset,
    dragOverride,
    snapEnabled,
    snapTargetsRef,
    dragAnchorRef,
    updateLayer,
    setSelection,
    selectLayerFromPointer,
    openContextMenu,
    closeContextMenu,
    finishTextEditing,
    startTextEditing,
    openPropsTab,
    startRotation,
    getPointerCanvasPosition,
    prepareSnapTargets,
    clearSnapGuides,
    clearSnapTargets,
    scheduleDragOverride,
    clearDragOverride,
    computeSnapResult,
    computeSnapResultWithTargets,
    getSnapTargets,
    scheduleSnapGuides,
    setManipulatingId,
  } = context;

  const isSelected = selectedIds.includes(layer.id);
  const isPrimarySelected = layer.id === selectedId;
  const isEditing = editingId === layer.id;
  if (!isSelected || !isPrimarySelected || isEditing || isGroupSelection) return null;

  const [lockCornerAspectRatio, setLockCornerAspectRatio] = useState(false);
  const isManipulatingLayer = manipulatingId === layer.id;
  const labelIsBottom = layer.y < 40;
  const labelIsRight = layer.x + 240 > pageWidth;
  const boundsLabelClassName = [
    "handout-layer-bounds-label",
    labelIsBottom ? "is-bottom" : "",
    labelIsRight ? "is-right" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const handleStyle = {
    width: "var(--handout-handle-size, 12px)",
    height: "var(--handout-handle-size, 12px)",
    background: "var(--handout-accent, hsl(var(--primary)))",
    borderRadius: "999px",
    border: "var(--handout-handle-border, 2px) solid rgba(255,255,255,0.85)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
  } as const;
  const canResize = !layer.locked;
  const resizeHandleStyles = canResize
    ? {
        topLeft: handleStyle,
        topRight: handleStyle,
        bottomLeft: handleStyle,
        bottomRight: handleStyle,
      }
    : undefined;
  const overridePosition = dragOverride?.id === layer.id ? dragOverride : null;
  const groupOffset = activeGroupOffset && isSelected ? activeGroupOffset : null;
  const layerPosition = overridePosition
    ? { x: overridePosition.x, y: overridePosition.y }
    : groupOffset
      ? { x: layer.x + groupOffset.dx, y: layer.y + groupOffset.dy }
      : { x: layer.x, y: layer.y };

  return (
    <Rnd
      key={`overlay-${layer.id}`}
      bounds="parent"
      size={{ width: layer.width, height: layer.height }}
      position={layerPosition}
      scale={zoom}
      data-layer-id={layer.id}
      disableDragging={layer.locked}
      enableResizing={canResize}
      resizeHandleStyles={resizeHandleStyles}
      lockAspectRatio={lockCornerAspectRatio}
      onDragStart={(event) => {
        clearSnapGuides();
        if (snapEnabled) prepareSnapTargets([layer.id]);
        const pointer = getPointerCanvasPosition(event as MouseEvent | TouchEvent);
        if (pointer) {
          dragAnchorRef.current = {
            id: layer.id,
            offsetX: pointer.x - layer.x,
            offsetY: pointer.y - layer.y,
          };
          scheduleDragOverride(layer.id, layer.x, layer.y);
        }
        setManipulatingId(layer.id);
      }}
      onDrag={(event) => {
        const anchor = dragAnchorRef.current;
        if (!anchor || anchor.id !== layer.id) return;
        const pointer = getPointerCanvasPosition(event as MouseEvent | TouchEvent);
        if (!pointer) return;
        const maxX = Math.max(0, pageWidth - layer.width);
        const maxY = Math.max(0, pageHeight - layer.height);
        const nextX = clamp(pointer.x - anchor.offsetX, 0, maxX);
        const nextY = clamp(pointer.y - anchor.offsetY, 0, maxY);
        scheduleDragOverride(layer.id, nextX, nextY);
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        closeContextMenu();
        if (editingId && editingId !== layer.id) finishTextEditing();
        selectLayerFromPointer(layer, e.shiftKey);
      }}
      onContextMenu={(e) => {
        if (editingId) return;
        const isSelectedLayer = selectedIds.includes(layer.id);
        const ids = isSelectedLayer ? selectedIds : [layer.id];
        const primaryId = isSelectedLayer ? selectedId ?? layer.id : layer.id;
        if (!isSelectedLayer) setSelection([layer.id], layer.id);
        openContextMenu(e, ids, primaryId);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (layer.type === "text") {
          startTextEditing(layer as TextLayer);
          return;
        }
        openPropsTab();
      }}
      onDragStop={(event, data) => {
        const anchor = dragAnchorRef.current;
        const pointer = getPointerCanvasPosition(event as MouseEvent | TouchEvent);
        let baseX = data.x;
        let baseY = data.y;
        if (anchor && anchor.id === layer.id && pointer) {
          const maxX = Math.max(0, pageWidth - layer.width);
          const maxY = Math.max(0, pageHeight - layer.height);
          baseX = clamp(pointer.x - anchor.offsetX, 0, maxX);
          baseY = clamp(pointer.y - anchor.offsetY, 0, maxY);
        } else if (dragOverride?.id === layer.id) {
          baseX = dragOverride.x;
          baseY = dragOverride.y;
        }
        const targets = snapTargetsRef.current ?? getSnapTargets([layer.id]);
        const result = computeSnapResultWithTargets(
          { x: baseX, y: baseY, width: layer.width, height: layer.height },
          targets,
        );
        updateLayer(layer.id, (p) => ({ ...p, x: result.x, y: result.y }));
        clearSnapGuides();
        clearSnapTargets();
        clearDragOverride();
        setManipulatingId(null);
      }}
      onResizeStart={(_, direction) => {
        setManipulatingId(layer.id);
        const lockCorner =
          direction === "topLeft" ||
          direction === "topRight" ||
          direction === "bottomLeft" ||
          direction === "bottomRight";
        setLockCornerAspectRatio(lockCorner);
      }}
      onResize={(_, __, ref, ___, position) => {
        if (!snapEnabled) return;
        const nextWidth = Number(ref.style.width.replace("px", ""));
        const nextHeight = Number(ref.style.height.replace("px", ""));
        const result = computeSnapResult({ x: position.x, y: position.y, width: nextWidth, height: nextHeight }, [
          layer.id,
        ]);
        scheduleSnapGuides(result.guides);
      }}
      onResizeStop={(_, __, ref, ___, position) => {
        const nextWidth = Number(ref.style.width.replace("px", ""));
        const nextHeight = Number(ref.style.height.replace("px", ""));
        const result = computeSnapResult({ x: position.x, y: position.y, width: nextWidth, height: nextHeight }, [
          layer.id,
        ]);
        updateLayer(layer.id, (p) => ({
          ...p,
          width: Math.max(20, nextWidth),
          height: Math.max(20, nextHeight),
          x: result.x,
          y: result.y,
        }));
        clearSnapGuides();
        setLockCornerAspectRatio(false);
        setManipulatingId(null);
      }}
      className={`handout-transform-overlay ${isManipulatingLayer ? "is-manipulating" : ""}`}
    >
      <div className="handout-layer-bounds">
        <div className={boundsLabelClassName} aria-hidden="true">
          {Math.round(layer.width)}x{Math.round(layer.height)} x:{Math.round(layer.x)} y:{Math.round(layer.y)}
        </div>
        <button
          type="button"
          className={`handout-rotate-handle ${layer.locked ? "is-disabled" : ""}`}
          aria-label="Rotacionar"
          disabled={layer.locked}
          onPointerDown={(e) => startRotation(e, layer)}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </Rnd>
  );
}
