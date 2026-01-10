import type { HandoutCanvasDocV1, HandoutTemplateEntry } from "@/components/handoutbuilder/handoutCanvasTypes";
import { TEMPLATE_PREVIEW_MAX } from "@/components/handoutbuilder/handoutCanvasConfig";
import { getTemplatePreviewLines, getTemplatePreviewStyle } from "@/components/handoutbuilder/handoutCanvasTemplates";

type HandoutTemplatesPanelProps = {
  templateLibrary: HandoutTemplateEntry[];
  activeTemplateId: HandoutCanvasDocV1["templateId"];
  requestTemplateChange: (id: string) => void;
};

export function HandoutTemplatesPanel(props: HandoutTemplatesPanelProps) {
  const { templateLibrary, activeTemplateId, requestTemplateChange } = props;

  return (
    <div className="handout-panel-section">
      <div className="handout-panel-title">Templates</div>
      <div className="handout-template-grid">
        {templateLibrary.map((template) => {
          const isActive = activeTemplateId === template.id;
          const previewLines = getTemplatePreviewLines(template.doc, 3);
          const previewText = previewLines.length ? previewLines : ["Sem texto"];
          const isBase = template.doc.template === "none";
          const themeClass = isBase ? "" : `handout-template-${template.doc.template}`;
          const templateStyle = getTemplatePreviewStyle(template.doc, TEMPLATE_PREVIEW_MAX);

          return (
            <button
              key={template.id}
              type="button"
              className={`handout-template-card ${isActive ? "is-active" : ""}`}
              onClick={() => requestTemplateChange(template.id)}
              aria-pressed={isActive}
            >
              <div className="handout-template-preview">
                <div
                  className={`handout-template-preview-surface ${isBase ? "is-base" : ""} ${themeClass}`}
                  style={templateStyle}
                >
                  <div className="handout-template-preview-text">
                    {previewText.map((line, index) => (
                      <span key={`${template.id}-${index}`}>{line}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="handout-template-meta">
                <span className="handout-template-name">{template.label}</span>
                <span className="handout-template-desc">{template.description}</span>
              </div>
            </button>
          );
        })}
      </div>
      <div className="handout-panel-hint">
        Templates substituem a pagina inteira. Clique para previsualizar e confirmar antes de aplicar.
      </div>
    </div>
  );
}
