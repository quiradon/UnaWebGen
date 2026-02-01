import type { AssetGroup } from "@/components/handoutbuilder/handoutCanvasTypes";

// Placeholder catalog until the backend assets route is available.
export const ASSET_GROUPS: AssetGroup[] = [
  {
    id: "tarot-cards",
    label: "Tarot - Cartas",
    description: "Colecao de cartas classicas.",
    kind: "folder",
    items: [
      { id: "tarot-0", name: "Tarot 0", src: "/api/tarot-card/0.webp", width: 512, height: 768 },
      { id: "tarot-1", name: "Tarot 1", src: "/api/tarot-card/1.webp", width: 512, height: 768 },
      { id: "tarot-2", name: "Tarot 2", src: "/api/tarot-card/2.webp", width: 512, height: 768 },
      { id: "tarot-3", name: "Tarot 3", src: "/api/tarot-card/3.webp", width: 512, height: 768 },
    ],
  },
  {
    id: "reactions-wave",
    label: "Reacoes - Wave",
    description: "Reacoes animadas.",
    kind: "group",
    items: [
      { id: "wave-0", name: "Wave 0", src: "/api/reacts/wave/0.webp", width: 512, height: 512 },
      { id: "wave-1", name: "Wave 1", src: "/api/reacts/wave/1.webp", width: 512, height: 512 },
      { id: "wave-2", name: "Wave 2", src: "/api/reacts/wave/2.webp", width: 512, height: 512 },
      { id: "wave-3", name: "Wave 3", src: "/api/reacts/wave/3.webp", width: 512, height: 512 },
    ],
  },
  {
    id: "premium-art",
    label: "Premium - Arte",
    description: "Conteudo exclusivo para assinantes.",
    kind: "folder",
    defaultCollapsed: true,
    items: [
      { id: "premium-1", name: "Premium 1", src: "/img/tiers_premium/1.webp", width: 512, height: 512, premium: true },
      { id: "premium-2", name: "Premium 2", src: "/img/tiers_premium/2.webp", width: 512, height: 512, premium: true },
      { id: "premium-3", name: "Premium 3", src: "/img/tiers_premium/3.webp", width: 512, height: 512, premium: true },
    ],
  },
];
