import { useEffect } from "react";
import { Download, Image as ImageIcon, LayoutGrid, SlidersHorizontal, Sparkles, Type } from "lucide-react";

import { HandoutAssetsPanel } from "@/components/handoutbuilder/panels/HandoutAssetsPanel";
import { HandoutElementsPanel } from "@/components/handoutbuilder/panels/HandoutElementsPanel";
import { HandoutEffectsPanel } from "@/components/handoutbuilder/panels/HandoutEffectsPanel";
import { HandoutExportPanel } from "@/components/handoutbuilder/panels/HandoutExportPanel";
import { HandoutPagePanel } from "@/components/handoutbuilder/panels/HandoutPagePanel";
import { HandoutPropsPanel } from "@/components/handoutbuilder/panels/props/HandoutPropsPanel";
type SidebarTab = "elements" | "assets" | "page" | "props" | "effects" | "export";

type HandoutCanvasSidebarProps = {
  sidebarRef: React.RefObject<HTMLDivElement>;
  sidebarTab: SidebarTab;
  setSidebarTab: (tab: SidebarTab) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  elementsProps: React.ComponentProps<typeof HandoutElementsPanel>;
  assetsProps: React.ComponentProps<typeof HandoutAssetsPanel>;
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
    pageProps,
    propsProps,
    effectsProps,
    exportProps,
  } = props;

  const closeAuthDropdown = () => {
    const container = sidebarRef.current;
    if (!container) return;
    const dropdown = container.querySelector<HTMLElement>("[data-auth-dropdown]");
    const toggle = container.querySelector<HTMLElement>("[data-auth-toggle]");
    if (dropdown && !dropdown.hidden) {
      dropdown.hidden = true;
    }
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
    }

    const langList = container.querySelector<HTMLElement>("[data-auth-lang-list]");
    const langToggle = container.querySelector<HTMLElement>("[data-auth-lang-toggle]");
    if (langList && !langList.hidden) {
      langList.hidden = true;
    }
    if (langToggle) {
      langToggle.setAttribute("aria-expanded", "false");
    }
  };

  const handleTabChange = (tab: SidebarTab) => {
    closeAuthDropdown();
    setSidebarTab(tab);
    setSidebarCollapsed(false);
  };

  useEffect(() => {
    const moveAuthWidget = () => {
      const slot = document.querySelector<HTMLElement>("[data-handout-auth-slot]");
      const source = document.querySelector<HTMLElement>("[data-handout-auth-widget]");
      const root = source?.querySelector<HTMLElement>("[data-auth-root]");
      if (!slot || !root) return;
      if (root.parentElement !== slot) {
        slot.appendChild(root);
      }
    };

    moveAuthWidget();
    document.addEventListener("astro:after-swap", moveAuthWidget);

    return () => {
      document.removeEventListener("astro:after-swap", moveAuthWidget);
    };
  }, []);

  useEffect(() => {
    const slot = document.querySelector<HTMLElement>("[data-handout-auth-slot]");
    if (!slot) return;

    const handleAuthToggle = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const toggle = target.closest<HTMLElement>("[data-auth-toggle]");
      if (!toggle) return;
      const dropdown = slot.querySelector<HTMLElement>("[data-auth-dropdown]");
      const willOpen = dropdown ? dropdown.hidden : true;
      if (willOpen && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    };

    slot.addEventListener("click", handleAuthToggle, true);

    return () => {
      slot.removeEventListener("click", handleAuthToggle, true);
    };
  }, [sidebarCollapsed, setSidebarCollapsed]);

  return (
    <aside
      ref={sidebarRef}
      className={`handout-builder-sidebar handout-canvas-sidebar ${sidebarCollapsed ? "is-collapsed" : ""}`}
    >
      <div className="handout-sidebar-actions">
        <button
          type="button"
          className={`handout-sidebar-action ${sidebarTab === "elements" ? "is-active" : ""}`}
          onClick={() => handleTabChange("elements")}
          aria-pressed={sidebarTab === "elements"}
        >
          <Type className="h-5 w-5" />
          <span>Elementos</span>
        </button>
        <button
          type="button"
          className={`handout-sidebar-action ${sidebarTab === "assets" ? "is-active" : ""}`}
          onClick={() => handleTabChange("assets")}
          aria-pressed={sidebarTab === "assets"}
        >
          <ImageIcon className="h-5 w-5" />
          <span>Assets</span>
        </button>
        <button
          type="button"
          className={`handout-sidebar-action ${sidebarTab === "page" ? "is-active" : ""}`}
          onClick={() => handleTabChange("page")}
          aria-pressed={sidebarTab === "page"}
        >
          <LayoutGrid className="h-5 w-5" />
          <span>Pagina</span>
        </button>
        <button
          type="button"
          className={`handout-sidebar-action ${sidebarTab === "props" ? "is-active" : ""}`}
          onClick={() => handleTabChange("props")}
          aria-pressed={sidebarTab === "props"}
        >
          <SlidersHorizontal className="h-5 w-5" />
          <span>Props</span>
        </button>
        <button
          type="button"
          className={`handout-sidebar-action ${sidebarTab === "effects" ? "is-active" : ""}`}
          onClick={() => handleTabChange("effects")}
          aria-pressed={sidebarTab === "effects"}
        >
          <Sparkles className="h-5 w-5" />
          <span>Efeitos</span>
        </button>
        <button
          type="button"
          className={`handout-sidebar-action ${sidebarTab === "export" ? "is-active" : ""}`}
          onClick={() => handleTabChange("export")}
          aria-pressed={sidebarTab === "export"}
        >
          <Download className="h-5 w-5" />
          <span>Exportar</span>
        </button>
        <div className="handout-sidebar-auth" data-handout-auth-slot></div>
      </div>

      {!sidebarCollapsed && (
        <div className="handout-sidebar-panel">
          {sidebarTab === "elements" && <HandoutElementsPanel {...elementsProps} />}
          {sidebarTab === "assets" && <HandoutAssetsPanel {...assetsProps} />}
          {sidebarTab === "page" && <HandoutPagePanel {...pageProps} />}
          {sidebarTab === "props" && <HandoutPropsPanel {...propsProps} />}
          {sidebarTab === "effects" && <HandoutEffectsPanel {...effectsProps} />}
          {sidebarTab === "export" && <HandoutExportPanel {...exportProps} />}
        </div>
      )}
    </aside>
  );
}
