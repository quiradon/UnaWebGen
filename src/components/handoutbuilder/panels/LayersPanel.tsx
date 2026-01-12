import type { Ref } from "react";
import { ChevronDown, ChevronUp, Eye, EyeOff, Layers, Lock, Square, Trash2, Type, Unlock } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Layer } from "@/components/handoutbuilder/handoutCanvasTypes";

type LayersPanelProps = {
  open: boolean;
  layers: Layer[];
  selectedIds: string[];
  onToggleOpen: () => void;
  onClose: () => void;
  onSelectLayer: (layer: Layer, shiftKey: boolean) => void;
  onMoveLayer: (id: string, direction: -1 | 1) => void;
  onToggleVisible: (id: string) => void;
  onToggleLocked: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  panelRef?: Ref<HTMLDivElement>;
};

export function LayersPanel({
  open,
  layers,
  selectedIds,
  onToggleOpen,
  onClose,
  onSelectLayer,
  onMoveLayer,
  onToggleVisible,
  onToggleLocked,
  onDeleteLayer,
  panelRef,
}: LayersPanelProps) {
  const layersForList = [...layers].reverse();

  return (
    <div ref={panelRef} className={`handout-layers-float ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className="handout-layers-toggle"
        onClick={onToggleOpen}
        aria-expanded={open}
        aria-controls="handout-layers-panel"
      >
        <Layers className="h-4 w-4" />
        <span>Camadas</span>
      </button>
      {open && (
        <div className="handout-layers-panel" id="handout-layers-panel">
          <div className="handout-layers-panel-header">
            <span className="handout-layers-panel-title">Camadas</span>
            <button
              type="button"
              className="handout-layers-panel-close"
              onClick={onClose}
              aria-label="Fechar camadas"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          <div className="handout-layers-panel-body">
            {layersForList.length === 0 && (
              <div className="text-sm text-muted-foreground">Sem camadas. Adicione um texto ou forma.</div>
            )}
            {layersForList.map((layer, idxFromTop) => {
              const realIdx = layers.length - 1 - idxFromTop;
              const isSelected = selectedIds.includes(layer.id);
              const canMoveForward = realIdx < layers.length - 1;
              const canMoveBackward = realIdx > 0;

              return (
                <div key={layer.id} className={`handout-layer-row ${isSelected ? "is-selected" : ""}`}>
                  <button
                    type="button"
                    className="handout-layer-main"
                    onClick={(event) => onSelectLayer(layer, event.shiftKey)}
                  >
                    <span className="handout-layer-icon">
                      {layer.type === "shape" ? <Square className="h-4 w-4" /> : <Type className="h-4 w-4" />}
                    </span>
                    <span className="handout-layer-name" title={layer.name}>
                      {layer.name || layer.id}
                    </span>
                  </button>

                  <div className="handout-layer-actions">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={!canMoveForward}
                      onClick={() => onMoveLayer(layer.id, 1)}
                      aria-label="Trazer para frente"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={!canMoveBackward}
                      onClick={() => onMoveLayer(layer.id, -1)}
                      aria-label="Enviar para tras"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => onToggleVisible(layer.id)}
                      aria-label={layer.visible ? "Ocultar" : "Mostrar"}
                    >
                      {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => onToggleLocked(layer.id)}
                      aria-label={layer.locked ? "Desbloquear" : "Bloquear"}
                    >
                      {layer.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    </Button>
                    <Button type="button" size="icon" variant="ghost" onClick={() => onDeleteLayer(layer.id)} aria-label="Excluir">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
