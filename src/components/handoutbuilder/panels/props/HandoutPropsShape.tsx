import { Upload } from "lucide-react";

import { ColorPicker } from "@/components/handoutbuilder/controls/ColorPicker";
import { GradientStopEditor } from "@/components/handoutbuilder/controls/GradientStopEditor";
import {
  SHAPE_FILL_MODE_LABELS,
  SHAPE_FILL_MODE_VALUES,
  SHAPE_IMAGE_FIT_LABELS,
  SHAPE_IMAGE_FIT_VALUES,
  SHAPE_KIND_LABELS,
  SHAPE_KIND_VALUES,
} from "@/components/handoutbuilder/handoutCanvasOptions";
import type { Layer, ShapeFillMode, ShapeImageFit, ShapeKind, ShapeLayer } from "@/components/handoutbuilder/handoutCanvasTypes";
import { COLOR_SUGGESTIONS } from "@/components/handoutbuilder/handoutCanvasConfig";
import { clamp } from "@/components/handoutbuilder/handoutCanvasUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type HandoutPropsShapeProps = {
  selectedLayer: ShapeLayer;
  updateLayer: (id: string, updater: (prev: Layer) => Layer) => void;
  recordColor: (value: string) => void;
  colorHistory: string[];
  shapeImageFileRef: React.RefObject<HTMLInputElement>;
  setShapeFillImage: (id: string, file: File) => void | Promise<void>;
};

export function HandoutPropsShape(props: HandoutPropsShapeProps) {
  const { selectedLayer, updateLayer, recordColor, colorHistory, shapeImageFileRef, setShapeFillImage } = props;

  return (
    <>
      <div className="grid gap-3 rounded-md border border-input p-3">
        <div className="text-sm font-medium">Forma</div>
        <div className="grid gap-2">
          <Label>Tipo</Label>
          <Select
            value={selectedLayer.shape}
            onValueChange={(value) => {
              updateLayer(selectedLayer.id, (p) =>
                p.type === "shape"
                  ? {
                      ...p,
                      shape: value as ShapeKind,
                      cornerRadius: value === "rect" ? p.cornerRadius : 0,
                    }
                  : p,
              );
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SHAPE_KIND_VALUES.map((kind) => (
                <SelectItem key={kind} value={kind}>
                  {SHAPE_KIND_LABELS[kind]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedLayer.shape === "rect" && (
          <div className="grid gap-2">
            <Label>Raio da borda</Label>
            <Input
              type="number"
              min={0}
              max={50}
              value={selectedLayer.cornerRadius}
              onChange={(e) => {
                const value = clamp(Number(e.target.value), 0, 50);
                updateLayer(selectedLayer.id, (p) => (p.type === "shape" ? { ...p, cornerRadius: value } : p));
              }}
            />
          </div>
        )}
      </div>

      <div className="grid gap-3 rounded-md border border-input p-3">
        <div className="text-sm font-medium">Preenchimento</div>
        <div className="grid gap-2">
          <Label>Modo</Label>
          <Select
            value={selectedLayer.fillMode}
            onValueChange={(value) => {
              updateLayer(selectedLayer.id, (p) =>
                p.type === "shape" ? { ...p, fillMode: value as ShapeFillMode } : p,
              );
            }}
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
                  updateLayer(selectedLayer.id, (p) => (p.type === "shape" ? { ...p, fillColor: value } : p));
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
                    updateLayer(selectedLayer.id, (p) => (p.type === "shape" ? { ...p, fillColor2: value } : p));
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
              updateLayer(selectedLayer.id, (p) => (p.type === "shape" ? { ...p, fillStop1: value } : p))
            }
            onStop2Change={(value) =>
              updateLayer(selectedLayer.id, (p) => (p.type === "shape" ? { ...p, fillStop2: value } : p))
            }
            onAngleChange={(value) =>
              updateLayer(selectedLayer.id, (p) => (p.type === "shape" ? { ...p, gradientAngle: value } : p))
            }
          />
        )}

        {selectedLayer.fillMode === "image" && (
          <div className="grid gap-2">
            <Button type="button" variant="outline" onClick={() => shapeImageFileRef.current?.click()}>
              <Upload className="h-4 w-4" />
              <span>Selecionar imagem</span>
            </Button>
            <input
              ref={shapeImageFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void setShapeFillImage(selectedLayer.id, file);
                e.currentTarget.value = "";
              }}
            />
            {!selectedLayer.imageSrc && <div className="text-xs text-muted-foreground">Nenhuma imagem selecionada.</div>}
            <div className="grid gap-2">
              <Label>Ajuste</Label>
              <Select
                value={selectedLayer.imageFit}
                onValueChange={(value) => {
                  updateLayer(selectedLayer.id, (p) =>
                    p.type === "shape" ? { ...p, imageFit: value as ShapeImageFit } : p,
                  );
                }}
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
    </>
  );
}
