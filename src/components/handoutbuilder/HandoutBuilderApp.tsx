import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toPng } from "html-to-image";
import {
  Copy,
  Download,
  Image as ImageIcon,
  Printer,
  RotateCcw,
  Upload,
  WandSparkles,
} from "lucide-react";

import { PortalContainerProvider } from "@/components/ui/portal-context";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TemplateId = "parchment" | "letter" | "dossier";
type PageSizeId = "a4" | "letter" | "note";
type Orientation = "portrait" | "landscape";
type FontPresetId = "serif" | "sans" | "mono";

type HandoutStateV1 = {
  version: 1;
  title: string;
  subtitle: string;
  body: string;
  footer: string;
  template: TemplateId;
  pageSize: PageSizeId;
  orientation: Orientation;
  zoom: number;
  paperColor: string;
  inkColor: string;
  accentColor: string;
  fontPreset: FontPresetId;
  showBorder: boolean;
  stampEnabled: boolean;
  stampText: string;
  headerImageDataUrl: string | null;
};

type CSSVars = React.CSSProperties & Record<`--${string}`, string>;

const STORAGE_KEY = "kraken.handoutBuilder.v1";

const PAGE_SIZES: Record<PageSizeId, { label: string; width: number; height: number }> = {
  a4: { label: "A4 (794×1123)", width: 794, height: 1123 },
  letter: { label: "Letter (816×1056)", width: 816, height: 1056 },
  note: { label: "Note (1024×768)", width: 1024, height: 768 },
};

