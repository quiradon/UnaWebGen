import { FONT_PRESETS } from "@/components/handoutbuilder/handoutCanvasOptions";
import type { Layer, TextLayer } from "@/components/handoutbuilder/handoutCanvasTypes";
import { getTextFillStyle } from "@/components/handoutbuilder/handoutCanvasEffects";
import { renderInnerShadowFilter } from "@/components/handoutbuilder/handoutCanvasShapes";

type HandoutCanvasTextLayerProps = {
  layer: TextLayer;
  isEditing: boolean;
  textEditorRef: React.RefObject<HTMLTextAreaElement>;
  textEffectStyle: { filter: string } | null;
  showTextInnerShadow: boolean;
  innerShadowId: string | null;
  updateLayer: (id: string, updater: (prev: Layer) => Layer) => void;
  finishTextEditing: () => void;
  cancelTextEditing: () => void;
};

export function HandoutCanvasTextLayer(props: HandoutCanvasTextLayerProps) {
  const {
    layer,
    isEditing,
    textEditorRef,
    textEffectStyle,
    showTextInnerShadow,
    innerShadowId,
    updateLayer,
    finishTextEditing,
    cancelTextEditing,
  } = props;

  const textStyle = {
    fontSize: `${layer.fontSize}px`,
    color: layer.fillColor || layer.color,
    textAlign: layer.align,
    fontFamily: FONT_PRESETS[layer.fontPreset].stack,
    fontWeight: layer.fontWeight,
    fontStyle: layer.italic ? "italic" : "normal",
    textDecoration: layer.underline ? "underline" : "none",
    backgroundColor: layer.backgroundColor,
    padding: `${layer.padding}px`,
    lineHeight: layer.lineHeight,
    letterSpacing: `${layer.letterSpacing}px`,
    whiteSpace: "pre-wrap",
  } as React.CSSProperties;
  const textFillStyle = getTextFillStyle(layer);
  const textDisplayStyle = textEffectStyle ? ({ ...textStyle, ...textEffectStyle } as React.CSSProperties) : textStyle;

  if (isEditing) {
    return (
      <textarea
        ref={textEditorRef}
        value={layer.text}
        onChange={(e) => updateLayer(layer.id, (p) => (p.type === "text" ? { ...p, text: e.target.value } : p))}
        onBlur={finishTextEditing}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            cancelTextEditing();
          }
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className="handout-layer-text-editor"
        style={textStyle}
      />
    );
  }

  return (
    <>
      {showTextInnerShadow && innerShadowId ? renderInnerShadowFilter(innerShadowId, layer.effects.innerShadow) : null}
      <div className="handout-layer-text-wrap">
        <div className="handout-layer-text" style={textDisplayStyle}>
          <span className="handout-layer-text-fill" style={textFillStyle}>
            {layer.text}
          </span>
        </div>
        {showTextInnerShadow && innerShadowId ? (
          <div
            className="handout-layer-text handout-layer-text-shadow"
            style={{
              ...textStyle,
              backgroundColor: "transparent",
              filter: `url(#${innerShadowId})`,
            }}
          >
            <span className="handout-layer-text-fill" style={textFillStyle}>
              {layer.text}
            </span>
          </div>
        ) : null}
      </div>
    </>
  );
}
