import { ColorPicker } from "@/components/handoutbuilder/controls/ColorPicker";
import type { Layer, LayerEffects } from "@/components/handoutbuilder/handoutCanvasTypes";
import {
  COLOR_SUGGESTIONS,
  EFFECT_BLUR_MAX,
  EFFECT_BLUR_MIN,
  EFFECT_FILTER_MAX,
  EFFECT_FILTER_MIN,
  EFFECT_SHADOW_BLUR_MAX,
  EFFECT_SHADOW_BLUR_MIN,
  EFFECT_SHADOW_OFFSET_MAX,
  EFFECT_SHADOW_OFFSET_MIN,
  EFFECT_SHADOW_SPREAD_MAX,
  EFFECT_SHADOW_SPREAD_MIN,
} from "@/components/handoutbuilder/handoutCanvasConfig";
import { clamp } from "@/components/handoutbuilder/handoutCanvasUtils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type HandoutEffectsPanelProps = {
  selectedLayer: Layer | null;
  updateShadowEffect: (
    id: string,
    key: "dropShadow" | "innerShadow",
    updater: (prev: LayerEffects["dropShadow"]) => LayerEffects["dropShadow"],
  ) => void;
  updateLayerEffects: (id: string, updater: (prev: LayerEffects) => LayerEffects) => void;
  recordColor: (value: string) => void;
  colorHistory: string[];
  dropShadowOpacityPercent: number;
  innerShadowOpacityPercent: number;
};

