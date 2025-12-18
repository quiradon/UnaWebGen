import { useEffect, useMemo, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import {
  Check,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Copy,
  Download,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Lock,
  Printer,
  RotateCcw,
  Trash2,
  Type,
  Unlock,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { toPng } from "html-to-image";

import { PortalContainerProvider } from "@/components/ui/portal-context";
import { Toaster } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type PageSizeId = "a4" | "letter" | "note";
type Orientation = "portrait" | "landscape";
type FontPresetId =
  | "serif"
  | "sans"
  | "mono"
  | "inter"
  | "roboto"
  | "montserrat"
  | "merriweather"
  | "playfair-display"
  | "cinzel"
  | "im-fell-english"
  | "jetbrains-mono";
type TextAlign = "left" | "center" | "right";

type BaseLayer = {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  cornerRadius: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  locked: boolean;
  visible: boolean;
};

type ImageLayer = BaseLayer & {
  type: "image";
  src: string;
  keepAspectRatio: boolean;
};

type TextLayer = BaseLayer & {
  type: "text";
  text: string;
  fontSize: number;
  color: string;
  align: TextAlign;
  fontPreset: FontPresetId;
  fontWeight: 400 | 600 | 800;
  backgroundColor: string;
  padding: number;
};

type Layer = ImageLayer | TextLayer;

type HandoutCanvasDocV1 = {
  version: 1;
  pageSize: PageSizeId;
  orientation: Orientation;
  zoom: number;
  paperColor: string;
  defaultFontPreset: FontPresetId;
  layers: Layer[];
};

type CSSVars = React.CSSProperties & Record<`--${string}`, string>;

const STORAGE_KEY = "kraken.handoutCanvas.v1";

const PAGE_SIZES: Record<PageSizeId, { label: string; width: number; height: number }> = {
  a4: { label: "A4 (794×1123)", width: 794, height: 1123 },
  letter: { label: "Letter (816×1056)", width: 816, height: 1056 },
  note: { label: "Note (1024×768)", width: 1024, height: 768 },
};

const FONT_PRESETS: Record<FontPresetId, { label: string; stack: string }> = {
  serif: { label: "Serif (Sistema)", stack: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' },
  sans: {
    label: "Sans (Sistema)",
    stack: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
  },
  mono: {
    label: "Mono (Sistema)",
    stack:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  inter: { label: "Inter", stack: 'Inter, ui-sans-serif, system-ui, "Segoe UI", Roboto, Arial, sans-serif' },
  roboto: { label: "Roboto", stack: 'Roboto, ui-sans-serif, system-ui, "Segoe UI", Arial, sans-serif' },
  montserrat: {
    label: "Montserrat",
    stack: 'Montserrat, ui-sans-serif, system-ui, "Segoe UI", Roboto, Arial, sans-serif',
  },
  merriweather: {
    label: "Merriweather",
    stack: 'Merriweather, ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  },
  "playfair-display": {
    label: "Playfair Display",
    stack: 'Playfair Display, ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  },
  cinzel: { label: "Cinzel", stack: 'Cinzel, ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' },
  "im-fell-english": {
    label: "IM Fell English",
    stack: 'IM Fell English, ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  },
  "jetbrains-mono": {
    label: "JetBrains Mono",
    stack:
      'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
};

const FONT_PRESET_IDS = Object.keys(FONT_PRESETS) as FontPresetId[];

const DEFAULT_DOC: HandoutCanvasDocV1 = {
  version: 1,
  pageSize: "a4",
  orientation: "portrait",
  zoom: 0.9,
  paperColor: "#f6f0de",
  defaultFontPreset: "serif",
  layers: [
    {
      id: "txt_title",
      type: "text",
      name: "Título",
      x: 72,
      y: 72,
      width: 650,
      height: 120,
      opacity: 1,
      cornerRadius: 0,
      rotation: 0,
      flipX: false,
      flipY: false,
      locked: false,
      visible: true,
      text: "Handout",
      fontSize: 54,
      color: "#2b1b0e",
      align: "left",
      fontPreset: "serif",
      fontWeight: 800,
      backgroundColor: "transparent",
      padding: 0,
    },
    {
      id: "txt_body",
      type: "text",
      name: "Texto",
      x: 72,
      y: 220,
      width: 650,
      height: 320,
      opacity: 1,
      cornerRadius: 0,
      rotation: 0,
      flipX: false,
      flipY: false,
      locked: false,
      visible: true,
      text:
        "Funciona como um mini-Canva:\\n\\n- Adicione imagens em camadas\\n- Crie vários textos\\n- Arraste e redimensione\\n- Reordene as camadas no painel",
      fontSize: 18,
      color: "#2b1b0e",
      align: "left",
      fontPreset: "serif",
      fontWeight: 400,
      backgroundColor: "transparent",
      padding: 0,
    },
  ],
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function safeEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T) {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function safeNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function safeString(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function safeBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function safeArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

type FontPickerProps = {
  value: FontPresetId;
  onValueChange: (value: FontPresetId) => void;
  disabled?: boolean;
};

function FontPicker({ value, onValueChange, disabled }: FontPickerProps) {
  const [open, setOpen] = useState(false);
  const selected = FONT_PRESETS[value] ?? FONT_PRESETS.serif;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between gap-2"
        >
          <span className="truncate" style={{ fontFamily: selected.stack }}>
            {selected.label}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[320px] p-0">
        <Command>
          <CommandInput placeholder="Buscar fonte..." />
          <CommandList>
            <CommandEmpty>Nenhuma fonte encontrada.</CommandEmpty>
            <CommandGroup>
              {Object.entries(FONT_PRESETS).map(([id, preset]) => (
                <CommandItem
                  key={id}
                  value={`${preset.label} ${id}`}
                  className="cursor-pointer"
                  onMouseDown={(e) => {
                    if (e.button !== 0) return;
                    e.preventDefault();
                    onValueChange(id as FontPresetId);
                    setOpen(false);
                  }}
                  onSelect={() => {
                    onValueChange(id as FontPresetId);
                    setOpen(false);
                  }}
                >
                  <Check className={`mr-2 h-4 w-4 ${value === id ? "opacity-100" : "opacity-0"}`} />
                  <span className="truncate" style={{ fontFamily: preset.stack }}>
                    {preset.label}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function normalizeLayer(raw: unknown): Layer | null {
  if (!isObject(raw)) return null;
  const type = raw.type;
  if (type !== "image" && type !== "text") return null;

  const base: BaseLayer = {
    id: safeString(raw.id, ""),
    name: safeString(raw.name, "Camada"),
    x: safeNumber(raw.x, 0),
    y: safeNumber(raw.y, 0),
    width: Math.max(20, safeNumber(raw.width, 200)),
    height: Math.max(20, safeNumber(raw.height, 120)),
    opacity: clamp(safeNumber(raw.opacity, 1), 0, 1),
    cornerRadius: clamp(safeNumber(raw.cornerRadius, 0), 0, 96),
    rotation: clamp(safeNumber(raw.rotation, 0), -360, 360),
    flipX: safeBoolean(raw.flipX, false),
    flipY: safeBoolean(raw.flipY, false),
    locked: safeBoolean(raw.locked, false),
    visible: safeBoolean(raw.visible, true),
  };

  if (!base.id) return null;

  if (type === "image") {
    const src = safeString(raw.src, "");
    if (!src) return null;

    const keepAspectRatio = safeBoolean(raw.keepAspectRatio, true);
    const layer: ImageLayer = {
      ...base,
      type: "image",
      src,
      keepAspectRatio,
    };
    return layer;
  }

  const fontWeight = safeEnum(String(raw.fontWeight), ["400", "600", "800"] as const, "400");
  const layer: TextLayer = {
    ...base,
    type: "text",
    text: safeString(raw.text, ""),
    fontSize: clamp(safeNumber(raw.fontSize, 18), 8, 180),
    color: safeString(raw.color, "#111111"),
    align: safeEnum(raw.align, ["left", "center", "right"] as const, "left"),
    fontPreset: safeEnum(raw.fontPreset, FONT_PRESET_IDS, DEFAULT_DOC.defaultFontPreset),
    fontWeight: Number(fontWeight) as 400 | 600 | 800,
    backgroundColor: safeString(raw.backgroundColor, "transparent"),
    padding: clamp(safeNumber(raw.padding, 0), 0, 64),
  };
  return layer;
}

function normalizeDocV1(raw: unknown): HandoutCanvasDocV1 | null {
  if (!isObject(raw)) return null;
  if (raw.version !== 1) return null;

  const pageSize = safeEnum(raw.pageSize, ["a4", "letter", "note"] as const, DEFAULT_DOC.pageSize);
  const orientation = safeEnum(raw.orientation, ["portrait", "landscape"] as const, DEFAULT_DOC.orientation);
  const zoom = clamp(safeNumber(raw.zoom, DEFAULT_DOC.zoom), 0.5, 1.25);
  const paperColor = safeString(raw.paperColor, DEFAULT_DOC.paperColor);
  const defaultFontPreset = safeEnum(
    raw.defaultFontPreset,
    FONT_PRESET_IDS,
    DEFAULT_DOC.defaultFontPreset,
  );

  const layers = safeArray(raw.layers)
    .map(normalizeLayer)
    .filter((l): l is Layer => Boolean(l));

  return {
    version: 1,
    pageSize,
    orientation,
    zoom,
    paperColor,
    defaultFontPreset,
    layers: layers.length ? layers : DEFAULT_DOC.layers,
  };
}

function createId(prefix: string) {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${rand}`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Falha ao ler arquivo."));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });
}

async function getImageNaturalSize(src: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
    img.onerror = () => reject(new Error("Falha ao carregar imagem."));
    img.src = src;
  });
}

function HandoutCanvasBuilder() {
  const [tab, setTab] = useState<"layers" | "props" | "export">("layers");
  const [doc, setDoc] = useState<HandoutCanvasDocV1>(DEFAULT_DOC);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const pageRef = useRef<HTMLDivElement | null>(null);
  const jsonFileRef = useRef<HTMLInputElement | null>(null);
  const imageFileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setHasLoaded(true);
        return;
      }
      const parsed = JSON.parse(raw) as unknown;
      const normalized = normalizeDocV1(parsed);
      if (normalized) setDoc(normalized);
      setHasLoaded(true);
    } catch {
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
    } catch {
      // ignore
    }
  }, [doc, hasLoaded]);

  const derivedPage = useMemo(() => {
    const preset = PAGE_SIZES[doc.pageSize];
    const portrait = doc.orientation === "portrait";
    const width = portrait ? preset.width : preset.height;
    const height = portrait ? preset.height : preset.width;

    const vars: CSSVars = {
      "--handout-paper": doc.paperColor,
      "--handout-font": FONT_PRESETS[doc.defaultFontPreset].stack,
    };

    return { width, height, vars };
  }, [doc.pageSize, doc.orientation, doc.paperColor, doc.defaultFontPreset]);

  const layersForList = useMemo(() => [...doc.layers].reverse(), [doc.layers]);
  const selectedLayer = useMemo(
    () => doc.layers.find((l) => l.id === selectedId) ?? null,
    [doc.layers, selectedId],
  );

  function updateLayer(id: string, updater: (prev: Layer) => Layer) {
    setDoc((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === id ? updater(l) : l)),
    }));
  }

  function moveLayerOneStep(id: string, direction: -1 | 1) {
    setDoc((prev) => {
      const idx = prev.layers.findIndex((l) => l.id === id);
      if (idx < 0) return prev;
      const nextIdx = idx + direction;
      if (nextIdx < 0 || nextIdx >= prev.layers.length) return prev;
      const layers = [...prev.layers];
      const [item] = layers.splice(idx, 1);
      layers.splice(nextIdx, 0, item);
      return { ...prev, layers };
    });
  }

  function deleteLayer(id: string) {
    setDoc((prev) => ({ ...prev, layers: prev.layers.filter((l) => l.id !== id) }));
    setSelectedId((current) => (current === id ? null : current));
  }

  function addText() {
    const id = createId("txt");
    const number = doc.layers.filter((l) => l.type === "text").length + 1;

    const layer: TextLayer = {
      id,
      type: "text",
      name: `Texto ${number}`,
      x: 72,
      y: 560,
      width: 520,
      height: 140,
      opacity: 1,
      cornerRadius: 0,
      rotation: 0,
      flipX: false,
      flipY: false,
      locked: false,
      visible: true,
      text: "Novo texto",
      fontSize: 32,
      color: "#2b1b0e",
      align: "left",
      fontPreset: doc.defaultFontPreset,
      fontWeight: 800,
      backgroundColor: "transparent",
      padding: 0,
    };

    setDoc((prev) => ({ ...prev, layers: [...prev.layers, layer] }));
    setSelectedId(id);
    setTab("props");
  }

  async function addImages(files: FileList) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;

    toast.message(`Carregando ${list.length} imagem(ns)…`);
    const created: ImageLayer[] = [];

    for (const file of list) {
      try {
        const src = await fileToDataUrl(file);
        const natural = await getImageNaturalSize(src);
        const maxW = derivedPage.width * 0.85;
        const maxH = derivedPage.height * 0.6;
        const scale = Math.min(maxW / natural.width, maxH / natural.height, 1);
        const width = Math.max(64, Math.round(natural.width * scale));
        const height = Math.max(64, Math.round(natural.height * scale));
        const x = Math.max(0, Math.round((derivedPage.width - width) / 2));
        const y = Math.max(0, Math.round((derivedPage.height - height) / 2));

        created.push({
          id: createId("img"),
          type: "image",
          name: file.name,
          x,
          y,
          width,
          height,
          opacity: 1,
          cornerRadius: 0,
          rotation: 0,
          flipX: false,
          flipY: false,
          locked: false,
          visible: true,
          src,
          keepAspectRatio: true,
        });
      } catch (error) {
        console.error(error);
        toast.error(`Falha ao carregar: ${file.name}`);
      }
    }

    if (!created.length) return;
    setDoc((prev) => ({ ...prev, layers: [...prev.layers, ...created] }));
    setSelectedId(created[created.length - 1].id);
    setTab("layers");
    toast.success("Imagem(ns) adicionada(s).");
  }

  function resetAll() {
    setDoc(DEFAULT_DOC);
    setSelectedId(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    toast.message("Resetado.");
  }

  async function exportPng() {
    const node = pageRef.current;
    if (!node) return;

    const prevSelected = selectedId;
    setSelectedId(null);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    try {
      toast.message("Gerando PNG…");
      const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "handout.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("PNG exportado.");
    } catch (error) {
      console.error(error);
      toast.error("Falha ao exportar PNG.");
    } finally {
      setSelectedId(prevSelected);
    }
  }

  function printPdf() {
    setSelectedId(null);
    window.print();
  }

  function exportJson() {
    try {
      const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
      downloadBlob(blob, "handout.json");
      toast.success("JSON exportado.");
    } catch {
      toast.error("Falha ao exportar JSON.");
    }
  }

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(doc, null, 2));
      toast.success("JSON copiado.");
    } catch {
      toast.error("Falha ao copiar JSON.");
    }
  }

  async function importJsonFile(file: File) {
    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw) as unknown;
      const normalized = normalizeDocV1(parsed);
      if (!normalized) {
        toast.error("Arquivo inválido.");
        return;
      }
      setDoc(normalized);
      setSelectedId(null);
      toast.success("Importado.");
    } catch (error) {
      console.error(error);
      toast.error("Falha ao importar.");
    }
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || target?.isContentEditable) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        if (!selectedId) return;
        deleteLayer(selectedId);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId]);

  return (
    <div className="handout-builder-app">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[420px_1fr]">
        <aside className="handout-builder-sidebar">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <Badge variant="secondary">Canvas</Badge>
                  Handout Builder
                </span>
                <span className="text-xs text-muted-foreground">
                  {derivedPage.width}x{derivedPage.height}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 grid gap-4">
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" onClick={addText} className="gap-2">
                  <Type className="h-4 w-4" />
                  Texto
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => imageFileRef.current?.click()}
                  className="gap-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  Imagem
                </Button>
                <input
                  ref={imageFileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length) void addImages(files);
                    e.currentTarget.value = "";
                  }}
                />
              </div>

              <div className="grid gap-3 rounded-md border border-input p-3">
                <div className="text-sm font-medium">Página</div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>Tamanho</Label>
                    <Select
                      value={doc.pageSize}
                      onValueChange={(v) => setDoc((p) => ({ ...p, pageSize: v as PageSizeId }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PAGE_SIZES).map(([id, preset]) => (
                          <SelectItem key={id} value={id}>
                            {preset.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Orientação</Label>
                    <Select
                      value={doc.orientation}
                      onValueChange={(v) => setDoc((p) => ({ ...p, orientation: v as Orientation }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Retrato</SelectItem>
                        <SelectItem value="landscape">Paisagem</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="canvas-zoom">Zoom ({Math.round(doc.zoom * 100)}%)</Label>
                    <input
                      id="canvas-zoom"
                      type="range"
                      min={0.5}
                      max={1.25}
                      step={0.05}
                      value={doc.zoom}
                      onChange={(e) => setDoc((p) => ({ ...p, zoom: Number(e.target.value) }))}
                      className="handout-range"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Fonte (padrão)</Label>
                    <FontPicker
                      value={doc.defaultFontPreset}
                      onValueChange={(v) => setDoc((p) => ({ ...p, defaultFontPreset: v }))}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="page-paper">Cor do papel</Label>
                  <Input
                    id="page-paper"
                    type="color"
                    value={doc.paperColor}
                    onChange={(e) => setDoc((p) => ({ ...p, paperColor: e.target.value }))}
                    className="h-10 p-1"
                  />
                </div>
              </div>

              <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="layers">Camadas</TabsTrigger>
                  <TabsTrigger value="props">Propriedades</TabsTrigger>
                  <TabsTrigger value="export">Exportar</TabsTrigger>
                </TabsList>

                <TabsContent value="layers" className="mt-4 grid gap-3">
                  {layersForList.length === 0 && (
                    <div className="text-sm text-muted-foreground">Sem camadas. Adicione um texto ou imagem.</div>
                  )}

                  {layersForList.map((layer, idxFromTop) => {
                    const realIdx = doc.layers.length - 1 - idxFromTop;
                    const isSelected = layer.id === selectedId;
                    const canMoveForward = realIdx < doc.layers.length - 1;
                    const canMoveBackward = realIdx > 0;

                    return (
                      <div key={layer.id} className={`handout-layer-row ${isSelected ? "is-selected" : ""}`}>
                        <button
                          type="button"
                          className="handout-layer-main"
                          onClick={() => {
                            setSelectedId(layer.id);
                            setTab("props");
                          }}
                        >
                          <span className="handout-layer-icon">
                            {layer.type === "image" ? (
                              <ImageIcon className="h-4 w-4" />
                            ) : (
                              <Type className="h-4 w-4" />
                            )}
                          </span>
                          <span className="handout-layer-name" title={layer.name}>
                            {layer.name || layer.id}
                          </span>
                        </button>

                        <div className="handout-layer-actions">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            disabled={!canMoveForward}
                            onClick={() => moveLayerOneStep(layer.id, 1)}
                            aria-label="Trazer para frente"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            disabled={!canMoveBackward}
                            onClick={() => moveLayerOneStep(layer.id, -1)}
                            aria-label="Enviar para trás"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => updateLayer(layer.id, (prev) => ({ ...prev, visible: !prev.visible }))}
                            aria-label={layer.visible ? "Ocultar" : "Mostrar"}
                          >
                            {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => updateLayer(layer.id, (prev) => ({ ...prev, locked: !prev.locked }))}
                            aria-label={layer.locked ? "Desbloquear" : "Bloquear"}
                          >
                            {layer.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteLayer(layer.id)}
                            aria-label="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </TabsContent>

                <TabsContent value="props" className="mt-4 grid gap-4">
                  {!selectedLayer && (
                    <div className="text-sm text-muted-foreground">Selecione uma camada para editar.</div>
                  )}

                  {selectedLayer && (
                    <>
                      <div className="grid gap-2">
                        <Label>Nome</Label>
                        <Input
                          value={selectedLayer.name}
                          onChange={(e) => updateLayer(selectedLayer.id, (p) => ({ ...p, name: e.target.value }))}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                          <Label>X</Label>
                          <Input
                            type="number"
                            value={Math.round(selectedLayer.x)}
                            onChange={(e) =>
                              updateLayer(selectedLayer.id, (p) => ({ ...p, x: Number(e.target.value) }))
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Y</Label>
                          <Input
                            type="number"
                            value={Math.round(selectedLayer.y)}
                            onChange={(e) =>
                              updateLayer(selectedLayer.id, (p) => ({ ...p, y: Number(e.target.value) }))
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                          <Label>Largura</Label>
                          <Input
                            type="number"
                            value={Math.round(selectedLayer.width)}
                            onChange={(e) =>
                              updateLayer(selectedLayer.id, (p) => ({
                                ...p,
                                width: Math.max(20, Number(e.target.value)),
                              }))
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Altura</Label>
                          <Input
                            type="number"
                            value={Math.round(selectedLayer.height)}
                            onChange={(e) =>
                              updateLayer(selectedLayer.id, (p) => ({
                                ...p,
                                height: Math.max(20, Number(e.target.value)),
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label>Opacidade ({Math.round(selectedLayer.opacity * 100)}%)</Label>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={selectedLayer.opacity}
                          onChange={(e) =>
                            updateLayer(selectedLayer.id, (p) => ({ ...p, opacity: Number(e.target.value) }))
                          }
                          className="handout-range"
                        />
                      </div>

                      <div className="grid gap-3">
                        <div className="flex items-center justify-between gap-3 rounded-md border border-input px-3 py-2">
                          <div className="grid gap-0.5">
                            <div className="text-sm font-medium">Visível</div>
                            <div className="text-xs text-muted-foreground">Mostrar no canvas</div>
                          </div>
                          <Switch
                            checked={selectedLayer.visible}
                            onCheckedChange={(checked) =>
                              updateLayer(selectedLayer.id, (p) => ({ ...p, visible: checked }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between gap-3 rounded-md border border-input px-3 py-2">
                          <div className="grid gap-0.5">
                            <div className="text-sm font-medium">Bloqueada</div>
                            <div className="text-xs text-muted-foreground">Impedir mover/redimensionar</div>
                          </div>
                          <Switch
                            checked={selectedLayer.locked}
                            onCheckedChange={(checked) =>
                              updateLayer(selectedLayer.id, (p) => ({ ...p, locked: checked }))
                            }
                          />
                        </div>
                      </div>

                      <div className="grid gap-3 rounded-md border border-input p-3">
                        <div className="text-sm font-medium">Transformações</div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="grid gap-2">
                            <Label>Rotação (°)</Label>
                            <Input
                              type="number"
                              value={selectedLayer.rotation}
                              onChange={(e) => {
                                const value = clamp(Number(e.target.value), -360, 360);
                                updateLayer(selectedLayer.id, (p) => ({ ...p, rotation: value }));
                              }}
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label>Rotação</Label>
                            <input
                              type="range"
                              min={-180}
                              max={180}
                              step={1}
                              value={selectedLayer.rotation}
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                updateLayer(selectedLayer.id, (p) => ({ ...p, rotation: value }));
                              }}
                              className="handout-range"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateLayer(selectedLayer.id, (p) => ({
                                ...p,
                                rotation: clamp(p.rotation - 90, -360, 360),
                              }))
                            }
                          >
                            -90°
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateLayer(selectedLayer.id, (p) => ({
                                ...p,
                                rotation: clamp(p.rotation + 90, -360, 360),
                              }))
                            }
                          >
                            +90°
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateLayer(selectedLayer.id, (p) => ({
                                ...p,
                                rotation: 0,
                                flipX: false,
                                flipY: false,
                              }))
                            }
                          >
                            Reset
                          </Button>
                        </div>

                        <div className="grid gap-3">
                          <div className="flex items-center justify-between gap-3 rounded-md border border-input px-3 py-2">
                            <div className="grid gap-0.5">
                              <div className="text-sm font-medium">Flip horizontal</div>
                              <div className="text-xs text-muted-foreground">Espelhar no eixo X</div>
                            </div>
                            <Switch
                              checked={selectedLayer.flipX}
                              onCheckedChange={(checked) =>
                                updateLayer(selectedLayer.id, (p) => ({ ...p, flipX: checked }))
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between gap-3 rounded-md border border-input px-3 py-2">
                            <div className="grid gap-0.5">
                              <div className="text-sm font-medium">Flip vertical</div>
                              <div className="text-xs text-muted-foreground">Espelhar no eixo Y</div>
                            </div>
                            <Switch
                              checked={selectedLayer.flipY}
                              onCheckedChange={(checked) =>
                                updateLayer(selectedLayer.id, (p) => ({ ...p, flipY: checked }))
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {selectedLayer.type === "image" && (
                        <div className="grid gap-3 rounded-md border border-input p-3">
                          <div className="text-sm font-medium">Imagem</div>

                          <div className="grid gap-2">
                            <Label>Arredondamento (px)</Label>
                            <div className="grid grid-cols-2 gap-3">
                              <Input
                                type="number"
                                min={0}
                                max={96}
                                value={selectedLayer.cornerRadius}
                                onChange={(e) => {
                                  const value = clamp(Number(e.target.value), 0, 96);
                                  updateLayer(selectedLayer.id, (p) => ({ ...p, cornerRadius: value }));
                                }}
                              />
                              <input
                                type="range"
                                min={0}
                                max={64}
                                step={1}
                                value={selectedLayer.cornerRadius}
                                onChange={(e) => {
                                  const value = Number(e.target.value);
                                  updateLayer(selectedLayer.id, (p) => ({ ...p, cornerRadius: value }));
                                }}
                                className="handout-range"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3 rounded-md border border-input px-3 py-2">
                            <div className="grid gap-0.5">
                              <div className="text-sm font-medium">Manter proporção</div>
                              <div className="text-xs text-muted-foreground">Ao redimensionar</div>
                            </div>
                            <Switch
                              checked={selectedLayer.keepAspectRatio}
                              onCheckedChange={(checked) =>
                                updateLayer(selectedLayer.id, (p) =>
                                  p.type === "image" ? { ...p, keepAspectRatio: checked } : p,
                                )
                              }
                            />
                          </div>
                        </div>
                      )}

                      {selectedLayer.type === "text" && (
                        <div className="grid gap-3 rounded-md border border-input p-3">
                          <div className="text-sm font-medium">Texto</div>
                          <div className="grid gap-2">
                            <Label>Conteúdo</Label>
                            <Textarea
                              value={selectedLayer.text}
                              rows={6}
                              onChange={(e) =>
                                updateLayer(selectedLayer.id, (p) =>
                                  p.type === "text" ? { ...p, text: e.target.value } : p,
                                )
                              }
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                              <Label>Tamanho</Label>
                              <Input
                                type="number"
                                value={selectedLayer.fontSize}
                                onChange={(e) =>
                                  updateLayer(selectedLayer.id, (p) =>
                                    p.type === "text"
                                      ? { ...p, fontSize: clamp(Number(e.target.value), 8, 180) }
                                      : p,
                                  )
                                }
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label>Cor</Label>
                              <Input
                                type="color"
                                value={selectedLayer.color}
                                onChange={(e) =>
                                  updateLayer(selectedLayer.id, (p) =>
                                    p.type === "text" ? { ...p, color: e.target.value } : p,
                                  )
                                }
                                className="h-10 p-1"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                              <Label>Alinhamento</Label>
                              <Select
                                value={selectedLayer.align}
                                onValueChange={(v) =>
                                  updateLayer(selectedLayer.id, (p) =>
                                    p.type === "text" ? { ...p, align: v as TextAlign } : p,
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="left">Esquerda</SelectItem>
                                  <SelectItem value="center">Centro</SelectItem>
                                  <SelectItem value="right">Direita</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label>Fonte</Label>
                              <FontPicker
                                value={selectedLayer.fontPreset}
                                onValueChange={(v) =>
                                  updateLayer(selectedLayer.id, (p) =>
                                    p.type === "text" ? { ...p, fontPreset: v } : p,
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="export" className="mt-4 grid gap-3">
                  <Button type="button" onClick={() => void exportPng()} className="gap-2">
                    <Download className="h-4 w-4" />
                    Baixar PNG
                  </Button>

                  <Button type="button" variant="outline" onClick={printPdf} className="gap-2">
                    <Printer className="h-4 w-4" />
                    Imprimir / Salvar PDF
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant="outline" onClick={exportJson} className="gap-2">
                      <Download className="h-4 w-4" />
                      JSON
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => jsonFileRef.current?.click()}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Importar
                    </Button>
                    <input
                      ref={jsonFileRef}
                      type="file"
                      accept="application/json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void importJsonFile(file);
                        e.currentTarget.value = "";
                      }}
                    />
                  </div>

                  <Button type="button" variant="outline" onClick={() => void copyJson()} className="gap-2">
                    <Copy className="h-4 w-4" />
                    Copiar JSON
                  </Button>

                  <Button type="button" variant="outline" onClick={resetAll} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Resetar
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </aside>

        <section className="handout-builder-preview">
          <div className="handout-preview-toolbar">
            <div className="text-sm text-muted-foreground">
              Canvas:{" "}
              <span className="font-mono">
                {derivedPage.width}x{derivedPage.height}px
              </span>
            </div>
            {selectedLayer && (
              <div className="text-sm text-muted-foreground">
                Selecionado:{" "}
                <span className="font-mono text-foreground">
                  {selectedLayer.name || selectedLayer.id}
                </span>
              </div>
            )}
          </div>

          <div
            className="handout-preview-stage handout-canvas-stage"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const files = e.dataTransfer.files;
              if (files && files.length) void addImages(files);
            }}
          >
            <div
              className="handout-canvas-zoom"
              style={{ transform: `scale(${doc.zoom})`, transformOrigin: "top center" }}
            >
              <div
                ref={pageRef}
                className="handout-page handout-print-target handout-canvas-page"
                style={{
                  ...derivedPage.vars,
                  width: `${derivedPage.width}px`,
                  height: `${derivedPage.height}px`,
                }}
                onMouseDown={(e) => {
                  if (e.target === e.currentTarget) setSelectedId(null);
                }}
              >
                {doc.layers.map((layer) => {
                  const isSelected = layer.id === selectedId;
                  if (!layer.visible) return null;

                  const cornerRadius = clamp(layer.cornerRadius, 0, 96);
                  const cornerRadiusPx = `${cornerRadius}px`;
                  const layerTransform = `rotate(${layer.rotation}deg) scaleX(${layer.flipX ? -1 : 1}) scaleY(${layer.flipY ? -1 : 1})`;
                  const labelIsBottom = layer.y < 40;
                  const labelIsRight = layer.x + 240 > derivedPage.width;
                  const boundsLabelClassName = [
                    "handout-layer-bounds-label",
                    labelIsBottom ? "is-bottom" : "",
                    labelIsRight ? "is-right" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");
                  const handleStyle = {
                    width: "12px",
                    height: "12px",
                    background: "var(--handout-accent, hsl(var(--primary)))",
                    borderRadius: "999px",
                    border: "2px solid rgba(255,255,255,0.85)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                  } as const;
                  const resizeHandleStyles =
                    isSelected && !layer.locked
                      ? {
                          topLeft: handleStyle,
                          topRight: handleStyle,
                          bottomLeft: handleStyle,
                          bottomRight: handleStyle,
                        }
                      : undefined;

                  return (
                    <Rnd
                      key={layer.id}
                      bounds="parent"
                      size={{ width: layer.width, height: layer.height }}
                      position={{ x: layer.x, y: layer.y }}
                      scale={doc.zoom}
                      disableDragging={layer.locked}
                      enableResizing={isSelected && !layer.locked}
                      resizeHandleStyles={resizeHandleStyles}
                      lockAspectRatio={layer.type === "image" ? layer.keepAspectRatio : false}
                      style={{ borderRadius: cornerRadiusPx }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setSelectedId(layer.id);
                      }}
                      onDoubleClick={() => setTab("props")}
                      onDragStop={(_, data) => {
                        updateLayer(layer.id, (p) => ({ ...p, x: data.x, y: data.y }));
                      }}
                      onResizeStop={(_, __, ref, ___, position) => {
                        const nextWidth = Number(ref.style.width.replace("px", ""));
                        const nextHeight = Number(ref.style.height.replace("px", ""));
                        updateLayer(layer.id, (p) => ({
                          ...p,
                          width: Math.max(20, nextWidth),
                          height: Math.max(20, nextHeight),
                          x: position.x,
                          y: position.y,
                        }));
                      }}
                      className={`handout-layer ${layer.type === "image" ? "is-image" : "is-text"} ${isSelected ? "is-selected" : ""} ${layer.locked ? "is-locked" : ""}`}
                    >
                      {isSelected && (
                        <div className="handout-layer-bounds" aria-hidden="true">
                          <div className={boundsLabelClassName}>
                            {Math.round(layer.width)}x{Math.round(layer.height)} · x:{Math.round(layer.x)} y:{Math.round(layer.y)}
                          </div>
                        </div>
                      )}

                      <div className="handout-layer-inner" style={{ opacity: layer.opacity }}>
                        <div
                          className="handout-layer-transform"
                          style={{ transform: layerTransform, transformOrigin: "center center" }}
                        >
                          {layer.type === "image" ? (
                            <img src={layer.src} alt="" draggable={false} className="handout-layer-image" />
                          ) : (
                            <div
                              className="handout-layer-text"
                              style={{
                                fontSize: `${layer.fontSize}px`,
                                color: layer.color,
                                textAlign: layer.align,
                                fontFamily: FONT_PRESETS[layer.fontPreset].stack,
                                fontWeight: layer.fontWeight,
                                backgroundColor: layer.backgroundColor,
                                padding: `${layer.padding}px`,
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {layer.text}
                            </div>
                          )}
                        </div>
                      </div>
                    </Rnd>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

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
