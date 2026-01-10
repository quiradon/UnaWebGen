import { Switch } from "@/components/ui/switch";
import type { ImageLayer, Layer } from "@/components/handoutbuilder/handoutCanvasTypes";

type HandoutPropsImageProps = {
  selectedLayer: ImageLayer;
  updateLayer: (id: string, updater: (prev: Layer) => Layer) => void;
};

export function HandoutPropsImage({ selectedLayer, updateLayer }: HandoutPropsImageProps) {
  return (
    <div className="grid gap-3 rounded-md border border-input p-3">
      <div className="text-sm font-medium">Imagem</div>

      <div className="flex items-center justify-between gap-3 rounded-md border border-input px-3 py-2">
        <div className="grid gap-0.5">
          <div className="text-sm font-medium">Manter proporÇõÇœo</div>
          <div className="text-xs text-muted-foreground">Ao redimensionar</div>
        </div>
        <Switch
          checked={selectedLayer.keepAspectRatio}
          onCheckedChange={(checked) =>
            updateLayer(selectedLayer.id, (p) => (p.type === "image" ? { ...p, keepAspectRatio: checked } : p))
          }
        />
      </div>
    </div>
  );
}