export function HandoutEffectsPanel(props: HandoutEffectsPanelProps) {
  const {
    selectedLayer,
    updateShadowEffect,
    updateLayerEffects,
    recordColor,
    colorHistory,
    dropShadowOpacityPercent,
    innerShadowOpacityPercent,
  } = props;

  return (
    <div className="handout-panel-section">
      <div className="handout-panel-title">Efeitos</div>
      <div className="handout-effects-panel grid gap-4">
        {!selectedLayer && <div className="text-sm text-muted-foreground">Selecione uma camada para editar.</div>}

        {selectedLayer && (
          <>
            <div
              className="handout-effects-card grid gap-3 rounded-md border border-input p-3"
              data-active={selectedLayer.effects.dropShadow.enabled ? "true" : "false"}
            >
              <div className="handout-effects-card-head flex items-center justify-between gap-3">
                <div className="grid gap-0.5">
                  <div className="handout-effects-card-title text-sm font-medium">Sombra externa</div>
                  <div className="handout-effects-card-subtitle text-xs text-muted-foreground">Drop shadow</div>
                </div>
                <Switch
                  checked={selectedLayer.effects.dropShadow.enabled}
                  onCheckedChange={(checked) =>
                    updateShadowEffect(selectedLayer.id, "dropShadow", (p) => ({ ...p, enabled: checked }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Offset X</Label>
                  <Input
                    type="number"
                    min={EFFECT_SHADOW_OFFSET_MIN}
                    max={EFFECT_SHADOW_OFFSET_MAX}
                    value={selectedLayer.effects.dropShadow.x}
                    onChange={(e) => {
                      const value = clamp(Number(e.target.value), EFFECT_SHADOW_OFFSET_MIN, EFFECT_SHADOW_OFFSET_MAX);
                      updateShadowEffect(selectedLayer.id, "dropShadow", (p) => ({ ...p, x: value }));
                    }}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Offset Y</Label>
                  <Input
                    type="number"
                    min={EFFECT_SHADOW_OFFSET_MIN}
                    max={EFFECT_SHADOW_OFFSET_MAX}
                    value={selectedLayer.effects.dropShadow.y}
                    onChange={(e) => {
                      const value = clamp(Number(e.target.value), EFFECT_SHADOW_OFFSET_MIN, EFFECT_SHADOW_OFFSET_MAX);
                      updateShadowEffect(selectedLayer.id, "dropShadow", (p) => ({ ...p, y: value }));
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Blur</Label>
                  <Input
                    type="number"
                    min={EFFECT_SHADOW_BLUR_MIN}
                    max={EFFECT_SHADOW_BLUR_MAX}
                    value={selectedLayer.effects.dropShadow.blur}
                    onChange={(e) => {
                      const value = clamp(Number(e.target.value), EFFECT_SHADOW_BLUR_MIN, EFFECT_SHADOW_BLUR_MAX);
                      updateShadowEffect(selectedLayer.id, "dropShadow", (p) => ({ ...p, blur: value }));
                    }}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Spread</Label>
                  <Input
                    type="number"
                    min={EFFECT_SHADOW_SPREAD_MIN}
                    max={EFFECT_SHADOW_SPREAD_MAX}
                    value={selectedLayer.effects.dropShadow.spread}
                    onChange={(e) => {
                      const value = clamp(Number(e.target.value), EFFECT_SHADOW_SPREAD_MIN, EFFECT_SHADOW_SPREAD_MAX);
                      updateShadowEffect(selectedLayer.id, "dropShadow", (p) => ({ ...p, spread: value }));
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Cor</Label>
                  <ColorPicker
                    value={selectedLayer.effects.dropShadow.color}
                    onValueChange={(value) => {
                      updateShadowEffect(selectedLayer.id, "dropShadow", (p) => ({ ...p, color: value }));
                      recordColor(value);
                    }}
                    suggestions={COLOR_SUGGESTIONS}
                    history={colorHistory}
                    ariaLabel="Cor da sombra externa"
                    className="handout-color-inline"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Opacidade</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={dropShadowOpacityPercent}
                    onChange={(e) => {
                      const value = clamp(Number(e.target.value), 0, 100);
                      updateShadowEffect(selectedLayer.id, "dropShadow", (p) => ({ ...p, opacity: value / 100 }));
                    }}
                    className="handout-opacity-input"
                  />
                </div>
              </div>
            </div>

            <div
              className="handout-effects-card grid gap-3 rounded-md border border-input p-3"
              data-active={selectedLayer.effects.innerShadow.enabled ? "true" : "false"}
            >
              <div className="handout-effects-card-head flex items-center justify-between gap-3">
                <div className="grid gap-0.5">
                  <div className="handout-effects-card-title text-sm font-medium">Sombra interna</div>
                  <div className="handout-effects-card-subtitle text-xs text-muted-foreground">Inner shadow</div>
                </div>
                <Switch
                  checked={selectedLayer.effects.innerShadow.enabled}
                  onCheckedChange={(checked) =>
                    updateShadowEffect(selectedLayer.id, "innerShadow", (p) => ({ ...p, enabled: checked }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Offset X</Label>
                  <Input
                    type="number"
                    min={EFFECT_SHADOW_OFFSET_MIN}
                    max={EFFECT_SHADOW_OFFSET_MAX}
                    value={selectedLayer.effects.innerShadow.x}
                    onChange={(e) => {
                      const value = clamp(Number(e.target.value), EFFECT_SHADOW_OFFSET_MIN, EFFECT_SHADOW_OFFSET_MAX);
                      updateShadowEffect(selectedLayer.id, "innerShadow", (p) => ({ ...p, x: value }));
                    }}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Offset Y</Label>
                  <Input
                    type="number"
                    min={EFFECT_SHADOW_OFFSET_MIN}
                    max={EFFECT_SHADOW_OFFSET_MAX}
                    value={selectedLayer.effects.innerShadow.y}
                    onChange={(e) => {
                      const value = clamp(Number(e.target.value), EFFECT_SHADOW_OFFSET_MIN, EFFECT_SHADOW_OFFSET_MAX);
                      updateShadowEffect(selectedLayer.id, "innerShadow", (p) => ({ ...p, y: value }));
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Blur</Label>
                  <Input
                    type="number"
                    min={EFFECT_SHADOW_BLUR_MIN}
                    max={EFFECT_SHADOW_BLUR_MAX}
                    value={selectedLayer.effects.innerShadow.blur}
                    onChange={(e) => {
                      const value = clamp(Number(e.target.value), EFFECT_SHADOW_BLUR_MIN, EFFECT_SHADOW_BLUR_MAX);
                      updateShadowEffect(selectedLayer.id, "innerShadow", (p) => ({ ...p, blur: value }));
                    }}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Spread</Label>
                  <Input
                    type="number"
                    min={EFFECT_SHADOW_SPREAD_MIN}
                    max={EFFECT_SHADOW_SPREAD_MAX}
                    value={selectedLayer.effects.innerShadow.spread}
                    onChange={(e) => {
                      const value = clamp(Number(e.target.value), EFFECT_SHADOW_SPREAD_MIN, EFFECT_SHADOW_SPREAD_MAX);
                      updateShadowEffect(selectedLayer.id, "innerShadow", (p) => ({ ...p, spread: value }));
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Cor</Label>
                  <ColorPicker
                    value={selectedLayer.effects.innerShadow.color}
                    onValueChange={(value) => {
                      updateShadowEffect(selectedLayer.id, "innerShadow", (p) => ({ ...p, color: value }));
                      recordColor(value);
                    }}
                    suggestions={COLOR_SUGGESTIONS}
                    history={colorHistory}
                    ariaLabel="Cor da sombra interna"
                    className="handout-color-inline"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Opacidade</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={innerShadowOpacityPercent}
                    onChange={(e) => {
                      const value = clamp(Number(e.target.value), 0, 100);
                      updateShadowEffect(selectedLayer.id, "innerShadow", (p) => ({ ...p, opacity: value / 100 }));
                    }}
                    className="handout-opacity-input"
                  />
                </div>
              </div>
            </div>

            <div
              className="handout-effects-card grid gap-3 rounded-md border border-input p-3"
              data-active={selectedLayer.effects.blur > 0 ? "true" : "false"}
            >
              <div className="handout-effects-card-title text-sm font-medium">Desfoque</div>
              <div className="grid gap-2">
                <Label>Intensidade (px)</Label>
                <Input
                  type="number"
                  min={EFFECT_BLUR_MIN}
                  max={EFFECT_BLUR_MAX}
                  value={selectedLayer.effects.blur}
                  onChange={(e) => {
                    const value = clamp(Number(e.target.value), EFFECT_BLUR_MIN, EFFECT_BLUR_MAX);
                    updateLayerEffects(selectedLayer.id, (p) => ({ ...p, blur: value }));
                  }}
                  className="handout-opacity-input"
                />
              </div>
            </div>

            <div
              className="handout-effects-card grid gap-3 rounded-md border border-input p-3"
              data-active={
                selectedLayer.effects.brightness !== 100 ||
                selectedLayer.effects.contrast !== 100 ||
                selectedLayer.effects.saturate !== 100
                  ? "true"
                  : "false"
              }
            >
              <div className="handout-effects-card-title text-sm font-medium">Filtros</div>

              <div className="grid gap-2">
                <Label>Brilho (%)</Label>
                <Input
                  type="number"
                  min={EFFECT_FILTER_MIN}
                  max={EFFECT_FILTER_MAX}
                  value={selectedLayer.effects.brightness}
                  onChange={(e) => {
                    const value = clamp(Number(e.target.value), EFFECT_FILTER_MIN, EFFECT_FILTER_MAX);
                    updateLayerEffects(selectedLayer.id, (p) => ({ ...p, brightness: value }));
                  }}
                  className="handout-opacity-input"
                />
              </div>

              <div className="grid gap-2">
                <Label>Contraste (%)</Label>
                <Input
                  type="number"
                  min={EFFECT_FILTER_MIN}
                  max={EFFECT_FILTER_MAX}
                  value={selectedLayer.effects.contrast}
                  onChange={(e) => {
                    const value = clamp(Number(e.target.value), EFFECT_FILTER_MIN, EFFECT_FILTER_MAX);
                    updateLayerEffects(selectedLayer.id, (p) => ({ ...p, contrast: value }));
                  }}
                  className="handout-opacity-input"
                />
              </div>

              <div className="grid gap-2">
                <Label>Saturacao (%)</Label>
                <Input
                  type="number"
                  min={EFFECT_FILTER_MIN}
                  max={EFFECT_FILTER_MAX}
                  value={selectedLayer.effects.saturate}
                  onChange={(e) => {
                    const value = clamp(Number(e.target.value), EFFECT_FILTER_MIN, EFFECT_FILTER_MAX);
                    updateLayerEffects(selectedLayer.id, (p) => ({ ...p, saturate: value }));
                  }}
                  className="handout-opacity-input"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