const FONT_PRESETS: Record<FontPresetId, { label: string; stack: string }> = {
  serif: { label: "Serif", stack: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' },
  sans: { label: "Sans", stack: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif' },
  mono: { label: "Mono", stack: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' },
};

const TEMPLATE_LABELS: Record<TemplateId, string> = {
  parchment: "Pergaminho",
  letter: "Carta",
  dossier: "Dossiê",
};

const DEFAULT_STATE: HandoutStateV1 = {
  version: 1,
  title: "Aviso da Guilda",
  subtitle: "Aos aventureiros que ousarem entrar nas ruínas…",
  body:
    "## Recompensa\n\n- 150 po por informações úteis\n- 500 po pelo artefato intacto\n\n> **Atenção:** o local está amaldiçoado.\n\n**Dica:** você pode usar *Markdown* aqui (listas, citações, tabelas…).",
  footer: "— Mestre do Jogo",
  template: "parchment",
  pageSize: "a4",
  orientation: "portrait",
  zoom: 0.9,
  paperColor: "#f6f0de",
  inkColor: "#2b1b0e",
  accentColor: "#7c1d1d",
  fontPreset: "serif",
  showBorder: true,
  stampEnabled: false,
  stampText: "CONFIDENCIAL",
  headerImageDataUrl: null,
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function safeString(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function safeBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function safeNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function safeEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T) {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function normalizeStateV1(input: unknown): HandoutStateV1 | null {
  if (!isObject(input)) return null;
  if (input.version !== 1) return null;

  return {
    version: 1,
    title: safeString(input.title, DEFAULT_STATE.title),
    subtitle: safeString(input.subtitle, DEFAULT_STATE.subtitle),
    body: safeString(input.body, DEFAULT_STATE.body),
    footer: safeString(input.footer, DEFAULT_STATE.footer),
    template: safeEnum(input.template, ["parchment", "letter", "dossier"] as const, DEFAULT_STATE.template),
    pageSize: safeEnum(input.pageSize, ["a4", "letter", "note"] as const, DEFAULT_STATE.pageSize),
    orientation: safeEnum(input.orientation, ["portrait", "landscape"] as const, DEFAULT_STATE.orientation),
    zoom: Math.min(1.5, Math.max(0.25, safeNumber(input.zoom, DEFAULT_STATE.zoom))),
    paperColor: safeString(input.paperColor, DEFAULT_STATE.paperColor),
    inkColor: safeString(input.inkColor, DEFAULT_STATE.inkColor),
    accentColor: safeString(input.accentColor, DEFAULT_STATE.accentColor),
    fontPreset: safeEnum(input.fontPreset, ["serif", "sans", "mono"] as const, DEFAULT_STATE.fontPreset),
    showBorder: safeBoolean(input.showBorder, DEFAULT_STATE.showBorder),
    stampEnabled: safeBoolean(input.stampEnabled, DEFAULT_STATE.stampEnabled),
    stampText: safeString(input.stampText, DEFAULT_STATE.stampText),
    headerImageDataUrl: typeof input.headerImageDataUrl === "string" ? input.headerImageDataUrl : null,
  };
}

function makeSafeFilename(input: string) {
  const base = (input || "handout")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return base || "handout";
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

function HandoutBuilder() {
  const [tab, setTab] = useState<"content" | "style" | "export">("content");
  const [state, setState] = useState<HandoutStateV1>(DEFAULT_STATE);
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
      const normalized = normalizeStateV1(parsed);
      if (normalized) setState(normalized);
      setHasLoaded(true);
    } catch {
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state, hasLoaded]);

  const derivedPage = useMemo(() => {
    const preset = PAGE_SIZES[state.pageSize];
    const portrait = state.orientation === "portrait";
    const width = portrait ? preset.width : preset.height;
    const minHeight = portrait ? preset.height : preset.width;

    const fontStack = FONT_PRESETS[state.fontPreset].stack;

    const vars: CSSVars = {
      "--handout-paper": state.paperColor,
      "--handout-ink": state.inkColor,
      "--handout-accent": state.accentColor,
      "--handout-font": fontStack,
    };

    return { width, minHeight, vars };
  }, [state.pageSize, state.orientation, state.paperColor, state.inkColor, state.accentColor, state.fontPreset]);

  const filenameBase = useMemo(() => makeSafeFilename(state.title), [state.title]);

  const templateClass =
    state.template === "parchment"
      ? "handout-template-parchment"
      : state.template === "letter"
        ? "handout-template-letter"
        : "handout-template-dossier";

  const borderClass = state.showBorder ? "handout-border" : "handout-borderless";

  async function exportPng() {
    const node = pageRef.current;
    if (!node) return;

    try {
      toast.message("Gerando imagem…");
      const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${filenameBase}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("PNG exportado.");
    } catch (error) {
      console.error(error);
      toast.error("Falha ao exportar PNG.");
    }
  }

  function exportJson() {
    try {
      // Verificar se há dados válidos para exportar  
      if (!state) {
        toast.error("Não há dados para exportar.");
        return;
      }

      const exportData = {
        ...state,
        exportedAt: new Date().toISOString(),
        exportedBy: "Handout Builder App"
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: "application/json;charset=utf-8" 
      });
      
      downloadBlob(blob, `${filenameBase}.json`);
      toast.success("JSON exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar JSON:", error);
      toast.error("Falha ao exportar JSON. Tente novamente.");
    }
  }

  async function copyJson() {
    try {
      // Verificar se há dados válidos para copiar
      if (!state) {
        toast.error("Não há dados para copiar.");
        return;
      }

      // Verificar se a API de clipboard está disponível
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        toast.error("Clipboard não disponível neste navegador.");
        return;
      }

      const exportData = {
        ...state,
        exportedAt: new Date().toISOString(),
        exportedBy: "Handout Builder App"
      };

      await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
      toast.success("JSON copiado para a área de transferência!");
    } catch (error) {
      console.error("Erro ao copiar JSON:", error);
      toast.error("Falha ao copiar JSON. Tente novamente.");
    }
  }
  }

  async function importJsonFile(file: File) {
    try {
      // Verificar se é um arquivo JSON
      if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
        toast.error("Por favor, selecione um arquivo JSON válido.");
        return;
      }

      const raw = await file.text();
      
      // Verificar se o arquivo não está vazio
      if (!raw.trim()) {
        toast.error("O arquivo está vazio.");
        return;
      }

      const parsed = JSON.parse(raw) as unknown;
      const normalized = normalizeStateV1(parsed);
      
      if (!normalized) {
        toast.error("Formato de arquivo inválido. Verifique se é um handout exportado corretamente.");
        return;
      }
      
      setState(normalized);
      toast.success("Handout importado com sucesso!");
    } catch (error) {
      console.error("Erro ao importar JSON:", error);
      
      if (error instanceof SyntaxError) {
        toast.error("Arquivo JSON inválido. Verifique a formatação.");
      } else {
        toast.error("Falha ao importar arquivo. Tente novamente.");
      }
    }
  }

  async function setHeaderImage(file: File) {
    try {
      const dataUrl = await fileToDataUrl(file);
      setState((prev) => ({ ...prev, headerImageDataUrl: dataUrl }));
      toast.success("Imagem adicionada.");
    } catch (error) {
      console.error(error);
      toast.error("Falha ao carregar imagem.");
    }
  }

  function resetAll() {
    setState(DEFAULT_STATE);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    toast.message("Resetado.");
  }

  function printPdf() {
    window.print();
  }

  return (
    <div className="handout-builder-app">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[420px_1fr]">
        <aside className="handout-builder-sidebar">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <WandSparkles className="h-4 w-4" />
                Handout Builder
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content">Conteúdo</TabsTrigger>
                  <TabsTrigger value="style">Estilo</TabsTrigger>
                  <TabsTrigger value="export">Exportar</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="mt-4 grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="handout-title">Título</Label>
                    <Input
                      id="handout-title"
                      value={state.title}
                      onChange={(e) => setState((p) => ({ ...p, title: e.target.value }))}
                      placeholder="Título do documento"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="handout-subtitle">Subtítulo</Label>
                    <Input
                      id="handout-subtitle"
                      value={state.subtitle}
                      onChange={(e) => setState((p) => ({ ...p, subtitle: e.target.value }))}
                      placeholder="Uma linha de apoio (opcional)"
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor="handout-body">Corpo (Markdown)</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
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
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void setHeaderImage(file);
                          e.currentTarget.value = "";
                        }}
                      />
                    </div>

                    <Textarea
                      id="handout-body"
                      value={state.body}
                      onChange={(e) => setState((p) => ({ ...p, body: e.target.value }))}
                      rows={12}
                      placeholder="Escreva o conteúdo do seu handout…"
                    />

                    {state.headerImageDataUrl && (
                      <div className="flex items-center justify-between gap-2 rounded-md border border-input bg-muted/20 px-3 py-2">
                        <div className="text-sm text-muted-foreground">Imagem adicionada</div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setState((p) => ({ ...p, headerImageDataUrl: null }))}
                        >
                          Remover
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="handout-footer">Rodapé</Label>
                    <Input
                      id="handout-footer"
                      value={state.footer}
                      onChange={(e) => setState((p) => ({ ...p, footer: e.target.value }))}
                      placeholder="Assinatura, data, etc (opcional)"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="style" className="mt-4 grid gap-4">
                  <div className="grid gap-2">
                    <Label>Template</Label>
                    <Select
                      value={state.template}
                      onValueChange={(v) => setState((p) => ({ ...p, template: v as TemplateId }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TEMPLATE_LABELS).map(([id, label]) => (
                          <SelectItem key={id} value={id}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label>Tamanho</Label>
                      <Select
                        value={state.pageSize}
                        onValueChange={(v) => setState((p) => ({ ...p, pageSize: v as PageSizeId }))}
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
                        value={state.orientation}
                        onValueChange={(v) => setState((p) => ({ ...p, orientation: v as Orientation }))}
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
                      <Label htmlFor="handout-font">Fonte</Label>
                      <Select
                        value={state.fontPreset}
                        onValueChange={(v) => setState((p) => ({ ...p, fontPreset: v as FontPresetId }))}
                      >
                        <SelectTrigger id="handout-font">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(FONT_PRESETS).map(([id, preset]) => (
                            <SelectItem key={id} value={id}>
                              {preset.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="handout-zoom">Zoom ({Math.round(state.zoom * 100)}%)</Label>
                      <input
                        id="handout-zoom"
                        type="range"
                        min={0.25}
                        max={1.25}
                        step={0.05}
                        value={state.zoom}
                        onChange={(e) => setState((p) => ({ ...p, zoom: Number(e.target.value) }))}
                        className="handout-range"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="handout-paper">Papel</Label>
                      <Input
                        id="handout-paper"
                        type="color"
                        value={state.paperColor}
                        onChange={(e) => setState((p) => ({ ...p, paperColor: e.target.value }))}
                        className="h-10 p-1"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="handout-ink">Tinta</Label>
                      <Input
                        id="handout-ink"
                        type="color"
                        value={state.inkColor}
                        onChange={(e) => setState((p) => ({ ...p, inkColor: e.target.value }))}
                        className="h-10 p-1"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="handout-accent">Destaque</Label>
                      <Input
                        id="handout-accent"
                        type="color"
                        value={state.accentColor}
                        onChange={(e) => setState((p) => ({ ...p, accentColor: e.target.value }))}
                        className="h-10 p-1"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="flex items-center justify-between gap-3 rounded-md border border-input px-3 py-2">
                      <div className="grid gap-0.5">
                        <div className="text-sm font-medium">Borda</div>
                        <div className="text-xs text-muted-foreground">Mostrar moldura no documento</div>
                      </div>
                      <Switch
                        checked={state.showBorder}
                        onCheckedChange={(checked) => setState((p) => ({ ...p, showBorder: checked }))}
                      />
                    </div>

                    <div className="rounded-md border border-input px-3 py-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="grid gap-0.5">
                          <div className="text-sm font-medium">Carimbo</div>
                          <div className="text-xs text-muted-foreground">Ex.: CONFIDENCIAL, URGENTE…</div>
                        </div>
                        <Switch
                          checked={state.stampEnabled}
                          onCheckedChange={(checked) => setState((p) => ({ ...p, stampEnabled: checked }))}
                        />
                      </div>

                      {state.stampEnabled && (
                        <div className="mt-3 grid gap-2">
                          <Label htmlFor="handout-stamp-text">Texto do carimbo</Label>
                          <Input
                            id="handout-stamp-text"
                            value={state.stampText}
                            onChange={(e) => setState((p) => ({ ...p, stampText: e.target.value }))}
                            placeholder="CONFIDENCIAL"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="export" className="mt-4 grid gap-3">
                  <div className="grid gap-2">
                    <div className="text-sm text-muted-foreground">
                      Arquivo: <span className="font-mono text-foreground">{filenameBase}</span>
                    </div>
                  </div>

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
                    <Button type="button" variant="outline" onClick={() => jsonFileRef.current?.click()} className="gap-2">
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
              Preview: <span className="font-mono">{derivedPage.width}×{derivedPage.minHeight}px</span>
            </div>
          </div>

          <div className="handout-preview-stage">
            <div style={{ transform: `scale(${state.zoom})`, transformOrigin: "top center" }}>
              <div
                ref={pageRef}
                className={`handout-page handout-print-target ${templateClass} ${borderClass}`}
                style={{
                  ...derivedPage.vars,
                  width: `${derivedPage.width}px`,
                  minHeight: `${derivedPage.minHeight}px`,
                }}
              >
                {state.stampEnabled && state.stampText.trim() && (
                  <div className="handout-stamp" aria-hidden="true">
                    {state.stampText}
                  </div>
                )}

                {state.headerImageDataUrl && (
                  <img
                    src={state.headerImageDataUrl}
                    alt=""
                    className="handout-header-image"
                    loading="eager"
                    decoding="sync"
                  />
                )}

                <header className="handout-header">
                  <div className="handout-title">{state.title}</div>
                  {state.subtitle && <div className="handout-subtitle">{state.subtitle}</div>}
                </header>

                <div className="handout-markdown">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{state.body}</ReactMarkdown>
                </div>

                {state.footer && <footer className="handout-footer">{state.footer}</footer>}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function HandoutBuilderApp() {
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
      <HandoutBuilder />
      <Toaster />
    </PortalContainerProvider>
  );
}

