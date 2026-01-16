import { Button } from "@/components/ui/button";
import type { AssetItem, CSSVars, HandoutTemplateEntry } from "@/components/handoutbuilder/handoutCanvasTypes";

type HandoutCanvasModalsProps = {
  pendingTemplateOption: HandoutTemplateEntry | null;
  pendingTemplatePrimaryText: string[];
  pendingTemplateVars: CSSVars;
  confirmTemplateChange: () => void;
  cancelTemplateChange: () => void;
  pendingAsset: AssetItem | null;
  assetPreviewVars: CSSVars;
  confirmAssetImport: () => void;
  cancelAssetImport: () => void;
};

export function HandoutCanvasModals(props: HandoutCanvasModalsProps) {
  const {
    pendingTemplateOption,
    pendingTemplatePrimaryText,
    pendingTemplateVars,
    confirmTemplateChange,
    cancelTemplateChange,
    pendingAsset,
    assetPreviewVars,
    confirmAssetImport,
    cancelAssetImport,
  } = props;

  return (
    <>
      {pendingTemplateOption && (
        <div
          className="handout-template-confirm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="handout-template-confirm-title"
        >
          <div className="handout-template-confirm-backdrop" onMouseDown={cancelTemplateChange} />
          <div
            className="handout-template-confirm-card"
            role="document"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="handout-template-confirm-header">
              <span className="handout-template-confirm-eyebrow">Confirmar template</span>
              <h3 id="handout-template-confirm-title" className="handout-template-confirm-title">
                Aplicar "{pendingTemplateOption.label}"?
              </h3>
              <p className="handout-template-confirm-text">
                Isso substitui a pagina inteira, incluindo textos e elementos. O documento atual sera perdido.
              </p>
            </div>
            <div className="handout-template-confirm-preview is-single">
              <div className="handout-template-confirm-block">
                <span className="handout-template-confirm-label">Preview</span>
                <div className="handout-template-preview is-large">
                  <div
                    className={`handout-template-preview-surface ${pendingTemplateOption.doc.template === "none" ? "is-base" : ""} ${pendingTemplateOption.doc.template === "none" ? "" : `handout-template-${pendingTemplateOption.doc.template}`}`}
                    style={pendingTemplateVars}
                  >
                    <div className="handout-template-preview-text">
                      {pendingTemplatePrimaryText.map((line, index) => (
                        <span key={`pending-${index}`}>{line}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <span className="handout-template-confirm-caption">{pendingTemplateOption.label}</span>
              </div>
            </div>
            <div className="handout-template-confirm-actions">
              <Button type="button" variant="outline" onClick={cancelTemplateChange}>
                Cancelar
              </Button>
              <Button type="button" onClick={confirmTemplateChange}>
                Aplicar template
              </Button>
            </div>
          </div>
        </div>
      )}
      {pendingAsset && (
        <div
          className="handout-template-confirm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="handout-asset-confirm-title"
        >
          <div className="handout-template-confirm-backdrop" onMouseDown={cancelAssetImport} />
          <div
            className="handout-template-confirm-card"
            role="document"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="handout-template-confirm-header">
              <span className="handout-template-confirm-eyebrow">Confirmar asset</span>
              <h3 id="handout-asset-confirm-title" className="handout-template-confirm-title">
                Importar "{pendingAsset.name}"?
              </h3>
              <p className="handout-template-confirm-text">
                Esse asset sera adicionado ao canvas como uma nova camada.
              </p>
            </div>
            <div className="handout-template-confirm-preview is-single">
              <div className="handout-template-confirm-block">
                <span className="handout-template-confirm-label">Preview</span>
                <div className="handout-template-preview is-large">
                  <div className="handout-template-preview-surface is-asset" style={assetPreviewVars}>
                    <img src={pendingAsset.src} alt={pendingAsset.name} />
                  </div>
                </div>
                <span className="handout-template-confirm-caption">
                  {pendingAsset.premium ? "Premium" : "Asset"}
                </span>
              </div>
            </div>
            <div className="handout-template-confirm-actions">
              <Button type="button" variant="outline" onClick={cancelAssetImport}>
                Cancelar
              </Button>
              <Button type="button" onClick={confirmAssetImport}>
                Importar asset
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
