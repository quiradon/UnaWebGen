import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Layer } from "@/components/handoutbuilder/handoutCanvasTypes";

type HandoutPropsClippingProps = {
  selectedLayer: Layer;
  docLayers: Layer[];
  updateLayer: (id: string, updater: (prev: Layer) => Layer) => void;
};

export function HandoutPropsClipping({ selectedLayer, docLayers, updateLayer }: HandoutPropsClippingProps) {
  return (
    <div className="grid gap-3 rounded-md border border-input p-3">
      <div className="text-sm font-medium">Clipping</div>
      <div className="grid gap-2">
        <Label>Usar mascara</Label>
        <Select
          value={selectedLayer.clipToId ?? "none"}
          onValueChange={(value) =>
            updateLayer(selectedLayer.id, (p) => ({
              ...p,
              clipToId: value === "none" ? null : value,
            }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem mascara</SelectItem>
            {docLayers
              .filter(
                (layer) =>
                  layer.id !== selectedLayer.id && (layer.type === "shape" || layer.type === "text"),
              )
              .map((layer) => (
                <SelectItem key={layer.id} value={layer.id}>
                  {layer.name || layer.id}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
