import { useEffect } from "react";
import { Download, FolderOpen, LayoutGrid, SlidersHorizontal, Sparkles } from "lucide-react";

import { HandoutElementsAssetsPanel } from "@/components/handoutbuilder/panels/HandoutElementsAssetsPanel";
import { HandoutEffectsPanel } from "@/components/handoutbuilder/panels/HandoutEffectsPanel";
import { HandoutFilesPanel } from "@/components/handoutbuilder/panels/HandoutFilesPanel";
import { HandoutPageExportPanel } from "@/components/handoutbuilder/panels/HandoutPageExportPanel";
import { HandoutPropsPanel } from "@/components/handoutbuilder/panels/props/HandoutPropsPanel";
type SidebarTab = "elements" | "files" | "page" | "props" | "effects";

type HandoutCanvasSidebarProps = {
  sidebarRef: React.RefObject<HTMLDivElement>;
  sidebarTab: SidebarTab;
  setSidebarTab: (tab: SidebarTab) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  elementsAssetsProps: React.ComponentProps<typeof HandoutElementsAssetsPanel>;
  filesProps: React.ComponentProps<typeof HandoutFilesPanel>;
  pageExportProps: React.ComponentProps<typeof HandoutPageExportPanel>;
  propsProps: React.ComponentProps<typeof HandoutPropsPanel>;
  effectsProps: React.ComponentProps<typeof HandoutEffectsPanel>;
};

export function HandoutCanvasSidebar(props: HandoutCanvasSidebarProps) {
  const {
    sidebarRef,
    sidebarTab,
    setSidebarTab,
    sidebarCollapsed,
    setSidebarCollapsed,
    elementsAssetsProps,
    filesProps,
    pageExportProps,
    propsProps,
    effectsProps,
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
          <LayoutGrid className="h-5 w-5" />
          <span>Elementos</span>
        </button>
        <button
          type="button"
          className={`handout-sidebar-action ${sidebarTab === "files" ? "is-active" : ""}`}
          onClick={() => handleTabChange("files")}
          aria-pressed={sidebarTab === "files"}
        >
          <FolderOpen className="h-5 w-5" />
          <span>Arquivos</span>
        </button>
        <button
          type="button"
          className={`handout-sidebar-action ${sidebarTab === "page" ? "is-active" : ""}`}
          onClick={() => handleTabChange("page")}
          aria-pressed={sidebarTab === "page"}
        >
          <LayoutGrid className="h-5 w-5" />
          <span>Página</span>
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
        <div className="handout-sidebar-auth" data-handout-auth-slot></div>
      </div>

      {!sidebarCollapsed && (
        <div className="handout-sidebar-panel">
          {sidebarTab === "elements" && <HandoutElementsAssetsPanel {...elementsAssetsProps} />}
          {sidebarTab === "files" && <HandoutFilesPanel {...filesProps} />}
          {sidebarTab === "page" && <HandoutPageExportPanel {...pageExportProps} />}
          {sidebarTab === "props" && <HandoutPropsPanel {...propsProps} />}
          {sidebarTab === "effects" && <HandoutEffectsPanel {...effectsProps} />}
        </div>
      )}
    </aside>
  );
}
