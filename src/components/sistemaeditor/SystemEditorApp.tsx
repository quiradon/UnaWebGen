import RPGSystemEditor from "./editor";
import { Toaster } from "@/components/ui/sonner";
import { PortalContainerProvider } from "@/components/ui/portal-context";
import { useEffect, useState } from "react";

export default function SystemEditorApp() {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(() => {
    if (typeof document === "undefined") return null;
    return document.getElementById("system-editor-portal-root");
  });

  useEffect(() => {
    const updatePortalContainer = () => {
      setPortalContainer(document.getElementById("system-editor-portal-root"));
    };

    updatePortalContainer();
    document.addEventListener("astro:after-swap", updatePortalContainer);

    return () => {
      document.removeEventListener("astro:after-swap", updatePortalContainer);
    };
  }, []);

  return (
    <PortalContainerProvider container={portalContainer}>
      <RPGSystemEditor />
      <Toaster />
    </PortalContainerProvider>
  );
}
