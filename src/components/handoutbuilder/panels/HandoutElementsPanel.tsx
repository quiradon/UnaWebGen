import { useRef } from "react";
import { Circle, Square, Star, Triangle, Type, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ShapeKind } from "@/components/handoutbuilder/handoutCanvasTypes";

type HandoutElementsPanelProps = {
  addText: () => void;
  addShape: (kind: ShapeKind) => void;
  addSvg: (files: FileList) => void;
};

export function HandoutElementsPanel({ addText, addShape, addSvg }: HandoutElementsPanelProps) {
  const svgFileRef = useRef<HTMLInputElement | null>(null);

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
      <div className="handout-panel-card">
        <div className="handout-panel-subtitle">SVG</div>
        <Button type="button" variant="outline" onClick={() => svgFileRef.current?.click()} className="w-full gap-2">
          <Upload className="h-4 w-4" />
          Enviar SVG
        </Button>
        <input
          ref={svgFileRef}
          type="file"
          accept=".svg,image/svg+xml"
          multiple
          className="hidden"
          onChange={(event) => {
            const files = event.target.files;
            if (files?.length) addSvg(files);
            event.currentTarget.value = "";
          }}
        />
        <div className="handout-panel-hint">Envie um SVG para inserir como elemento.</div>
      </div>
    </div>
  );
}
