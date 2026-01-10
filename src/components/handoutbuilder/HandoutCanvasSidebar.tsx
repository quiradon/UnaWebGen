import { Download, FileText, Image as ImageIcon, LayoutGrid, SlidersHorizontal, Sparkles, Type } from "lucide-react";

import { HandoutAssetsPanel } from "@/components/handoutbuilder/panels/HandoutAssetsPanel";
import { HandoutElementsPanel } from "@/components/handoutbuilder/panels/HandoutElementsPanel";
import { HandoutEffectsPanel } from "@/components/handoutbuilder/panels/HandoutEffectsPanel";
import { HandoutExportPanel } from "@/components/handoutbuilder/panels/HandoutExportPanel";
import { HandoutPagePanel } from "@/components/handoutbuilder/panels/HandoutPagePanel";
import { HandoutPropsPanel } from "@/components/handoutbuilder/panels/props/HandoutPropsPanel";
import { HandoutTemplatesPanel } from "@/components/handoutbuilder/panels/HandoutTemplatesPanel";

type SidebarTab = "elements" | "assets" | "templates" | "page" | "props" | "effects" | "export";

type HandoutCanvasSidebarProps = {
  sidebarRef: React.RefObject<HTMLDivElement>;
  sidebarTab: SidebarTab;
  setSidebarTab: (tab: SidebarTab) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  elementsProps: React.ComponentProps<typeof HandoutElementsPanel>;
  assetsProps: React.ComponentProps<typeof HandoutAssetsPanel>;
  templatesProps: React.ComponentProps<typeof HandoutTemplatesPanel>;
  pageProps: React.ComponentProps<typeof HandoutPagePanel>;
  propsProps: React.ComponentProps<typeof HandoutPropsPanel>;
  effectsProps: React.ComponentProps<typeof HandoutEffectsPanel>;
  exportProps: React.ComponentProps<typeof HandoutExportPanel>;
};

export function HandoutCanvasSidebar(props: HandoutCanvasSidebarProps) {
  const {
    sidebarRef,
    sidebarTab,
    setSidebarTab,
    sidebarCollapsed,
    setSidebarCollapsed,
    elementsProps,
    assetsProps,
    templatesProps,
    pageProps,
    propsProps,
    effectsProps,
    exportProps,
  } = props;

  return (
    <aside
      ref={sidebarRef}
      className={`handout-builder-sidebar handout-canvas-sidebar ${sidebarCollapsed ? "is-collapsed" : ""}`}
    >
      <div className="handout-sidebar-actions">
        <button
          type="button"
          className={`handout-sidebar-action ${sidebarTab === "elements" ? "is-active" : ""}`}
          onClick={() => {
            setSidebarTab("elements");
            setSidebarCollapsed(false);
          }}
          aria-pressed={sidebarTab === "elements"}
        >
          <Type className="h-5 w-5" />
          <span>Elementos</span>
        </button>
        <button
          type="button"
          className={`handout-sidebar-action ${sidebarTab === "assets" ? "is-active" : ""}`}
          onClick={() => {
            setSidebarTab("assets");
            setSidebarCollapsed(false);
          }}
          aria-pressed={sidebarTab === "assets"}
        >
          <ImageIcon className="h-5 w-5" />
          <span>Assets</span>
        </button>
        <button
          type="button"
          className={`handout-sidebar-action ${sidebarTab === "templates" ? "is-active" : ""}`}
          onClick={() => {
            setSidebarTab("templates");
            setSidebarCollapsed(false);
          }}
          aria-pressed={sidebarTab === "templates"}
        >
          <FileText className="h-5 w-5" />
          <span>Templates</span>
        </button>
        <button
          type="button"
          className={`handout-sidebar-action ${sidebarTab === "page" ? "is-active" : ""}`}
          onClick={() => {
            setSidebarTab("page");
            setSidebarCollapsed(false);
          }}
          aria-pressed={sidebarTab === "page"}
        >
          <LayoutGrid className="h-5 w-5" />
          <span>Pagina</span>
        </button>
        <button
          type="button"
          className={`handout-sidebar-action ${sidebarTab === "props" ? "is-active" : ""}`}
          onClick={() => {
            setSidebarTab("props");
            setSidebarCollapsed(false);
          }}
          aria-pressed={sidebarTab === "props"}
        >
          <SlidersHorizontal className="h-5 w-5" />
          <span>Props</span>
        </button>
        <button
          type="button"
          className={`handout-sidebar-action ${sidebarTab === "effects" ? "is-active" : ""}`}
          onClick={() => {
            setSidebarTab("effects");
            setSidebarCollapsed(false);
          }}
          aria-pressed={sidebarTab === "effects"}
        >
          <Sparkles className="h-5 w-5" />
          <span>Efeitos</span>
        </button>
        <button
          type="button"
          className={`handout-sidebar-action ${sidebarTab === "export" ? "is-active" : ""}`}
          onClick={() => {
            setSidebarTab("export");
            setSidebarCollapsed(false);
          }}
          aria-pressed={sidebarTab === "export"}
        >
          <Download className="h-5 w-5" />
          <span>Exportar</span>
        </button>
      </div>

      {!sidebarCollapsed && (
        <div className="handout-sidebar-panel">
          {sidebarTab === "elements" && <HandoutElementsPanel {...elementsProps} />}
          {sidebarTab === "assets" && <HandoutAssetsPanel {...assetsProps} />}
          {sidebarTab === "templates" && <HandoutTemplatesPanel {...templatesProps} />}
          {sidebarTab === "page" && <HandoutPagePanel {...pageProps} />}
          {sidebarTab === "props" && <HandoutPropsPanel {...propsProps} />}
          {sidebarTab === "effects" && <HandoutEffectsPanel {...effectsProps} />}
          {sidebarTab === "export" && <HandoutExportPanel {...exportProps} />}
        </div>
      )}
    </aside>
  );
}
