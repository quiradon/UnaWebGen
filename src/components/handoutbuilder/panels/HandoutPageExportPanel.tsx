import { Download, RotateCcw, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ColorPicker } from "@/components/handoutbuilder/controls/ColorPicker";
import type { HandoutCanvasDocV1 } from "@/components/handoutbuilder/handoutCanvasTypes";
import {
  COLOR_SUGGESTIONS,
  PAGE_SIZE_MAX,
  PAGE_SIZE_MIN,
  ZOOM_MAX,
  ZOOM_MIN,
} from "@/components/handoutbuilder/handoutCanvasConfig";
import { clamp } from "@/components/handoutbuilder/handoutCanvasUtils";

type HandoutPageExportPanelProps = {
  // Props para página
  doc: HandoutCanvasDocV1;
  setDoc: React.Dispatch<React.SetStateAction<HandoutCanvasDocV1>>;
  recordColor: (value: string) => void;
  colorHistory: string[];
  snapEnabled: boolean;
  setSnapEnabled: (value: boolean) => void;
  snapTolerance: number;
  setSnapTolerance: (value: number) => void;
  // Props para exportar
  exportPng: () => Promise<void> | void;
  exportJson: () => void;
  importJsonFile: (file: File) => Promise<void> | void;
  resetAll: () => void;
  jsonFileRef: React.RefObject<HTMLInputElement>;
};

export function HandoutPageExportPanel(props: HandoutPageExportPanelProps) {
  const {
    // Página
    doc,
    setDoc,
    recordColor,
    colorHistory,
    snapEnabled,
    setSnapEnabled,
    snapTolerance,
    setSnapTolerance,
    // Exportar
    exportPng,
    exportJson,
    importJsonFile,
    resetAll,
    jsonFileRef,
  } = props;

  return (
    <div className="space-y-6">
      {/* Seção de Página */}
      <div className="handout-panel-section">
        <div className="handout-panel-title">Página</div>
        <div className="handout-panel-card">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="page-width">Largura (px)</Label>
              <Input
                id="page-width"
                type="number"
                min={PAGE_SIZE_MIN}
                max={PAGE_SIZE_MAX}
                step={1}
                value={doc.pageWidth}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (!Number.isFinite(value)) return;
                  setDoc((p) => ({
                    ...p,
                    pageWidth: clamp(value, PAGE_SIZE_MIN, PAGE_SIZE_MAX),
                  }));
                }}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="page-height">Altura (px)</Label>
              <Input
                id="page-height"
                type="number"
                min={PAGE_SIZE_MIN}
                max={PAGE_SIZE_MAX}
                step={1}
                value={doc.pageHeight}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (!Number.isFinite(value)) return;
                  setDoc((p) => ({
                    ...p,
                    pageHeight: clamp(value, PAGE_SIZE_MIN, PAGE_SIZE_MAX),
                  }));
                }}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="canvas-zoom">Zoom ({Math.round(doc.zoom * 100)}%)</Label>
            <input
              id="canvas-zoom"
              type="range"
              min={ZOOM_MIN}
              max={ZOOM_MAX}
              step={0.05}
              value={doc.zoom}
              onChange={(e) => setDoc((p) => ({ ...p, zoom: clamp(Number(e.target.value), ZOOM_MIN, ZOOM_MAX) }))}
              className="handout-range"
            />
          </div>

          <div className="grid gap-2">
            <Label>Cor do papel</Label>
            <ColorPicker
              value={doc.paperColor}
              onValueChange={(value) => {
                setDoc((p) => ({ ...p, paperColor: value }));
                recordColor(value);
              }}
              suggestions={COLOR_SUGGESTIONS}
              history={colorHistory}
              ariaLabel="Cor do papel"
              className="handout-color-inline"
            />
          </div>
        </div>

        <div className="handout-panel-card">
          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="grid gap-0.5">
                <div className="text-sm font-medium">Snapping</div>
                <div className="text-xs text-muted-foreground">Guias de alinhamento</div>
              </div>
              <Switch checked={snapEnabled} onCheckedChange={(checked) => setSnapEnabled(checked)} />
            </div>
            <div className="grid gap-2">
              <Label>Tolerância (px)</Label>
              <Input
                type="number"
                min={2}
                max={30}
                value={snapTolerance}
                onChange={(event) => setSnapTolerance(clamp(Number(event.target.value), 2, 30))}
                disabled={!snapEnabled}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Exportar */}
      <div className="handout-panel-section">
        <div className="handout-panel-title">Exportar</div>
        <div className="grid gap-3">
          <Button type="button" onClick={() => void exportPng()} className="gap-2">
            <Download className="h-4 w-4" />
            Baixar PNG
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" onClick={exportJson} className="gap-2">
              <Download className="h-4 w-4" />
              JSON
            </Button>
            <Button type="button" variant="outline" onClick={() => jsonFileRef.current?.click()} className="gap-2">
              <Upload className="h-4 w-4" />
              Importar
            </Button>
            <input
              ref={jsonFileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void importJsonFile(file);
                e.currentTarget.value = "";
              }}
            />
          </div>

          <Button type="button" variant="outline" onClick={resetAll} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Resetar
          </Button>
        </div>
      </div>
    </div>
  );
}