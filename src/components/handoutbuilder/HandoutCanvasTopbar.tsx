import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Blend,
  Bold,
  Eye,
  EyeOff,
  Italic,
  Lock,
  Minus,
  Plus,
  Underline,
  Unlock,
} from "lucide-react";

import { BlendModePicker } from "@/components/handoutbuilder/controls/BlendModePicker";
import { ColorPicker } from "@/components/handoutbuilder/controls/ColorPicker";
import { FontSelect } from "@/components/handoutbuilder/controls/FontSelect";
import { FontWeightPicker } from "@/components/handoutbuilder/controls/FontWeightPicker";
import { FONT_PRESETS } from "@/components/handoutbuilder/handoutCanvasOptions";
import type {
  FontWeight,
  HandoutCanvasDocV1,
  Layer,
  TextAlign,
  TextLayer,
} from "@/components/handoutbuilder/handoutCanvasTypes";
import { TEXT_ALIGN_LABELS, COLOR_SUGGESTIONS } from "@/components/handoutbuilder/handoutCanvasConfig";
import { clamp } from "@/components/handoutbuilder/handoutCanvasUtils";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type HandoutCanvasTopbarProps = {
  topbarRef: React.RefObject<HTMLDivElement>;
  topbarPulse: boolean;
  doc: HandoutCanvasDocV1;
  selectedLayer: Layer | null;
  textLayer: TextLayer | null;
  colorHistory: string[];
  opacityPercent: number;
  paperOpacityPercent: number;
  textWeightOptions: ReadonlyArray<{ value: FontWeight; label: string }>;
  regularWeight: FontWeight;
  boldWeight: FontWeight;
  updateLayer: (id: string, updater: (prev: Layer) => Layer) => void;
  setDoc: React.Dispatch<React.SetStateAction<HandoutCanvasDocV1>>;
  recordColor: (value: string) => void;
};

