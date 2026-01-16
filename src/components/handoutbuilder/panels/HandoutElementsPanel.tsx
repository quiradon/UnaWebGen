import { Circle, Square, Star, Triangle, Type } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ShapeKind } from "@/components/handoutbuilder/handoutCanvasTypes";

type HandoutElementsPanelProps = {
  addText: () => void;
  addShape: (kind: ShapeKind) => void;
};

export function HandoutElementsPanel({ addText, addShape }: HandoutElementsPanelProps) {
  return (
    <div className="handout-panel-section">
      <div className="handout-panel-title">Elementos</div>
      <div className="handout-panel-card">
        <div className="handout-panel-subtitle">Texto</div>
        <Button type="button" onClick={addText} className="w-full gap-2">
          <Type className="h-4 w-4" />
          Adicionar texto
        </Button>
        <div className="handout-panel-hint">
          Crie caixas de texto e ajuste fonte/tamanho na barra superior.
        </div>
      </div>
      <div className="handout-panel-card">
        <div className="handout-panel-subtitle">Formas</div>
        <div className="handout-shape-grid">
          <Button type="button" variant="outline" className="handout-shape-button" onClick={() => addShape("rect")}>
            <Square className="h-4 w-4" />
            Ret’'ngulo
          </Button>
          <Button type="button" variant="outline" className="handout-shape-button" onClick={() => addShape("ellipse")}>
            <Circle className="h-4 w-4" />
            C¶­rculo
          </Button>
          <Button type="button" variant="outline" className="handout-shape-button" onClick={() => addShape("triangle")}>
            <Triangle className="h-4 w-4" />
            Tri’'ngulo
          </Button>
          <Button type="button" variant="outline" className="handout-shape-button" onClick={() => addShape("diamond")}>
            <Square className="h-4 w-4 rotate-45" />
            Diamante
          </Button>
          <Button type="button" variant="outline" className="handout-shape-button" onClick={() => addShape("hexagon")}>
            <Square className="h-4 w-4" />
            Hex¶ÿgono
          </Button>
          <Button type="button" variant="outline" className="handout-shape-button" onClick={() => addShape("star")}>
            <Star className="h-4 w-4" />
            Estrela
          </Button>
        </div>
        <div className="handout-panel-hint">Escolha uma forma e personalize o preenchimento nas propriedades.</div>
      </div>
    </div>
  );
}
