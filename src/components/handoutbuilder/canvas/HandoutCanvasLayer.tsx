import { Rnd } from "react-rnd";
import { RotateCcw } from "lucide-react";

import type { Layer, ShapeLayer, SnapGuide, TextLayer } from "@/components/handoutbuilder/handoutCanvasTypes";
import { clamp } from "@/components/handoutbuilder/handoutCanvasUtils";
import {
  getImageEffectStyle,
  getLayerEffectStyle,
  getShapeFill,
  getTextEffectStyle,
} from "@/components/handoutbuilder/handoutCanvasEffects";
import { getClipMaskStyle } from "@/components/handoutbuilder/handoutCanvasMasks";
import { renderInnerShadowFilter, renderShapeElement } from "@/components/handoutbuilder/handoutCanvasShapes";
import { HandoutCanvasTextLayer } from "@/components/handoutbuilder/canvas/HandoutCanvasTextLayer";

export type HandoutCanvasLayerContext = {
  zoom: number;
  pageWidth: number;
  pageHeight: number;
  layers: Layer[];
  selectedIds: string[];
  selectedId: string | null;
  editingId: string | null;
  manipulatingId: string | null;
  isGroupSelection: boolean;
  activeGroupOffset: { dx: number; dy: number } | null;
  dragOverride: { id: string; x: number; y: number } | null;
  snapEnabled: boolean;
  snapTargetsRef: React.MutableRefObject<{ vertical: number[]; horizontal: number[] } | null>;
  dragAnchorRef: React.MutableRefObject<{ id: string; offsetX: number; offsetY: number } | null>;
  textEditorRef: React.RefObject<HTMLTextAreaElement>;
  updateLayer: (id: string, updater: (prev: Layer) => Layer) => void;
  setSelection: (ids: string[], primaryId: string | null) => void;
  selectLayerFromPointer: (layer: Layer, additive: boolean) => void;
  openContextMenu: (event: React.MouseEvent, ids: string[], primaryId: string | null) => void;
  closeContextMenu: () => void;
  finishTextEditing: () => void;
  cancelTextEditing: () => void;
  startTextEditing: (layer: TextLayer) => void;
  openPropsTab: () => void;
  startRotation: (event: React.PointerEvent, layer: Layer) => void;
  getPointerCanvasPosition: (event: MouseEvent | TouchEvent) => { x: number; y: number } | null;
  prepareSnapTargets: (excludeIds: string[]) => void;
  clearSnapGuides: () => void;
  clearSnapTargets: () => void;
  scheduleDragOverride: (id: string, x: number, y: number) => void;
  clearDragOverride: () => void;
  computeSnapResult: (
    rect: { x: number; y: number; width: number; height: number },
    excludeIds: string[],
  ) => { x: number; y: number; guides: SnapGuide[] };
  computeSnapResultWithTargets: (
    rect: { x: number; y: number; width: number; height: number },
    targets: { vertical: number[]; horizontal: number[] },
  ) => { x: number; y: number; guides: SnapGuide[] };
  getSnapTargets: (excludeIds: string[]) => { vertical: number[]; horizontal: number[] };
  scheduleSnapGuides: (guides: SnapGuide[]) => void;
  setManipulatingId: (value: string | null) => void;
};

type HandoutCanvasLayerProps = {
  layer: Layer;
  context: HandoutCanvasLayerContext;
};

