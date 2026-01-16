import { useMemo } from "react";
import { ChevronDown, ChevronUp, Copy, FlipHorizontal2, FlipVertical2, Trash2 } from "lucide-react";

import type { CSSVars, ContextMenuState, Layer } from "@/components/handoutbuilder/handoutCanvasTypes";

type LayerContextMenuProps = {
  contextMenu: ContextMenuState | null;
  layers: Layer[];
  onClose: () => void;
  onDuplicate: (ids: string[]) => void;
  onDelete: (ids: string[]) => void;
  onMoveLayer: (id: string, direction: -1 | 1) => void;
  onToggleFlip: (ids: string[], axis: "x" | "y") => void;
};

export function LayerContextMenu({
  contextMenu,
  layers,
  onClose,
  onDuplicate,
  onDelete,
  onMoveLayer,
  onToggleFlip,
}: LayerContextMenuProps) {
  const contextMenuLayers = useMemo(() => {
    if (!contextMenu) return [];
    const idSet = new Set(contextMenu.ids);
    return layers.filter((layer) => idSet.has(layer.id));
  }, [contextMenu, layers]);

  if (!contextMenu || contextMenuLayers.length === 0) return null;

  const contextMenuStyle = {
    "--context-x": `${contextMenu.x}px`,
    "--context-y": `${contextMenu.y}px`,
  } as CSSVars;
  const contextMenuPrimary = contextMenu.primaryId
    ? layers.find((layer) => layer.id === contextMenu.primaryId) ?? null
    : null;
  const contextMenuPrimaryIndex = contextMenuPrimary ? layers.findIndex((layer) => layer.id === contextMenuPrimary.id) : -1;
  const contextMenuIsSingle = contextMenuLayers.length === 1;
  const contextMenuCanMoveForward =
    contextMenuIsSingle && contextMenuPrimaryIndex >= 0 && contextMenuPrimaryIndex < layers.length - 1;
  const contextMenuCanMoveBackward = contextMenuIsSingle && contextMenuPrimaryIndex > 0;
  const contextMenuShouldFlipX = contextMenuLayers.some((layer) => !layer.flipX);
  const contextMenuShouldFlipY = contextMenuLayers.some((layer) => !layer.flipY);
  const contextMenuLayerIds = contextMenuLayers.map((layer) => layer.id);

  return (
    <div className="handout-context-menu" style={contextMenuStyle}>
      <div
        className="handout-context-menu-backdrop"
        onMouseDown={onClose}
        onContextMenu={(event) => {
          event.preventDefault();
          onClose();
        }}
      />
      <div className="handout-context-menu-card" role="menu" aria-label="Acoes da camada" onMouseDown={(event) => event.stopPropagation()}>
        <button
          type="button"
          className="handout-context-menu-item"
          onClick={() => {
            onDuplicate(contextMenuLayerIds);
            onClose();
          }}
        >
          <Copy className="h-4 w-4" />
          <span className="handout-context-menu-label">Duplicar</span>
        </button>
        <button
          type="button"
          className="handout-context-menu-item is-danger"
          onClick={() => {
            onDelete(contextMenuLayerIds);
            onClose();
          }}
        >
          <Trash2 className="h-4 w-4" />
          <span className="handout-context-menu-label">Excluir</span>
        </button>
        <div className="handout-context-menu-divider" />
        {contextMenuIsSingle && (
          <>
            <button
              type="button"
              className="handout-context-menu-item"
              disabled={!contextMenuCanMoveForward || !contextMenuPrimary}
              onClick={() => {
                if (contextMenuPrimary) onMoveLayer(contextMenuPrimary.id, 1);
                onClose();
              }}
            >
              <ChevronUp className="h-4 w-4" />
              <span className="handout-context-menu-label">Trazer para frente</span>
            </button>
            <button
              type="button"
              className="handout-context-menu-item"
              disabled={!contextMenuCanMoveBackward || !contextMenuPrimary}
              onClick={() => {
                if (contextMenuPrimary) onMoveLayer(contextMenuPrimary.id, -1);
                onClose();
              }}
            >
              <ChevronDown className="h-4 w-4" />
              <span className="handout-context-menu-label">Enviar para tras</span>
            </button>
            <div className="handout-context-menu-divider" />
          </>
        )}
        <button
          type="button"
          className="handout-context-menu-item"
          onClick={() => {
            onToggleFlip(contextMenuLayerIds, "x");
            onClose();
          }}
        >
          <FlipHorizontal2 className="h-4 w-4" />
          <span className="handout-context-menu-label">
            {contextMenuShouldFlipX ? "Flip horizontal" : "Desfazer flip horizontal"}
          </span>
        </button>
        <button
          type="button"
          className="handout-context-menu-item"
          onClick={() => {
            onToggleFlip(contextMenuLayerIds, "y");
            onClose();
          }}
        >
          <FlipVertical2 className="h-4 w-4" />
          <span className="handout-context-menu-label">
            {contextMenuShouldFlipY ? "Flip vertical" : "Desfazer flip vertical"}
          </span>
        </button>
      </div>
    </div>
  );
}
