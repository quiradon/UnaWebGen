import { Upload } from "lucide-react";

import { ColorPicker } from "@/components/handoutbuilder/controls/ColorPicker";
import { GradientStopEditor } from "@/components/handoutbuilder/controls/GradientStopEditor";
import {
  SHAPE_FILL_MODE_LABELS,
  SHAPE_FILL_MODE_VALUES,
  SHAPE_IMAGE_FIT_LABELS,
  SHAPE_IMAGE_FIT_VALUES,
} from "@/components/handoutbuilder/handoutCanvasOptions";
import type { Layer, ShapeFillMode, ShapeImageFit, TextLayer } from "@/components/handoutbuilder/handoutCanvasTypes";
import { COLOR_SUGGESTIONS } from "@/components/handoutbuilder/handoutCanvasConfig";
import { clamp } from "@/components/handoutbuilder/handoutCanvasUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type HandoutPropsTextProps = {
  selectedLayer: TextLayer;
  updateLayer: (id: string, updater: (prev: Layer) => Layer) => void;
  recordColor: (value: string) => void;
  colorHistory: string[];
  textImageFileRef: React.RefObject<HTMLInputElement>;
  setTextFillImage: (id: string, file: File) => void | Promise<void>;
};

export function HandoutPropsText(props: HandoutPropsTextProps) {
  const { selectedLayer, updateLayer, recordColor, colorHistory, textImageFileRef, setTextFillImage } = props;

  return (
    <>
      <div className="grid gap-3 rounded-md border border-input p-3">
        <div className="text-sm font-medium">Preenchimento do texto</div>
        <div className="grid gap-2">
          <Label>Modo</Label>
          <Select
            value={selectedLayer.fillMode}
            onValueChange={(value) =>
              updateLayer(selectedLayer.id, (p) =>
                p.type === "text" ? { ...p, fillMode: value as ShapeFillMode } : p,
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SHAPE_FILL_MODE_VALUES.map((mode) => (
                <SelectItem key={mode} value={mode}>
                  {SHAPE_FILL_MODE_LABELS[mode]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedLayer.fillMode !== "image" && (
          <div className={`grid gap-3 ${selectedLayer.fillMode === "solid" ? "" : "grid-cols-2"}`}>
            <div className="grid gap-2">
              <Label>{selectedLayer.fillMode === "solid" ? "Cor" : "Cor 1"}</Label>
              <ColorPicker
                value={selectedLayer.fillColor}
                onValueChange={(value) => {
                  updateLayer(selectedLayer.id, (p) => (p.type === "text" ? { ...p, fillColor: value, color: value } : p));
                  recordColor(value);
                }}
                suggestions={COLOR_SUGGESTIONS}
                history={colorHistory}
                ariaLabel="Cor primaria"
                className="handout-color-inline"
              />
            </div>

            {selectedLayer.fillMode !== "solid" && (
              <div className="grid gap-2">
                <Label>Cor 2</Label>
                <ColorPicker
                  value={selectedLayer.fillColor2}
                  onValueChange={(value) => {
                    updateLayer(selectedLayer.id, (p) => (p.type === "text" ? { ...p, fillColor2: value } : p));
                    recordColor(value);
                  }}
                  suggestions={COLOR_SUGGESTIONS}
                  history={colorHistory}
                  ariaLabel="Cor secundaria"
                  className="handout-color-inline"
                />
              </div>
            )}
          </div>
        )}

        {(selectedLayer.fillMode === "linear" || selectedLayer.fillMode === "radial") && (
          <GradientStopEditor
            stop1={selectedLayer.fillStop1}
            stop2={selectedLayer.fillStop2}
            color1={selectedLayer.fillColor}
            color2={selectedLayer.fillColor2}
            angle={selectedLayer.gradientAngle}
            mode={selectedLayer.fillMode}
            onStop1Change={(value) =>
              updateLayer(selectedLayer.id, (p) => (p.type === "text" ? { ...p, fillStop1: value } : p))
            }
            onStop2Change={(value) =>
              updateLayer(selectedLayer.id, (p) => (p.type === "text" ? { ...p, fillStop2: value } : p))
            }
            onAngleChange={(value) =>
              updateLayer(selectedLayer.id, (p) => (p.type === "text" ? { ...p, gradientAngle: value } : p))
            }
          />
        )}

        {selectedLayer.fillMode === "image" && (
          <div className="grid gap-2">
            <Button type="button" variant="outline" onClick={() => textImageFileRef.current?.click()}>
              <Upload className="h-4 w-4" />
              <span>Selecionar imagem</span>
            </Button>
            <input
              ref={textImageFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void setTextFillImage(selectedLayer.id, file);
                e.currentTarget.value = "";
              }}
            />
            {!selectedLayer.imageSrc && <div className="text-xs text-muted-foreground">Nenhuma imagem selecionada.</div>}
            <div className="grid gap-2">
              <Label>Ajuste</Label>
              <Select
                value={selectedLayer.imageFit}
                onValueChange={(value) =>
                  updateLayer(selectedLayer.id, (p) =>
                    p.type === "text" ? { ...p, imageFit: value as ShapeImageFit } : p,
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHAPE_IMAGE_FIT_VALUES.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {SHAPE_IMAGE_FIT_LABELS[mode]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-3 rounded-md border border-input p-3">
        <div className="text-sm font-medium">Texto avancado</div>
        <div className="grid gap-2">
          <Label>Espacamento (px)</Label>
          <Input
            type="number"
            min={-5}
            max={20}
            value={selectedLayer.letterSpacing}
            onChange={(e) => {
              const value = clamp(Number(e.target.value), -5, 20);
              updateLayer(selectedLayer.id, (p) => (p.type === "text" ? { ...p, letterSpacing: value } : p));
            }}
          />
        </div>
        <div className="grid gap-2">
          <Label>Altura da linha</Label>
          <Input
            type="number"
            min={0.6}
            max={3}
            step={0.1}
            value={selectedLayer.lineHeight}
            onChange={(e) => {
              const value = clamp(Number(e.target.value), 0.6, 3);
              updateLayer(selectedLayer.id, (p) => (p.type === "text" ? { ...p, lineHeight: value } : p));
            }}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Contorno (px)</Label>
            <Input
              type="number"
              min={0}
              max={12}
              value={selectedLayer.strokeWidth}
              onChange={(e) => {
                const value = clamp(Number(e.target.value), 0, 12);
                updateLayer(selectedLayer.id, (p) => (p.type === "text" ? { ...p, strokeWidth: value } : p));
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label>Cor do contorno</Label>
            <ColorPicker
              value={selectedLayer.strokeColor}
              onValueChange={(value) => {
                updateLayer(selectedLayer.id, (p) => (p.type === "text" ? { ...p, strokeColor: value } : p));
                recordColor(value);
              }}
              suggestions={COLOR_SUGGESTIONS}
              history={colorHistory}
              ariaLabel="Cor do contorno"
              className="handout-color-inline"
            />
          </div>
        </div>
      </div>
    </>
  );
}
