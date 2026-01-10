import { useEffect, useState } from "react";

import { PortalContainerProvider } from "@/components/ui/portal-context";
import { Toaster } from "@/components/ui/sonner";
import HandoutCanvasBuilder from "@/components/handoutbuilder/HandoutCanvasBuilder";

export default function HandoutCanvasApp() {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(() => {
    if (typeof document === "undefined") return null;
    return document.getElementById("handout-builder-portal-root");
  });

  useEffect(() => {
    const updatePortalContainer = () => {
      setPortalContainer(document.getElementById("handout-builder-portal-root"));
    };

    updatePortalContainer();
    document.addEventListener("astro:after-swap", updatePortalContainer);

    return () => {
      document.removeEventListener("astro:after-swap", updatePortalContainer);
    };
  }, []);

  return (
    <PortalContainerProvider container={portalContainer}>
      <HandoutCanvasBuilder />
      <Toaster />
    </PortalContainerProvider>
  );
}