export function HandoutCanvasLayer({ layer, context }: HandoutCanvasLayerProps) {
  const {
    zoom,
    pageWidth,
    pageHeight,
    layers,
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
    textEditorRef,
    updateLayer,
    setSelection,
    selectLayerFromPointer,
    openContextMenu,
    closeContextMenu,
    finishTextEditing,
    cancelTextEditing,
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
  const isRotated = Math.abs(layer.rotation) > 0.01;
  if (!layer.visible) return null;

  const layerTransform = `rotate(${layer.rotation}deg) scaleX(${layer.flipX ? -1 : 1}) scaleY(${layer.flipY ? -1 : 1})`;
  const isImageLayer = layer.type === "image";
  const isTextLayer = layer.type === "text";
  const isShapeLayer = layer.type === "shape";
  const shapeLayer = isShapeLayer ? (layer as ShapeLayer) : null;
  const isManipulatingLayer = manipulatingId === layer.id || (manipulatingId === "group" && isSelected);
  const suppressEffects = isManipulatingLayer && !isEditing;
  const layerBlendMode = suppressEffects ? "normal" : layer.blendMode;
  const layerEffectStyle = isImageLayer || isTextLayer || isShapeLayer ? undefined : getLayerEffectStyle(layer.effects);
  const innerShadowEnabled = layer.effects.innerShadow.enabled && layer.effects.innerShadow.opacity > 0;
  const innerShadowId = innerShadowEnabled ? `handout-inner-shadow-${layer.id}` : null;
  const imageEffectStyle = isImageLayer ? getImageEffectStyle(layer.effects) : null;
  const textEffectStyle = !suppressEffects && isTextLayer ? getTextEffectStyle(layer.effects) : null;
  const shapeEffectStyle = !suppressEffects && isShapeLayer ? getTextEffectStyle(layer.effects) : null;
  const shapeFill = shapeLayer ? getShapeFill(shapeLayer, shapeLayer.id) : null;
  const showInnerShadow = Boolean(isImageLayer && innerShadowId && !suppressEffects);
  const showTextInnerShadow = Boolean(isTextLayer && innerShadowId && !suppressEffects);
  const showShapeInnerShadow = Boolean(isShapeLayer && innerShadowId && !suppressEffects);
  const imageFilterStyle = isImageLayer
    ? ({
        filter: suppressEffects ? "none" : imageEffectStyle?.filter ?? "none",
      } as React.CSSProperties)
    : undefined;
  const innerShadowFilterStyle = showInnerShadow
    ? ({ filter: `url(#${innerShadowId})` } as React.CSSProperties)
    : undefined;
  const shapeFilterStyle = shapeEffectStyle ? ({ filter: shapeEffectStyle.filter } as React.CSSProperties) : undefined;
  const effectNeedsOverflow = layer.effects.dropShadow.enabled || layer.effects.blur > 0;
  const clipLayer =
    layer.clipToId && layer.clipToId !== layer.id ? layers.find((item) => item.id === layer.clipToId) : null;
  const clipMaskStyle =
    clipLayer && clipLayer.visible && (clipLayer.type === "shape" || clipLayer.type === "text")
      ? getClipMaskStyle(layer, clipLayer)
      : null;
  const layerInnerStyle = {
    opacity: layer.opacity,
    overflow: effectNeedsOverflow ? "visible" : undefined,
    ...(clipMaskStyle ?? {}),
  } as const;
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
    width: "12px",
    height: "12px",
    background: "var(--handout-accent, hsl(var(--primary)))",
    borderRadius: "999px",
    border: "2px solid rgba(255,255,255,0.85)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
  } as const;
  const canResize = isPrimarySelected && !layer.locked && !isEditing && !isGroupSelection;
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
      key={layer.id}
      bounds="parent"
      size={{ width: layer.width, height: layer.height }}
      position={layerPosition}
      scale={zoom}
      data-layer-id={layer.id}
      disableDragging={layer.locked || isEditing || (isGroupSelection && isSelected)}
      enableResizing={canResize}
      resizeHandleStyles={resizeHandleStyles}
      lockAspectRatio={layer.type === "image" ? layer.keepAspectRatio : false}
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
          startTextEditing(layer);
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
      onResizeStart={() => setManipulatingId(layer.id)}
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
        setManipulatingId(null);
      }}
      style={{ mixBlendMode: layerBlendMode }}
      className={`handout-layer ${layer.type === "image" ? "is-image" : layer.type === "shape" ? "is-shape" : "is-text"} ${isSelected ? "is-selected" : ""} ${layer.locked ? "is-locked" : ""} ${isRotated ? "is-rotated" : ""} ${isManipulatingLayer ? "is-manipulating" : ""}`}
    >
      {isPrimarySelected && !isEditing && (
        <div className="handout-layer-bounds">
          <div className={boundsLabelClassName} aria-hidden="true">
            {Math.round(layer.width)}x{Math.round(layer.height)} Жњ x:{Math.round(layer.x)} y:{Math.round(layer.y)}
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
      )}

      <div className="handout-layer-inner" style={layerInnerStyle}>
        <div
          className="handout-layer-transform"
          style={{ transform: layerTransform, transformOrigin: "center center", ...layerEffectStyle }}
        >
          {layer.type === "image" ? (
            <div className="handout-layer-image-wrap">
              {showInnerShadow && innerShadowId ? renderInnerShadowFilter(innerShadowId, layer.effects.innerShadow) : null}
              <img src={layer.src} alt="" draggable={false} className="handout-layer-image" style={imageFilterStyle} />
              {showInnerShadow && innerShadowFilterStyle ? (
                <img
                  src={layer.src}
                  alt=""
                  draggable={false}
                  className="handout-layer-image handout-layer-image-shadow"
                  style={innerShadowFilterStyle}
                />
              ) : null}
            </div>
          ) : layer.type === "shape" && shapeLayer ? (
            <>
              {showShapeInnerShadow && innerShadowId ? renderInnerShadowFilter(innerShadowId, layer.effects.innerShadow) : null}
              <svg className="handout-layer-shape" viewBox="0 0 100 100" preserveAspectRatio="none">
                {shapeFill?.defs}
                {renderShapeElement(shapeLayer.shape, shapeLayer.cornerRadius, {
                  className: "handout-layer-shape-fill",
                  fill: shapeFill?.fill,
                  filterId: showShapeInnerShadow && innerShadowId ? innerShadowId : null,
                  style: shapeFilterStyle,
                })}
                {showShapeInnerShadow && innerShadowId ? (
                  <g className="handout-layer-shape-shadow">
                    {renderShapeElement(shapeLayer.shape, shapeLayer.cornerRadius, {
                      className: "handout-layer-shape-fill",
                      fill: shapeFill?.fill,
                      filterId: innerShadowId,
                      style: shapeFilterStyle,
                    })}
                  </g>
                ) : null}
              </svg>
            </>
          ) : layer.type === "text" ? (
            <HandoutCanvasTextLayer
              layer={layer}
              isEditing={isEditing}
              textEditorRef={textEditorRef}
              textEffectStyle={textEffectStyle}
              showTextInnerShadow={showTextInnerShadow}
              innerShadowId={innerShadowId}
              updateLayer={updateLayer}
              finishTextEditing={finishTextEditing}
              cancelTextEditing={cancelTextEditing}
            />
          ) : null}
        </div>
      </div>
    </Rnd>
  );
}
