import { Button } from "@/components/ui/button";
import type { Layer, ShapeLayer, TextLayer } from "@/components/handoutbuilder/handoutCanvasTypes";
import { HandoutPropsClipping } from "@/components/handoutbuilder/panels/props/HandoutPropsClipping";
import { HandoutPropsShape } from "@/components/handoutbuilder/panels/props/HandoutPropsShape";
import { HandoutPropsText } from "@/components/handoutbuilder/panels/props/HandoutPropsText";

type HandoutPropsPanelProps = {
  selectedLayer: Layer | null;
  selectedIds: string[];
  docLayers: Layer[];
  groupSelectedLayers: (ids: string[]) => void;
  ungroupSelectedLayers: (ids: string[]) => void;
  selectGroupById: (groupId: string | null) => void;
  updateLayer: (id: string, updater: (prev: Layer) => Layer) => void;
  recordColor: (value: string) => void;
  colorHistory: string[];
  shapeImageFileRef: React.RefObject<HTMLInputElement>;
  textImageFileRef: React.RefObject<HTMLInputElement>;
  setShapeFillImage: (id: string, file: File) => void | Promise<void>;
  setTextFillImage: (id: string, file: File) => void | Promise<void>;
};

export function HandoutPropsPanel(props: HandoutPropsPanelProps) {
  const {
    selectedLayer,
    selectedIds,
    docLayers,
    groupSelectedLayers,
    ungroupSelectedLayers,
    selectGroupById,
    updateLayer,
    recordColor,
    colorHistory,
    shapeImageFileRef,
    textImageFileRef,
    setShapeFillImage,
    setTextFillImage,
  } = props;

  return (
    <div className="handout-panel-section">
      <div className="handout-panel-title">Propriedades</div>
      <div className="grid gap-4">
        {!selectedLayer && <div className="text-sm text-muted-foreground">Selecione uma camada para editar.</div>}

        {selectedLayer && (
          <>
            {selectedIds.length > 1 && (
              <div className="grid gap-3 rounded-md border border-input p-3">
                <div className="text-sm font-medium">Selecao</div>
                <div className="text-xs text-muted-foreground">{selectedIds.length} camadas selecionadas</div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => groupSelectedLayers(selectedIds)}>
                    Agrupar
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => ungroupSelectedLayers(selectedIds)}>
                    Desagrupar
                  </Button>
                </div>
              </div>
            )}

            {selectedIds.length === 1 && selectedLayer.groupId && (
              <div className="grid gap-3 rounded-md border border-input p-3">
                <div className="text-sm font-medium">Grupo</div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => selectGroupById(selectedLayer.groupId)}
                  >
                    Selecionar grupo
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => ungroupSelectedLayers([selectedLayer.id])}
                  >
                    Desagrupar
                  </Button>
                </div>
              </div>
            )}

            <HandoutPropsClipping selectedLayer={selectedLayer} docLayers={docLayers} updateLayer={updateLayer} />

            {selectedLayer.type === "shape" && (
              <HandoutPropsShape
                selectedLayer={selectedLayer as ShapeLayer}
                updateLayer={updateLayer}
                recordColor={recordColor}
                colorHistory={colorHistory}
                shapeImageFileRef={shapeImageFileRef}
                setShapeFillImage={setShapeFillImage}
              />
            )}

            {selectedLayer.type === "text" && (
              <HandoutPropsText
                selectedLayer={selectedLayer as TextLayer}
                updateLayer={updateLayer}
                recordColor={recordColor}
                colorHistory={colorHistory}
                textImageFileRef={textImageFileRef}
                setTextFillImage={setTextFillImage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
