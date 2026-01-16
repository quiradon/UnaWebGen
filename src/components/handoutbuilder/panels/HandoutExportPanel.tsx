import { Download, RotateCcw, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";

type HandoutExportPanelProps = {
  exportPng: () => Promise<void> | void;
  exportJson: () => void;
  importJsonFile: (file: File) => Promise<void> | void;
  resetAll: () => void;
  jsonFileRef: React.RefObject<HTMLInputElement>;
};

export function HandoutExportPanel(props: HandoutExportPanelProps) {
  const { exportPng, exportJson, importJsonFile, resetAll, jsonFileRef } = props;

  return (
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
  );
}