export function HandoutCanvasTopbar(props: HandoutCanvasTopbarProps) {
  const {
    topbarRef,
    topbarPulse,
    doc,
    selectedLayer,
    textLayer,
    colorHistory,
    opacityPercent,
    paperOpacityPercent,
    textWeightOptions,
    regularWeight,
    boldWeight,
    updateLayer,
    setDoc,
    recordColor,
  } = props;

  return (
    <div ref={topbarRef} className={`handout-topbar ${topbarPulse ? "is-sizing" : ""}`}>
      <div className="handout-topbar-inner">
        <div className="handout-topbar-right">
          {!selectedLayer && (
            <div className="handout-background-toolbar" role="group" aria-label="Fundo do canvas">
              <span className="handout-topbar-chip">Fundo</span>
              <ColorPicker
                value={doc.paperColor}
                onValueChange={(value) => {
                  setDoc((p) => ({ ...p, paperColor: value }));
                  recordColor(value);
                }}
                suggestions={COLOR_SUGGESTIONS}
                history={colorHistory}
                triggerLabel="BG"
                ariaLabel="Cor do fundo"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="handout-toolbar-button"
                    aria-label="Transparencia do fundo"
                    title="Transparencia do fundo"
                  >
                    <Blend className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="handout-opacity-popover">
                  <div className="handout-opacity-panel">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={paperOpacityPercent}
                      onChange={(e) => {
                        const value = clamp(Number(e.target.value), 0, 100);
                        setDoc((p) => ({ ...p, paperOpacity: value / 100 }));
                      }}
                      className="handout-opacity-range"
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {selectedLayer && (
            <div className="handout-topbar-actions" role="group" aria-label="Acoes da camada">
              <button
                type="button"
                className={`handout-toolbar-button ${selectedLayer.visible ? "is-active" : ""}`}
                aria-label={selectedLayer.visible ? "Ocultar" : "Mostrar"}
                aria-pressed={selectedLayer.visible}
                title={selectedLayer.visible ? "Ocultar" : "Mostrar"}
                onClick={() => updateLayer(selectedLayer.id, (p) => ({ ...p, visible: !p.visible }))}
              >
                {selectedLayer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="handout-toolbar-button"
                    aria-label="Transparencia"
                    title="Transparencia"
                  >
                    <Blend className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="handout-opacity-popover">
                  <div className="handout-opacity-panel">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={opacityPercent}
                      onChange={(e) => {
                        const value = clamp(Number(e.target.value), 0, 100);
                        updateLayer(selectedLayer.id, (p) => ({ ...p, opacity: value / 100 }));
                      }}
                      className="handout-opacity-range"
                    />
                  </div>
                </PopoverContent>
              </Popover>
              <BlendModePicker
                value={selectedLayer.blendMode}
                onValueChange={(value) => updateLayer(selectedLayer.id, (p) => ({ ...p, blendMode: value }))}
              />
              <button
                type="button"
                className={`handout-toolbar-button ${selectedLayer.locked ? "is-active" : ""}`}
                aria-label={selectedLayer.locked ? "Desbloquear" : "Bloquear"}
                aria-pressed={selectedLayer.locked}
                title={selectedLayer.locked ? "Desbloquear" : "Bloquear"}
                onClick={() => updateLayer(selectedLayer.id, (p) => ({ ...p, locked: !p.locked }))}
              >
                {selectedLayer.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              </button>
            </div>
          )}

          {textLayer && (
            <div className="handout-text-toolbar" role="toolbar" aria-label="Editor de texto">
              <div className="handout-toolbar-group handout-toolbar-font">
                <FontSelect
                  value={textLayer.fontPreset}
                  onValueChange={(v) =>
                    updateLayer(textLayer.id, (p) => (p.type === "text" ? { ...p, fontPreset: v } : p))
                  }
                  className="handout-toolbar-input handout-toolbar-font-input"
                />
              </div>

              <div className="handout-toolbar-divider" aria-hidden="true" />

              <div className="handout-toolbar-group">
                <FontWeightPicker
                  value={textLayer.fontWeight}
                  onValueChange={(value) =>
                    updateLayer(textLayer.id, (p) => (p.type === "text" ? { ...p, fontWeight: value } : p))
                  }
                  fontFamily={FONT_PRESETS[textLayer.fontPreset].stack}
                  options={textWeightOptions}
                />
              </div>

              <div className="handout-toolbar-divider" aria-hidden="true" />

              <div className="handout-toolbar-group handout-toolbar-size">
                <button
                  type="button"
                  className="handout-toolbar-button"
                  aria-label="Diminuir tamanho"
                  onClick={() =>
                    updateLayer(textLayer.id, (p) =>
                      p.type === "text" ? { ...p, fontSize: clamp(p.fontSize - 2, 8, 180) } : p,
                    )
                  }
                >
                  <Minus className="h-4 w-4" />
                </button>
                <Input
                  type="number"
                  min={8}
                  max={180}
                  value={textLayer.fontSize}
                  onChange={(e) =>
                    updateLayer(textLayer.id, (p) =>
                      p.type === "text" ? { ...p, fontSize: clamp(Number(e.target.value), 8, 180) } : p,
                    )
                  }
                  className="handout-toolbar-input"
                />
                <button
                  type="button"
                  className="handout-toolbar-button"
                  aria-label="Aumentar tamanho"
                  onClick={() =>
                    updateLayer(textLayer.id, (p) =>
                      p.type === "text" ? { ...p, fontSize: clamp(p.fontSize + 2, 8, 180) } : p,
                    )
                  }
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="handout-toolbar-divider" aria-hidden="true" />

              <div className="handout-toolbar-group">
                <ColorPicker
                  value={textLayer.fillColor || textLayer.color}
                  onValueChange={(value) => {
                    updateLayer(textLayer.id, (p) => (p.type === "text" ? { ...p, color: value, fillColor: value } : p));
                    recordColor(value);
                  }}
                  suggestions={COLOR_SUGGESTIONS}
                  history={colorHistory}
                  triggerLabel="A"
                  ariaLabel="Cor do texto"
                />
                <button
                  type="button"
                  className={`handout-toolbar-button ${
                    textLayer.fontWeight !== regularWeight && textLayer.fontWeight >= boldWeight ? "is-active" : ""
                  }`}
                  aria-label="Negrito"
                  aria-pressed={textLayer.fontWeight !== regularWeight && textLayer.fontWeight >= boldWeight}
                  onClick={() => {
                    const isBold = textLayer.fontWeight !== regularWeight && textLayer.fontWeight >= boldWeight;
                    const nextWeight = isBold ? regularWeight : boldWeight;
                    updateLayer(textLayer.id, (p) => (p.type === "text" ? { ...p, fontWeight: nextWeight } : p));
                  }}
                >
                  <Bold className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className={`handout-toolbar-button ${textLayer.italic ? "is-active" : ""}`}
                  aria-label="Italico"
                  aria-pressed={textLayer.italic}
                  onClick={() => updateLayer(textLayer.id, (p) => (p.type === "text" ? { ...p, italic: !p.italic } : p))}
                >
                  <Italic className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className={`handout-toolbar-button ${textLayer.underline ? "is-active" : ""}`}
                  aria-label="Sublinhado"
                  aria-pressed={textLayer.underline}
                  onClick={() =>
                    updateLayer(textLayer.id, (p) => (p.type === "text" ? { ...p, underline: !p.underline } : p))
                  }
                >
                  <Underline className="h-4 w-4" />
                </button>
              </div>

              <div className="handout-toolbar-divider" aria-hidden="true" />

              <div className="handout-toolbar-group">
                <button
                  type="button"
                  className="handout-toolbar-button"
                  aria-label={`Alinhamento: ${TEXT_ALIGN_LABELS[textLayer.align]}`}
                  title={`Alinhamento: ${TEXT_ALIGN_LABELS[textLayer.align]}`}
                  onClick={() => {
                    const order: TextAlign[] = ["left", "center", "right"];
                    const idx = order.indexOf(textLayer.align);
                    const next = order[(idx + 1) % order.length];
                    updateLayer(textLayer.id, (p) => (p.type === "text" ? { ...p, align: next } : p));
                  }}
                >
                  {textLayer.align === "left" ? (
                    <AlignLeft className="h-4 w-4" />
                  ) : textLayer.align === "center" ? (
                    <AlignCenter className="h-4 w-4" />
                  ) : (
                    <AlignRight className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {selectedLayer && selectedLayer.type === "image" && (
            <div className="handout-topbar-selection" />
          )}
        </div>
      </div>
    </div>
  );
}
