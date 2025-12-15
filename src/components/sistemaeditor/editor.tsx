import { useMemo, useRef, useState } from "react";
import {
  BarChart3,
  ClipboardPaste,
  Layers,
  Plus,
  Plug,
  Settings,
  Trash2,
  Download,
  Upload,
  Copy,
  ChevronDown,
  ChevronUp,
  X,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import EmojiPickerReact, { EmojiStyle, Theme } from "emoji-picker-react";
import { CompactMarkdownLocalizationEditor as NewCompactMarkdownEditor } from "@/components/unique/CompactMarkdownLocalizationEditor";
import DiceNotationModal from "@/components/unique/DiceNotationModal";
import { NotionStyleRender } from "@/components/unique/NotionStyleRender";
import { evaluate } from "mathjs";
import MathExpressionModal from "@/components/unique/MathExpressionModal";
import ConfigTab from "@/components/unique/ConfigTab";
import StatsTab from "@/components/unique/StatsTab";
import SectionsTab from "@/components/unique/SectionsTab";
import IntegrationsTab from "@/components/unique/IntegrationsTab";
import { MentionInput } from "@/components/unique/MentionInput";
import { TemplatesModal } from "@/components/unique/TemplatesModal";

// =====================
// Types
// =====================
export type Locale =
  | "id" | "da" | "de" | "en-GB" | "en-US" | "es-ES" | "es-419" | "fr" | "hr" | "it"
  | "lt" | "hu" | "nl" | "no" | "pl" | "pt-BR" | "ro" | "fi" | "sv-SE" | "vi" | "tr"
  | "cs" | "el" | "bg" | "ru" | "uk" | "hi" | "th" | "zh-CN" | "ja" | "zh-TW" | "ko"
  | string;

type Localization<T = string> = { default: T } & Partial<Record<Locale, T>>;

type LabelString = string & { __brand_label100?: true };

export type LabelLocalization = { default: LabelString } & Partial<Record<Locale, LabelString>>;

interface BaseStat {
  id: number;
  name: LabelLocalization;
  edit_page?: number[]; // Seções (por ids) onde o stat pode ser editado
  emoji?: string;
}

interface StatsNumeric extends BaseStat { type: "numeric"; min?: number; max?: number; dices?: Dice[]; replacements?: Replacement[]; }
interface StatsEnumOption { value: number; name: LabelLocalization; emoji?: string; }
interface StatsEnum extends BaseStat { type: "enum"; options: StatsEnumOption[] | number; dices?: Dice[]; replacements?: Replacement[]; }
interface StatsBoolean extends BaseStat { type: "boolean"; dices?: Dice[]; replacements?: Replacement[]; }
interface StatsString extends BaseStat { type: "string"; maxLength?: number; minLength?: number; }
interface StatsCalculated extends BaseStat { type: "calculated"; formula: string; dices?: Dice[]; replacements?: Replacement[]; }
interface Replacement { key: number; options: number[]; }

export type Stats = StatsNumeric | StatsEnum | StatsBoolean | StatsString | StatsCalculated;

export interface RPGSystem {
  config: { id: number; name: LabelLocalization; description: Localization<string>; };
  stats: Stats[];
  sections: Section[];
  integrations?: Integrations;
}

interface Section {
  id: number;
  name: LabelLocalization;
  emoji?: string;
  preview: { type: "string" | "img"; content: Localization<string>; };
  view_pages: number[]; // Seções (ids) onde ESTA seção também aparece (para aglomerar com outras páginas)
}

interface Dice { expression: string; condition?: { value1: string; operator: "<" | ">" | "<=" | ">=" | "==" | "!="; value2: string; }; }

// =====================
// Integration Types
// =====================
interface Integrations {
  iniciative?: {
    dice_notation: string;
  };
  atributes_roll?: string;
  schemas: NexusSchemas[];
  autorized_status_ids?: number[]
}

// =====================
// Locale Names Mapping
// =====================
const LOCALE_NAMES: Record<string, string> = {
  "id": "Indonesian (Bahasa Indonesia)",
  "da": "Danish (Dansk)",
  "de": "German (Deutsch)",
  "en-GB": "English, UK",
  "en-US": "English, US",
  "es-ES": "Spanish (Español)",
  "es-419": "Spanish, LATAM (Español, LATAM)",
  "fr": "French (Français)",
  "hr": "Croatian (Hrvatski)",
  "it": "Italian (Italiano)",
  "lt": "Lithuanian (Lietuviškai)",
  "hu": "Hungarian (Magyar)",
  "nl": "Dutch (Nederlands)",
  "no": "Norwegian (Norsk)",
  "pl": "Polish (Polski)",
  "pt-BR": "Portuguese, Brazilian (Português do Brasil)",
  "ro": "Romanian (Română)",
  "fi": "Finnish (Suomi)",
  "sv-SE": "Swedish (Svenska)",
  "vi": "Vietnamese (Tiếng Việt)",
  "tr": "Turkish (Türkçe)",
  "cs": "Czech (Čeština)",
  "el": "Greek (Ελληνικά)",
  "bg": "Bulgarian (български)",
  "ru": "Russian (Pусский)",
  "uk": "Ukrainian (Українська)",
  "hi": "Hindi (हिन्दी)",
  "th": "Thai (ไทย)",
  "zh-CN": "Chinese, China (中文)",
  "ja": "Japanese (日本語)",
  "zh-TW": "Chinese, Taiwan (繁體中文)",
  "ko": "Korean (한국어)",
  "default": "Default"
};

function getLocaleName(locale: Locale | "default"): string {
  return LOCALE_NAMES[locale] || locale;
}

interface NexusSchemas {
  id: number;
  name: LabelLocalization;
  description: Localization<string>;
  fields?: {
    [key: number]: SchemaEval;
  };
  AutorizedModifierList: any[];
  authorized_status_ids: number[];
}

interface SchemaEval {
  name: LabelLocalization;
  type: "eval";
  options: SchemaOption[];
}

interface SchemaOption {
  value: string;
  label: LabelLocalization;
}

// =====================
// Helpers
// =====================
const emptyLabelLoc = (): LabelLocalization => ({ default: "" });
function clone<T>(v: T): T { return JSON.parse(JSON.stringify(v)); }
function download(filename: string, text: string) {
  const element = document.createElement("a");
  const file = new Blob([text], { type: "application/json" });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element); element.click(); element.remove();
}
function nextId(list: { id: number }[]): number { return (list.reduce((m, x) => Math.max(m, x.id), 0) || 0) + 1; }
function allLocalesFrom(value: Localization<string>, base: Locale[]): (Locale | "default")[] {
  const keys = Object.keys(value || {}) as (Locale | "default")[];
  const set = new Set<Locale | "default">(["default", ...base, ...keys.filter((k) => k !== "default")]);
  return Array.from(set);
}

// Função para detectar dependências recursivas entre stats calculated
function findStatDependencies(formula: string): number[] {
  const regex = /<stat:(\d+):value>/g;
  const dependencies: number[] = [];
  let match;

  while ((match = regex.exec(formula)) !== null) {
    const statId = parseInt(match[1]);
    if (!dependencies.includes(statId)) {
      dependencies.push(statId);
    }
  }

  return dependencies;
}

function hasCircularDependency(
  currentStatId: number,
  formula: string,
  allStats: Stats[]
): boolean {
  const visited = new Set<number>();

  function checkRecursive(statId: number, currentFormula: string): boolean {
    if (visited.has(statId)) {
      return true; // Ciclo detectado
    }

    visited.add(statId);
    const dependencies = findStatDependencies(currentFormula);

    for (const depId of dependencies) {
      if (depId === currentStatId) {
        return true; // Referência circular direta
      }

      const depStat = allStats.find(s => s.id === depId);
      if (depStat && depStat.type === 'calculated') {
        if (checkRecursive(depId, depStat.formula)) {
          return true;
        }
      }
    }

    visited.delete(statId);
    return false;
  }

  return checkRecursive(currentStatId, formula);
}

// =====================
// Smart Preview Components
// =====================
// =====================
// Compact Localization Editors
// =====================
function CompactTextLocalizationEditor({ value, onChange, label, placeholder, locales = ["pt-BR", "en-US", "es-ES", "fr", "de", "it", "ru", "zh-CN", "ja", "ko"] }: { value: Localization<string>; onChange: (v: Localization<string>) => void; label: string; placeholder?: string; locales?: Locale[]; }) {
  const [curr, setCurr] = useState<Locale | "default">("default");
  const all = allLocalesFrom(value, locales);
  const update = (k: Locale | "default", v: string) => onChange({ ...value, [k]: v });
  return (
    <Card className="border-dashed">
      <CardHeader className="py-3"><CardTitle className="text-sm flex items-center gap-2">{label}
        <Select value={String(curr)} onValueChange={(value) => setCurr(value as any)}>
          <SelectTrigger className="ml-auto w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {all.map((opt) => (
              <SelectItem key={String(opt)} value={String(opt)}>{getLocaleName(opt)}</SelectItem>
            ))}
          </SelectContent>
        </Select></CardTitle></CardHeader>
      <CardContent>
        <Input
          value={(value as any)[curr] ?? ""}
          placeholder={curr === "default" ? (placeholder ?? "Obrigatório") : `${placeholder ?? "Opcional"} (${curr})`}
          onChange={(e) => update(curr, e.target.value)}
          maxLength={100}
          showCharCount={true}
        />
      </CardContent>
    </Card>
  );
}
// Usando o novo componente de Markdown com estilo Notion
const CompactMarkdownLocalizationEditor = NewCompactMarkdownEditor;
function LabelLocalizationEditor({ value, onChange, label, locales = ["pt-BR", "en-US", "es-ES", "fr", "de", "it", "ru", "zh-CN", "ja", "ko"] }: { value: LabelLocalization; onChange: (v: LabelLocalization) => void; label: string; locales?: Locale[]; }) {
  return (<CompactTextLocalizationEditor value={value as any} onChange={(v) => onChange(v as LabelLocalization)} label={label} placeholder="rótulo curto (ex.: Força)" locales={locales} />);
}

// =====================
// SingleSelect de Seção (para stats) - DEPRECATED: Use MultiSelectSections
// =====================
// function SingleSelectSection({ sections, value, onChange, placeholder = "Selecionar seção", includeDefault = false }:{ sections:Section[]; value:number|undefined; onChange:(id?:number)=>void; placeholder?:string; includeDefault?:boolean; }){
//   return (
//     <Select value={value !== undefined ? String(value) : "-999"} onValueChange={(val) => {
//       if (val === "-999") {
//         onChange(undefined);
//       } else {
//         onChange(parseInt(val));
//       }
//     }}>
//       <SelectTrigger>
//         <SelectValue placeholder={placeholder} />
//       </SelectTrigger>
//       <SelectContent>
//         <SelectItem value="-999">Nenhuma seção</SelectItem>
//         {includeDefault && <SelectItem value="-1">Padrão</SelectItem>}
//         {sections.map((section) => (
//           <SelectItem key={section.id} value={String(section.id)}>
//             {section.emoji && `${section.emoji} `}{section.name?.default || `Seção ${section.id}`}
//           </SelectItem>
//         ))}
//       </SelectContent>
//     </Select>
//   );
// }

// =====================
// MultiSelect de Seções (reusável)
// =====================
function MultiSelectSections({ sections, value, onChange, placeholder = "Selecionar seções", includeDefault = false }: { sections: Section[]; value: number[] | undefined; onChange: (ids: number[]) => void; placeholder?: string; includeDefault?: boolean; }) {
  const [open, setOpen] = useState(false);
  const selected = new Set(value ?? []);

  const toggle = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onChange(Array.from(next));
  };

  const labelFor = (id: number) => {
    if (id === -1) return "Padrão";
    return sections.find((s) => s.id === id)?.name?.default ?? String(id);
  };
  const selectedLabels = Array.from(selected).map(labelFor);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          <div className="flex flex-wrap gap-1 items-center">
            {selected.size === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <>
                {selectedLabels.slice(0, 3).map((label, i) => (
                  <Badge key={i} variant="secondary" className="mr-1">
                    {label}
                  </Badge>
                ))}
                {selected.size > 3 && (
                  <Badge variant="outline">+{selected.size - 3}</Badge>
                )}
              </>
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px]" align="start">
        <div className="p-2">
          <div className="relative">
            <Input
              placeholder="Buscar seção..."
              className="mb-2"
            />
          </div>
          <ScrollArea className="max-h-64">
            <div className="space-y-1">
              {includeDefault && (
                <div
                  key={-1}
                  className="flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer border-b"
                  onClick={() => toggle(-1)}
                >
                  <Checkbox
                    checked={selected.has(-1)}
                    onCheckedChange={() => toggle(-1)}
                  />
                  <span className="flex-1 font-medium">
                    🏠 Padrão
                  </span>
                </div>
              )}
              {sections.length === 0 ? (
                <div className="text-sm text-muted-foreground p-2">
                  Nenhuma seção encontrada.
                </div>
              ) : (
                sections.map((section) => (
                  <div
                    key={section.id}
                    className="flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    onClick={() => toggle(section.id)}
                  >
                    <Checkbox
                      checked={selected.has(section.id)}
                      onCheckedChange={() => toggle(section.id)}
                    />
                    <span className="flex-1">
                      {section.emoji && `${section.emoji} `}
                      {section.name?.default ?? `Seção ${section.id}`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// =====================
// EmojiPicker (usando biblioteca externa)
// =====================
function CustomEmojiPicker({ value, onChange, placeholder = "ex.: 🗡️" }: { value?: string; onChange: (v: string) => void; placeholder?: string; }) {
  const [open, setOpen] = useState(false);

  const handleEmojiClick = (emojiData: any) => {
    onChange(emojiData.emoji);
    setOpen(false);
    toast.success("Emoji selecionado!");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start font-normal">
          {value || <span className="text-muted-foreground">{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <EmojiPickerReact
          onEmojiClick={handleEmojiClick}
          autoFocusSearch={false}
          width={320}
          height={420}
          emojiStyle={EmojiStyle.TWITTER}
          theme={Theme.AUTO}
          searchPlaceholder="Buscar emojis..."
          previewConfig={{
            defaultEmoji: "1f44d",
            defaultCaption: "Escolha um emoji!"
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

// =====================
// Dice, Replacement Editors
// =====================
function DiceEditor({ value, onChange, stats = [] }: { value: Dice[] | undefined; onChange: (v?: Dice[]) => void; stats?: Stats[]; }) {
  const dices = value ?? [];
  const [showDiceEditor, setShowDiceEditor] = useState(false);
  const [editingDiceIndex, setEditingDiceIndex] = useState<number>(-1);
  const [tempExpression, setTempExpression] = useState("");
  const closeDiceEditor = () => {
    setShowDiceEditor(false);
    setEditingDiceIndex(-1);
    setTempExpression("");
  };

  const add = () => {
    const newDice = { expression: "1d20" };
    onChange([...dices, newDice]);
    setEditingDiceIndex(dices.length);
    setTempExpression("1d20");
    setShowDiceEditor(true);
  };

  const remove = (i: number) => onChange(dices.filter((_, idx) => idx !== i));

  const set = (i: number, patch: Partial<Dice>) => onChange(dices.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));

  const openDiceEditor = (index: number) => {
    setEditingDiceIndex(index);
    setTempExpression(dices[index]?.expression || "1d20");
    setShowDiceEditor(true);
  };

  const confirmDiceExpression = (expression: string) => {
    if (editingDiceIndex >= 0 && editingDiceIndex < dices.length) {
      set(editingDiceIndex, { expression });
    }
    closeDiceEditor();
    toast.success("ExpressA�o de dados atualizada!");
  };

  const moveUp = (index: number) => {
    if (index > 0) {
      const newDices = [...dices];
      [newDices[index - 1], newDices[index]] = [newDices[index], newDices[index - 1]];
      onChange(newDices);
    }
  };

  const moveDown = (index: number) => {
    if (index < dices.length - 1) {
      const newDices = [...dices];
      [newDices[index], newDices[index + 1]] = [newDices[index + 1], newDices[index]];
      onChange(newDices);
    }
  };

  return (
    <Card className="border-l-4 border-l-teal-500">
      <CardHeader className="py-3 bg-gradient-to-r from-teal-500/10 to-transparent">
        <CardTitle className="text-sm flex items-center gap-2">
          🎲 Dados (Sistema de Condições)
          <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white ml-auto" onClick={add}>
            <Plus className="h-4 w-4" /> Adicionar dado
          </Button>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Os dados são executados de cima para baixo. Primeiro dado com condição válida (ou sem condição) é executado.
        </p>
      </CardHeader>
      <CardContent className="grid gap-3">
        {dices.length === 0 && (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            <div className="text-2xl mb-2">🎲</div>
            <p className="text-sm">Nenhum dado configurado.</p>
            <p className="text-xs">Adicione dados para criar sistema de rolagem.</p>
          </div>
        )}

        {dices.map((d, i) => (
          <Card key={i} className={`${i === dices.length - 1 && !d.condition ? 'border-green-500 border-2 bg-green-500/10' : 'border-dashed hover:border-teal-500/50'}`}>
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={i === dices.length - 1 && !d.condition ? "green" : "blue"}>
                    {i === dices.length - 1 && !d.condition ? "🎯 Padrão" : `Dado ${i + 1}`}
                  </Badge>
                  <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                    {d.expression || "1d20"}
                  </code>
                  {d.condition && (
                    <Badge variant="orange" className="text-xs">
                      Se: {d.condition.value1} {d.condition.operator} {d.condition.value2}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                    title="Mover para cima"
                    className="hover:bg-green-500/10 hover:text-green-500"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => moveDown(i)}
                    disabled={i === dices.length - 1}
                    title="Mover para baixo"
                    className="hover:bg-green-500/10 hover:text-green-500"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openDiceEditor(i)}
                    title="Editar expressao"
                    className="hover:bg-teal-500/10 hover:text-teal-600"
                  >
                    Editor completo
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(i)}
                    title="Remover dado"
                    className="hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3">

              {/* Condição (opcional exceto para o último) */}
              {i < dices.length - 1 && (
                <div className="grid gap-2">
                  <Label className="text-xs">Condição (quando executar este dado)</Label>
                  <div className="grid md:grid-cols-3 gap-2">
                    <div className="flex gap-2 items-center">
                      <Label className="min-w-16 text-xs">Valor 1</Label>
                      <MentionInput
                        value={d.condition?.value1 ?? ""}
                        onChange={(newValue) => set(i, { condition: { ...(d.condition ?? { operator: "==", value1: "", value2: "" }), value1: newValue } })}
                        stats={stats}
                        placeholder="Digite @ para listar stats ou <stat:1:value>"
                        className="text-xs font-mono"
                        maxLength={100}
                        showCharCount={true}
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <Label className="min-w-16 text-xs">Operador</Label>
                      <Select
                        value={d.condition?.operator ?? "=="}
                        onValueChange={(val) => set(i, { condition: { ...(d.condition ?? { operator: "==", value1: "", value2: "" }), operator: val as any } })}
                      >
                        <SelectTrigger className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="==">=</SelectItem>
                          <SelectItem value="!=">≠</SelectItem>
                          <SelectItem value="<">&lt;</SelectItem>
                          <SelectItem value=">">&gt;</SelectItem>
                          <SelectItem value="<=">&le;</SelectItem>
                          <SelectItem value=">=">&ge;</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Label className="min-w-16 text-xs">Valor 2</Label>
                      <MentionInput
                        value={d.condition?.value2 ?? ""}
                        onChange={(newValue) => set(i, { condition: { ...(d.condition ?? { operator: "==", value1: "", value2: "" }), value2: newValue } })}
                        stats={stats}
                        placeholder="Digite @ para listar stats ou <stat:2:value>"
                        className="text-xs font-mono"
                        maxLength={100}
                        showCharCount={true}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    🧮 <strong>Suporte a expressões matemáticas:</strong> Use &lt;stat:ID:value&gt; para variáveis,
                    operações como (10 + 5), funções como max(5, 10), etc. Digite <strong>@</strong> para listar os stats disponíveis.
                  </p>

                  {/* Preview da condição */}
                  {d.condition?.value1 && d.condition?.value2 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
                      <div className="text-xs font-medium text-blue-700 mb-1">Preview da condição:</div>
                      <code className="text-xs text-blue-600">
                        {(() => {
                          try {
                            // Substituir variáveis por valores exemplo para preview
                            const previewValue1 = d.condition.value1.replace(/<stat:(\d+):value>/g, (_, id) => {
                              const stat = stats.find(s => s.id === parseInt(id));
                              if (!stat) return '3';
                              switch (stat.type) {
                                case 'numeric':
                                  return stat.min !== undefined ? String(stat.min) : '3';
                                case 'boolean':
                                  return '1';
                                case 'enum':
                                  if (Array.isArray(stat.options) && stat.options.length > 0) {
                                    const first = stat.options[0];
                                    if (typeof first === 'number') return String(first);
                                    if (first && typeof first === 'object') {
                                      const value = (first as any).value ?? Object.values(first)[0];
                                      if (typeof value === 'number') return String(value);
                                    }
                                  }
                                  return '2';
                                default:
                                  return '3';
                              }
                            });

                            const previewValue2 = d.condition.value2.replace(/<stat:(\d+):value>/g, (_, id) => {
                              const stat = stats.find(s => s.id === parseInt(id));
                              if (!stat) return '3';
                              switch (stat.type) {
                                case 'numeric':
                                  return stat.max !== undefined ? String(stat.max) : '5';
                                case 'boolean':
                                  return '0';
                                case 'enum':
                                  if (Array.isArray(stat.options) && stat.options.length > 1) {
                                    const first = stat.options[1];
                                    if (typeof first === 'number') return String(first);
                                    if (first && typeof first === 'object') {
                                      const value = (first as any).value ?? Object.values(first)[0];
                                      if (typeof value === 'number') return String(value);
                                    }
                                  }
                                  if (Array.isArray(stat.options) && stat.options.length > 0) {
                                    const first = stat.options[0];
                                    if (typeof first === 'number') return String(first);
                                  }
                                  return '1';
                                default:
                                  return '5';
                              }
                            });

                            // Avaliar expressões matemáticas se necessário
                            let evalValue1: any = previewValue1;
                            let evalValue2: any = previewValue2;

                            try {
                              if (isNaN(Number(previewValue1)) && previewValue1.includes('(')) {
                                evalValue1 = String(evaluate(previewValue1));
                              }
                            } catch {
                              evalValue1 = previewValue1;
                            }

                            try {
                              if (isNaN(Number(previewValue2)) && previewValue2.includes('(')) {
                                evalValue2 = String(evaluate(previewValue2));
                              }
                            } catch {
                              evalValue2 = previewValue2;
                            }

                            return `${evalValue1} ${d.condition.operator} ${evalValue2}`;
                          } catch {
                            return '[Erro na avaliação da condição]';
                          }
                        })()}
                      </code>
                    </div>
                  )}
                </div>
              )}

              {i === dices.length - 1 && !d.condition && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-center gap-2 text-green-700">
                    <span className="text-lg">🎯</span>
                    <div>
                      <div className="font-medium text-sm">Dado Padrão</div>
                      <div className="text-xs">Este dado será executado se nenhuma condição anterior for válida.</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Editor de Dice Notation Modal */}
        <DiceNotationModal
          isOpen={showDiceEditor}
          onClose={closeDiceEditor}
          value={tempExpression}
          onChange={setTempExpression}
          onConfirm={confirmDiceExpression}
          stats={stats as any}
          title={editingDiceIndex >= 0 ? `Editor de dado ${editingDiceIndex + 1}` : "Novo dado"}
        />
      </CardContent>
    </Card>
  );
}

// =====================
// ReplacementEditor - Sistema de substituições baseado nos stats
// =====================
function ReplacementEditor({ value, onChange, stats = [], dices = [] }: {
  value: Replacement[] | undefined;
  onChange: (v?: Replacement[]) => void;
  stats?: Stats[];
  dices?: Dice[];
}) {
  const replacements = value ?? [];
  const [searchFilter, setSearchFilter] = useState("");

  // Função para extrair IDs de stats usados nas expressões de dados
  const getStatsUsedInDices = (): number[] => {
    const usedStatIds = new Set<number>();

    dices.forEach(dice => {
      if (dice.expression) {
        // Procurar por <stat:ID:value> na expressão
        const regex = /<stat:(\d+):value>/g;
        let match;
        while ((match = regex.exec(dice.expression)) !== null) {
          const statId = parseInt(match[1]);
          usedStatIds.add(statId);
        }
      }

      // Também verificar nas condições
      if (dice.condition) {
        const checkConditionValue = (value: string) => {
          const regex = /<stat:(\d+):value>/g;
          let match;
          while ((match = regex.exec(value)) !== null) {
            const statId = parseInt(match[1]);
            usedStatIds.add(statId);
          }
        };

        checkConditionValue(dice.condition.value1);
        checkConditionValue(dice.condition.value2);
      }
    });

    return Array.from(usedStatIds);
  };

  // Filtrar stats que podem ser usados como chaves - apenas os que são realmente usados nos dados
  const usedStatIds = getStatsUsedInDices();
  const validKeyStats = stats.filter(stat =>
    usedStatIds.includes(stat.id) &&
    (stat.type === 'numeric' ||
      stat.type === 'boolean' ||
      stat.type === 'enum' ||
      stat.type === 'calculated')
  );

  // Filtrar stats que podem ser opções de substituição (todos não-string)
  const validOptionStats = stats.filter(stat =>
    stat.type === 'numeric' ||
    stat.type === 'boolean' ||
    stat.type === 'enum' ||
    stat.type === 'calculated'
  );

  // Filtrar stats baseado na busca
  const filteredValidOptionStats = validOptionStats.filter(stat => {
    if (!searchFilter.trim()) return true;

    const searchTerm = searchFilter.toLowerCase();
    const statName = (stat.name?.default || '').toLowerCase();
    const statType = stat.type.toLowerCase();
    const statId = stat.id.toString();

    return statName.includes(searchTerm) ||
      statType.includes(searchTerm) ||
      statId.includes(searchTerm);
  });

  const add = () => {
    if (validKeyStats.length === 0) {
      return; // Não pode adicionar sem stats válidos
    }

    const newReplacement: Replacement = {
      key: validKeyStats[0].id,
      options: [validKeyStats[0].id] // Incluir a própria key por padrão
    };
    onChange([...replacements, newReplacement]);
  };

  const remove = (i: number) => onChange(replacements.filter((_, idx) => idx !== i));

  const set = (i: number, patch: Partial<Replacement>) =>
    onChange(replacements.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const toggleOption = (replacementIndex: number, statId: number) => {
    const replacement = replacements[replacementIndex];
    const currentOptions = replacement.options || [];

    if (currentOptions.includes(statId)) {
      // Remover da lista
      const newOptions = currentOptions.filter(id => id !== statId);
      set(replacementIndex, { options: newOptions });
    } else {
      // Adicionar à lista
      const newOptions = [...currentOptions, statId];
      set(replacementIndex, { options: newOptions });
    }
  };

  const getStatById = (id: number) => stats.find(s => s.id === id);

  return (
    <Card className="border-l-4 border-l-amber-500">
      <CardHeader className="py-3 bg-gradient-to-r from-amber-500/10 to-transparent">
        <CardTitle className="text-sm flex items-center gap-2">
          🔄 Sistema de Substituições (Replacements)
          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white ml-auto" onClick={add} disabled={validKeyStats.length === 0}>
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Configure quais stats podem ser substituídos por outros durante as rolagens.
          Apenas stats usados nas expressões de dados deste card podem ser configurados como chaves.
        </p>
      </CardHeader>
      <CardContent className="grid gap-3">
        {validKeyStats.length === 0 && usedStatIds.length === 0 && (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            <div className="text-2xl mb-2">🎲</div>
            <p className="text-sm">Nenhum dado configurado ainda.</p>
            <p className="text-xs">Configure dados primeiro para poder criar substituições.</p>
          </div>
        )}

        {validKeyStats.length === 0 && usedStatIds.length > 0 && (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            <div className="text-2xl mb-2">⚠️</div>
            <p className="text-sm">Stats usados nos dados não são compatíveis.</p>
            <p className="text-xs">Apenas stats numéricos, booleanos, enum ou calculados podem ter substituições.</p>
          </div>
        )}
        {replacements.length === 0 && validKeyStats.length > 0 && (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            <div className="text-2xl mb-2">🔄</div>
            <p className="text-sm">Nenhuma substituição configurada.</p>
            <p className="text-xs">Adicione substituições para permitir trocas de stats nas rolagens.</p>
          </div>
        )}

        {replacements.map((replacement, i) => {
          const keyStat = getStatById(replacement.key);

          return (
            <Card key={i} className="border-dashed hover:border-amber-500/50 hover:shadow-md transition-all">
              <CardHeader className="py-3 bg-gradient-to-r from-amber-500/5 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="orange">Substituição {i + 1}</Badge>
                    {keyStat && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🔑</span>
                        <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                          {keyStat.emoji && `${keyStat.emoji} `}
                          {keyStat.name?.default || `Stat ${keyStat.id}`}
                        </code>
                      </div>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(i)}
                    title="Remover substituição"
                    className="hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3">

                {/* Seleção da chave (stat principal) */}
                <div className="grid gap-2">
                  <Label className="text-xs">Stat Principal (chave)</Label>
                  <Select
                    value={String(replacement.key)}
                    onValueChange={(val) => {
                      const newKey = parseInt(val);
                      const currentOptions = replacement.options || [];

                      // Garantir que a nova key está nas opções
                      const newOptions = currentOptions.includes(newKey)
                        ? currentOptions
                        : [...currentOptions, newKey];

                      set(i, { key: newKey, options: newOptions });
                    }}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {validKeyStats.map((stat) => (
                        <SelectItem key={stat.id} value={String(stat.id)}>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              stat.type === 'numeric' ? 'blue' :
                                stat.type === 'enum' ? 'purple' :
                                  stat.type === 'boolean' ? 'green' :
                                    stat.type === 'string' ? 'orange' :
                                      stat.type === 'calculated' ? 'pink' : 'secondary'
                            }>{stat.type}</Badge>
                            <span>
                              {stat.emoji && `${stat.emoji} `}
                              {stat.name?.default || `Stat ${stat.id}`}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    O stat que poderá ser substituído nas rolagens.
                  </p>
                </div>

                {/* Opções de substituição */}
                <div className="grid gap-2">
                  <Label className="text-xs">
                    Opções de Substituição ({(replacement.options || []).length} selecionadas{searchFilter ? ` • ${filteredValidOptionStats.length} de ${validOptionStats.length} exibidos` : ''})
                  </Label>

                  {/* Campo de busca */}
                  <div className="relative">
                    <Input
                      placeholder="Buscar stats por nome, tipo ou ID..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="text-xs"
                      maxLength={50}
                    />
                    {searchFilter && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-1 top-1 h-6 w-6"
                        onClick={() => setSearchFilter("")}
                        title="Limpar busca"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  <ScrollArea className="h-32 border rounded-md p-2">
                    {filteredValidOptionStats.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        {searchFilter ?
                          `Nenhum stat encontrado para "${searchFilter}"` :
                          "Nenhum stat disponível para substituição."
                        }
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {filteredValidOptionStats.map((stat) => {
                          const isSelected = (replacement.options || []).includes(stat.id);
                          const isKey = stat.id === replacement.key;

                          return (
                            <div
                              key={stat.id}
                              className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-muted'
                                }`}
                              onClick={() => toggleOption(i, stat.id)}
                            >
                              <Checkbox
                                checked={isSelected}
                                onChange={() => toggleOption(i, stat.id)}
                              />
                              <Badge variant={
                                stat.type === 'numeric' ? 'blue' :
                                  stat.type === 'enum' ? 'purple' :
                                    stat.type === 'boolean' ? 'green' :
                                      stat.type === 'calculated' ? 'pink' : 'secondary'
                              }>{stat.type}</Badge>
                              <div className="flex-1">
                                <div className="font-medium text-sm">
                                  {stat.emoji && `${stat.emoji} `}
                                  {stat.name?.default || `Stat ${stat.id}`}
                                  {isKey && <span className="text-xs text-muted-foreground ml-2">(chave)</span>}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                  <p className="text-xs text-muted-foreground">
                    Stats que podem substituir o stat principal. Clique para selecionar/deselecionar.
                  </p>
                </div>

                {/* Preview das substituições */}
                {(replacement.options || []).length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <div className="text-xs font-medium text-blue-700 mb-2">Preview:</div>
                    <div className="text-xs text-blue-600">
                      <strong>{keyStat?.name?.default || `Stat ${replacement.key}`}</strong> pode ser substituído por:{' '}
                      {(replacement.options || [])
                        .map(optionId => {
                          const optionStat = getStatById(optionId);
                          return optionStat?.name?.default || `Stat ${optionId}`;
                        })
                        .join(', ')}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
}

// =====================
// Stat Editors
// =====================
function BaseStatFields({ stat, onPatch, sections }: { stat: BaseStat; onPatch: (p: Partial<BaseStat>) => void; sections: Section[] }) {
  return (
    <div className="grid gap-3">
      <div className="grid md:grid-cols-3 gap-3">
        <div className="grid gap-2"><Label>Emoji</Label><CustomEmojiPicker value={stat.emoji ?? ""} onChange={(v) => onPatch({ emoji: v })} /></div>
        <div className="grid gap-2 md:col-span-2"><Label>Páginas editáveis (seções)</Label>
          <MultiSelectSections sections={sections} value={stat.edit_page} onChange={(ids) => onPatch({ edit_page: ids })} placeholder="Selecione as seções onde este stat é editável" />
        </div>
      </div>
      <LabelLocalizationEditor label="Nome (localizado)" value={stat.name} onChange={(v) => onPatch({ name: v } as any)} />
    </div>
  );
}
function StatNumericEditor({ value, onChange, sections, allStats = [] }: {
  value: StatsNumeric;
  onChange: (v: StatsNumeric) => void;
  sections: Section[];
  allStats?: Stats[];
}) {
  const [showLimits, setShowLimits] = useState<boolean>(
    value.min !== undefined || value.max !== undefined
  );

  const patch = (p: Partial<StatsNumeric>) => onChange({ ...value, ...p });

  const handleLimitsToggle = (enabled: boolean) => {
    setShowLimits(enabled);
    if (!enabled) {
      // Remove min/max quando desabilitado
      const { min, max, ...rest } = value;
      onChange(rest as StatsNumeric);
    } else {
      // Define valores padrão quando habilitado
      patch({ min: value.min ?? -100000, max: value.max ?? 100000 });
    }
  };

  return (
    <div className="grid gap-4">
      <BaseStatFields stat={value} onPatch={patch} sections={sections} />

      <div className="flex items-center space-x-2">
        <Switch
          id="limits-toggle"
          checked={showLimits}
          onCheckedChange={handleLimitsToggle}
        />
        <Label htmlFor="limits-toggle">Definir limites (min/max)</Label>
      </div>

      {showLimits && (
        <div className="grid md:grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Mínimo</Label>
            <Input
              type="number"
              value={value.min ?? -100000}
              onChange={(e) => patch({ min: Number(e.target.value) })}
              min={-100000}
              max={100000}
            />
          </div>
          <div className="grid gap-2">
            <Label>Máximo</Label>
            <Input
              type="number"
              value={value.max ?? 100000}
              onChange={(e) => patch({ max: Number(e.target.value) })}
              min={-100000}
              max={100000}
            />
          </div>
        </div>
      )}

      <DiceEditor value={value.dices} onChange={(v) => patch({ dices: v })} stats={allStats} />
      <ReplacementEditor value={value.replacements} onChange={(v) => patch({ replacements: v })} stats={allStats} dices={value.dices} />
    </div>
  );
}
function OptionEditor({ value, onChange }: { value: StatsEnumOption; onChange: (v: StatsEnumOption) => void }) {
  const patch = (p: Partial<StatsEnumOption>) => onChange({ ...value, ...p });
  return (
    <div className="grid gap-3 border rounded-xl p-3">
      <div className="grid md:grid-cols-3 gap-2">
        <div className="grid gap-2">
          <Label>Valor</Label>
          <Input
            type="number"
            value={value.value}
            onChange={(e) => patch({ value: Number(e.target.value) })}
          />
        </div>
        <div className="grid gap-2">
          <Label>Emoji</Label>
          <CustomEmojiPicker
            value={value.emoji ?? ""}
            onChange={(v) => patch({ emoji: v })}
          />
        </div>
      </div>
      <LabelLocalizationEditor
        label="Nome (localizado)"
        value={value.name}
        onChange={(v) => patch({ name: v } as any)}
      />
    </div>
  );
}
function StatEnumEditor({ value, onChange, sections, allStats }: { value: StatsEnum; onChange: (v: StatsEnum) => void; sections: Section[]; allStats: Stats[] }) {
  const [expandedOptions, setExpandedOptions] = useState<Set<number>>(new Set([0])); // Primeira opção expandida por padrão

  const patch = (p: Partial<StatsEnum>) => onChange({ ...value, ...p });
  const isNumberCompat = typeof value.options === "number";
  const opts = (Array.isArray(value.options) ? value.options : []) as StatsEnumOption[];

  // Verificar valores duplicados
  const duplicateValues = opts.reduce((acc, option, index) => {
    const duplicateIndex = opts.findIndex((o, i) => i !== index && o.value === option.value);
    if (duplicateIndex !== -1) {
      acc.add(option.value);
    }
    return acc;
  }, new Set<number>());

  const addOption = () => {
    if (opts.length >= 25) {
      toast.error("Máximo de 25 opções permitidas");
      return;
    }
    const newIndex = opts.length;
    patch({ options: [...opts, { value: (opts.at(-1)?.value ?? 0) + 1, name: emptyLabelLoc() }] });
    // Expandir a nova opção automaticamente
    setExpandedOptions(prev => new Set([...prev, newIndex]));
  };

  const setOption = (i: number, v: StatsEnumOption) => patch({ options: opts.map((o, idx) => (idx === i ? v : o)) });
  const removeOption = (i: number) => {
    patch({ options: opts.filter((_, idx) => idx !== i) });
    // Remover do conjunto de expandidos
    setExpandedOptions(prev => {
      const newSet = new Set(prev);
      newSet.delete(i);
      // Reajustar índices dos itens expandidos após a remoção
      const adjustedSet = new Set<number>();
      newSet.forEach(index => {
        if (index > i) {
          adjustedSet.add(index - 1);
        } else {
          adjustedSet.add(index);
        }
      });
      return adjustedSet;
    });
  };

  const toggleExpanded = (index: number) => {
    setExpandedOptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Filtrar stats que são enum e têm lista de opções (não ID)
  const availableEnumStats = allStats.filter(stat =>
    stat.type === "enum" &&
    Array.isArray(stat.options) &&
    stat.options.length > 0 &&
    stat.id !== value.id // Não incluir o próprio stat
  ) as StatsEnum[];

  return (
    <div className="grid gap-4">
      <BaseStatFields stat={value} onPatch={patch} sections={sections} />
      <div className="flex items-center gap-2">
        <Switch
          checked={!isNumberCompat}
          onCheckedChange={(ch) => patch({ options: ch ? [] : 0 })}
        />
        <span className="text-sm">Usar lista de opções próprias (desligado = referenciar outro enum)</span>
      </div>

      {isNumberCompat ? (
        <div className="grid gap-2">
          <Label>Referenciar opções de outro Enum</Label>
          {availableEnumStats.length === 0 ? (
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md text-center">
              📭 Não existem outros enums com opções disponíveis.
              <br />
              <span className="text-xs">Crie outros enums com lista de opções para poder referenciá-los aqui.</span>
            </div>
          ) : (
            <>
              <Select
                value={typeof value.options === "number" && value.options > 0 ? String(value.options) : ""}
                onValueChange={(val) => {
                  const numVal = parseInt(val);
                  if (!isNaN(numVal) && numVal > 0) {
                    patch({ options: numVal });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um enum com opções definidas" />
                </SelectTrigger>
                <SelectContent>
                  {availableEnumStats.map((stat) => (
                    <SelectItem key={stat.id} value={String(stat.id)}>
                      {stat.emoji && `${stat.emoji} `}
                      {stat.name?.default || `Stat ${stat.id}`}
                      {Array.isArray(stat.options) && ` (${stat.options.length} opções)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {typeof value.options === "number" && value.options > 0 && (
                <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                  <strong>Referenciando:</strong> {(() => {
                    const referencedStat = availableEnumStats.find(s => s.id === value.options);
                    if (referencedStat && Array.isArray(referencedStat.options)) {
                      return `${referencedStat.name?.default || `Stat ${referencedStat.id}`} com ${referencedStat.options.length} opções`;
                    }
                    return "Enum não encontrado";
                  })()}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          <div className="flex justify-between items-center">
            <div>
              <Label>Opções Próprias</Label>
              <p className="text-xs text-muted-foreground">
                {opts.length}/25 opções
                {duplicateValues.size > 0 && (
                  <span className="text-red-500 ml-2">
                    ⚠️ Valores duplicados: {Array.from(duplicateValues).join(', ')}
                  </span>
                )}
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={addOption}
              disabled={opts.length >= 25}
            >
              <Plus className="h-4 w-4" /> Adicionar opção
            </Button>
          </div>
          {opts.length === 0 && <p className="text-sm text-muted-foreground">Sem opções.</p>}
          <div className="grid gap-3">{opts.map((o, i) => (
            <Collapsible key={i} open={expandedOptions.has(i)} onOpenChange={() => toggleExpanded(i)}>
              <Card className={duplicateValues.has(o.value) ? "border-red-200 border-2" : ""}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="py-3 cursor-pointer hover:bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{o.emoji || "📋"}</span>
                        <div>
                          <div className="font-medium text-sm">
                            {o.name?.default || `Opção ${o.value}`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Valor: {o.value}
                            {duplicateValues.has(o.value) && (
                              <span className="text-red-500 ml-2">⚠️ Duplicado</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeOption(i);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {expandedOptions.has(i) ?
                          <ChevronUp className="h-4 w-4" /> :
                          <ChevronDown className="h-4 w-4" />
                        }
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <OptionEditor value={o} onChange={(v) => setOption(i, v)} />
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}</div>
        </div>
      )}

      <DiceEditor value={value.dices} onChange={(v) => patch({ dices: v })} stats={allStats} />
      <ReplacementEditor value={value.replacements} onChange={(v) => patch({ replacements: v })} stats={allStats} dices={value.dices} />
    </div>
  );
}
function StatBooleanEditor({ value, onChange, sections, allStats = [] }: {
  value: StatsBoolean;
  onChange: (v: StatsBoolean) => void;
  sections: Section[];
  allStats?: Stats[];
}) {
  const patch = (p: Partial<StatsBoolean>) => onChange({ ...value, ...p });
  return (
    <div className="grid gap-4">
      <BaseStatFields stat={value} onPatch={patch} sections={sections} />
      <DiceEditor value={value.dices} onChange={(v) => patch({ dices: v })} stats={allStats} />
      <ReplacementEditor value={value.replacements} onChange={(v) => patch({ replacements: v })} stats={allStats} dices={value.dices} />
    </div>
  );
}
function StatStringEditor({ value, onChange, sections }: { value: StatsString; onChange: (v: StatsString) => void; sections: Section[] }) {
  const [showLimits, setShowLimits] = useState<boolean>(
    value.minLength !== undefined || value.maxLength !== undefined
  );

  const patch = (p: Partial<StatsString>) => onChange({ ...value, ...p });

  const handleLimitsToggle = (enabled: boolean) => {
    setShowLimits(enabled);
    if (!enabled) {
      // Remove minLength/maxLength quando desabilitado
      const { minLength, maxLength, ...rest } = value;
      onChange(rest as StatsString);
    } else {
      // Define valores padrão quando habilitado
      patch({ minLength: value.minLength ?? 0, maxLength: value.maxLength ?? 100 });
    }
  };

  return (
    <div className="grid gap-4">
      <BaseStatFields stat={value} onPatch={patch} sections={sections} />

      <div className="flex items-center space-x-2">
        <Switch
          id="string-limits-toggle"
          checked={showLimits}
          onCheckedChange={handleLimitsToggle}
        />
        <Label htmlFor="string-limits-toggle">Definir limites de caracteres</Label>
      </div>

      {showLimits && (
        <div className="grid md:grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Mín. caracteres</Label>
            <Input
              type="number"
              value={value.minLength ?? 0}
              onChange={(e) => patch({ minLength: Number(e.target.value) })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Máx. caracteres</Label>
            <Input
              type="number"
              value={value.maxLength ?? 100}
              onChange={(e) => patch({ maxLength: Number(e.target.value) })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
function StatCalculatedEditor({ value, onChange, sections, allStats }: { value: StatsCalculated; onChange: (v: StatsCalculated) => void; sections: Section[]; allStats: Stats[] }) {
  const [showMathEditor, setShowMathEditor] = useState(false);
  const [tempFormula, setTempFormula] = useState("");

  const patch = (p: Partial<StatsCalculated>) => onChange({ ...value, ...p });

  // Filtrar stats que podem ser usados (excluir o próprio stat e stats que dependem dele)
  const getAvailableStats = () => {
    return allStats.filter(stat => {
      // Excluir o próprio stat
      if (stat.id === value.id) return false;

      // Excluir stats do tipo string
      if (stat.type === 'string') return false;

      // Para stats calculated, verificar se não criariam ciclo
      if (stat.type === 'calculated') {
        // Simular se incluir este stat criaria recursão
        const testFormula = `${value.formula} + <stat:${stat.id}:value>`;
        if (hasCircularDependency(value.id, testFormula, allStats)) {
          return false;
        }
      }

      return true;
    });
  };

  const openMathEditor = () => {
    setTempFormula(value.formula || "");
    setShowMathEditor(true);
  };

  const confirmFormula = (formula: string) => {
    // Verificar se a nova fórmula não cria recursão
    if (hasCircularDependency(value.id, formula, allStats)) {
      toast.error("Esta fórmula criaria uma dependência circular!");
      return;
    }

    patch({ formula });
    setShowMathEditor(false);
    setTempFormula("");
    toast.success("Fórmula atualizada!");
  };

  return (
    <div className="grid gap-4">
      <BaseStatFields stat={value} onPatch={patch} sections={sections} />
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label>F�rmula</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={openMathEditor}
            className="flex items-center gap-2"
          >
            ?? Abrir Editor Matem�tico
          </Button>
        </div>
        <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 p-3">
          {value.formula ? (
            <div className="font-mono text-sm text-foreground">
              <NotionStyleRender content={value.formula} stats={allStats} sections={sections} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhuma f�rmula definida. Clique em "Abrir Editor Matem�tico" para configurar.
            </p>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          As vari�veis aparecem como chips. Use o editor matem�tico para montar ou ajustar a express�o.
        </p>
      </div>
      <DiceEditor value={value.dices} onChange={(v) => patch({ dices: v })} stats={allStats} />
      <ReplacementEditor value={value.replacements} onChange={(v) => patch({ replacements: v })} stats={allStats} dices={value.dices} />

      {/* Editor Matemático Modal */}
      <MathExpressionModal
        isOpen={showMathEditor}
        onClose={() => setShowMathEditor(false)}
        value={tempFormula}
        onChange={setTempFormula}
        onConfirm={confirmFormula}
        stats={getAvailableStats()}
        title="Editor de Fórmula Calculada"
      />
    </div>
  );
}
function PolymorphicStatEditor({ value, onChange, sections, allStats }: { value: Stats; onChange: (v: Stats) => void; sections: Section[]; allStats: Stats[] }) {
  return (
    <div className="grid gap-4">
      {value.type === "numeric" && <StatNumericEditor value={value} onChange={onChange as any} sections={sections} allStats={allStats} />}
      {value.type === "enum" && <StatEnumEditor value={value} onChange={onChange as any} sections={sections} allStats={allStats} />}
      {value.type === "boolean" && <StatBooleanEditor value={value} onChange={onChange as any} sections={sections} allStats={allStats} />}
      {value.type === "string" && <StatStringEditor value={value} onChange={onChange as any} sections={sections} />}
      {value.type === "calculated" && <StatCalculatedEditor value={value} onChange={onChange as any} sections={sections} allStats={allStats} />}
    </div>
  );
}

// =====================
// Section Editor (agora usa MultiSelectSections para view_pages)
// =====================
function SectionEditor({ value, onChange, sections, stats = [] }: { value: Section; onChange: (v: Section) => void; sections: Section[]; stats?: Stats[]; }) {
  const patch = (p: Partial<Section>) => onChange({ ...value, ...p });
  // Você pode optar por filtrar a própria seção da lista se não quiser permitir self-reference:
  const sectionChoices = sections; // .filter((s)=>s.id!==value.id)

  return (
    <div className="grid gap-4">
      <div className="grid md:grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Emoji</Label>
          <CustomEmojiPicker value={value.emoji ?? ""} onChange={(v) => patch({ emoji: v })} />
        </div>
        <div className="grid gap-2">
          <Label>Páginas exibidas (seções)</Label>
          <MultiSelectSections
            sections={sectionChoices}
            value={value.view_pages}
            onChange={(ids) => patch({ view_pages: ids })}
            placeholder="Selecione em quais páginas (seções) essa seção também aparece"
            includeDefault={true}
          />
        </div>
      </div>
      <LabelLocalizationEditor label="Nome (localizado)" value={value.name} onChange={(v) => patch({ name: v } as any)} />
      <Card>
        <CardHeader className="py-3"><CardTitle className="text-sm">Preview</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid md:grid-cols-3 gap-3"><div className="grid gap-2"><Label>Tipo</Label>
            <Select value={value.preview.type} onValueChange={(val) => patch({ preview: { ...value.preview, type: val as any } })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="string">string</SelectItem>
                <SelectItem value="img">img</SelectItem>
              </SelectContent>
            </Select></div></div>
          {value.preview.type === "string" ? (
            <CompactMarkdownLocalizationEditor
              value={value.preview.content}
              onChange={(v) => patch({ preview: { ...value.preview, content: v } })}
              label="Conteúdo (Markdown)"
              sections={sections as any}
              stats={stats as any}
            />
          ) : (
            <CompactTextLocalizationEditor value={value.preview.content} onChange={(v) => patch({ preview: { ...value.preview, content: v } })} label="URL da imagem" placeholder="https://..." />
          )}
        </CardContent>
      </Card>
      <div className="text-xs text-muted-foreground">Dica: você pode referenciar variáveis como <code>&lt;stat:ID:name&gt;</code> no Markdown.</div>
    </div>
  );
}

// =====================
// Validators
// =====================
function validate(system: RPGSystem): string[] {
  console.log("Validating system:", system);
  const errs: string[] = [];
  if (!system) {
    return ["Sistema inválido (null ou undefined)"];
  }

  if (!system.config?.id && system.config?.id !== 0) errs.push("config.id é obrigatório");
  if (!system.config?.name?.default) errs.push("config.name.default é obrigatório");
  if (system.config?.name?.default && system.config.name.default.length > 100) errs.push(`config.name.default excede 100 caracteres (${system.config.name.default.length})`);

  if (!Array.isArray(system.stats)) {
    errs.push("stats deve ser um array");
  } else {
    const ids = new Set<number>();
    system.stats.forEach((s, idx) => {
      if (ids.has(s.id)) errs.push(`stats[${idx}] id duplicado: ${s.id}`);
      ids.add(s.id);
      if (!s.name?.default) errs.push(`stats[${idx}].name.default é obrigatório`);
      if (s.name?.default && s.name.default.length > 100) errs.push(`stats[${idx}].name.default excede 100 caracteres (${s.name.default.length})`);
      if (s.type === "numeric") {
        const n = s as StatsNumeric;
        if (typeof n.min === "number" && typeof n.max === "number" && n.min! > n.max!) errs.push(`stats[${idx}] min > max`);
      }
      if (s.type === "enum") {
        const e = s as StatsEnum;
        if (Array.isArray(e.options)) {
          if (e.options.length > 25) errs.push(`stats[${idx}] excede o limite de 25 opções (${e.options.length})`);
          const seen = new Set<number>();
          e.options.forEach((o, j) => {
            if (seen.has(o.value)) errs.push(`stats[${idx}].options[${j}].value duplicado: ${o.value}`);
            seen.add(o.value);
            if (!o.name?.default) errs.push(`stats[${idx}].options[${j}].name.default é obrigatório`);
            if (o.name?.default && o.name.default.length > 100) errs.push(`stats[${idx}].options[${j}].name.default excede 100 caracteres (${o.name.default.length})`);
          });
        }
      }
      if (s.type === "calculated") {
        const c = s as StatsCalculated;
        if (!c.formula) errs.push(`stats[${idx}].formula é obrigatório`);
        if (c.formula && c.formula.length > 200) errs.push(`stats[${idx}].formula excede 200 caracteres (${c.formula.length})`);

        // Verificar se há dependências circulares
        if (c.formula && hasCircularDependency(c.id, c.formula, system.stats)) {
          errs.push(`stats[${idx}] tem dependência circular na fórmula`);
        }

        // Verificar se as variáveis referenciadas existem
        const dependencies = findStatDependencies(c.formula);
        dependencies.forEach(depId => {
          const depStat = system.stats.find(s => s.id === depId);
          if (!depStat) {
            errs.push(`stats[${idx}].formula referencia stat inexistente: ${depId}`);
          } else if (depStat.type === 'string') {
            errs.push(`stats[${idx}].formula referencia stat do tipo string: ${depId}`);
          }
        });
      }
    });
  }

  if (!Array.isArray(system.sections)) {
    errs.push("sections deve ser um array");
  } else {
    const secIds = new Set<number>();
    system.sections.forEach((sec, i) => {
      if (secIds.has(sec.id)) errs.push(`sections[${i}] id duplicado: ${sec.id}`);
      secIds.add(sec.id);
      if (!sec.name?.default) errs.push(`sections[${i}].name.default é obrigatório`);
      if (sec.name?.default && sec.name.default.length > 100) errs.push(`sections[${i}].name.default excede 100 caracteres (${sec.name.default.length})`);
      if (!sec.preview?.type) errs.push(`sections[${i}].preview.type é obrigatório`);
    });
  }
  return errs;
}

// =====================
// Main Component
// =====================
export default function RPGSystemBuilder() {
  const [system, setSystem] = useState<RPGSystem>({
    config: {
      id: 1,
      name: { default: "Guia de Componentes" },
      description: {
        default:
          "Coleção demonstrativa com exemplos usando condicionais, dados, expressões matemáticas e integrações. Substitua os textos conforme o seu sistema."
      }
    },
    stats: [
      {
        id: 1,
        type: "numeric",
        name: { default: "Vida Máxima" },
        emoji: "❤️",
        min: 0,
        max: 50,
        edit_page: [2],
        dices: [
          {
            expression: "2d10 + <stat:2:value>",
            condition: {
              value1: "<stat:4:value>",
              operator: "==",
              value2: "1"
            }
          },
          {
            expression: "2d8 + <stat:2:value>"
          }
        ],
        replacements: [
          { key: 2, options: [2, 6] },
          { key: 4, options: [4, 2] }
        ]
      },
      {
        id: 2,
        type: "numeric",
        name: { default: "Agilidade" },
        emoji: "⚡",
        min: -5,
        max: 10,
        edit_page: [2]
      },
      {
        id: 3,
        type: "enum",
        name: { default: "Estilo de Combate" },
        emoji: "🛡️",
        options: [
          { value: 1, emoji: "🗡️", name: { default: "Duelista" } },
          { value: 2, emoji: "🏹", name: { default: "Atirador" } },
          { value: 3, emoji: "🪄", name: { default: "Arcanista" } }
        ],
        edit_page: [3]
      },
      {
        id: 4,
        type: "boolean",
        name: { default: "Em Foco de Batalha" },
        emoji: "🔥",
        edit_page: [3]
      },
      {
        id: 5,
        type: "string",
        name: { default: "Frase de Efeito" },
        emoji: "💬",
        minLength: 5,
        maxLength: 120,
        edit_page: [1]
      },
      {
        id: 6,
        type: "calculated",
        name: { default: "Iniciativa Total" },
        emoji: "🚀",
        formula: "<stat:2:value> + (<stat:3:value> == 2) * 2 + (<stat:4:value> == 1) * 5",
        edit_page: [2]
      }
    ],
    sections: [
      {
        id: 1,
        name: { default: "Guia Rápido" },
        emoji: "📘",
        preview: {
          type: "string",
          content: {
            default: [
              "# Bem-vindo ao gerador 👋",
              "Este sistema já vem com componentes configurados para você testar.",
              "",
              "## Tokens básicos",
              "- Vida total mencionada: <stat:1:value>",
              "- Chip com nome do stat: <stat:1:name>",
              "- Outra seção referenciada: <section:2:name>",
              "",
              "## Condicionais",
              "<if:<math:<stat:4:value> == 1:>>",
              "🔥 O personagem está em foco de batalha!",
              "<else>",
              "🛌 Sem foco ativo — ajuste a flag \"Em Foco de Batalha\".",
              "</if>",
              "",
              "## Expressões matemáticas",
              "Resultado da fórmula de iniciativa: <math:<stat:2:value> + (<stat:3:value> == 2) * 2 + (<stat:4:value> == 1) * 5:>",
              "",
              "Use este conteúdo como base e substitua pelos textos do seu sistema."
            ].join("\n")
          }
        },
        view_pages: [1, 2]
      },
      {
        id: 2,
        name: { default: "Stats e Dados" },
        emoji: "🎲",
        preview: {
          type: "string",
          content: {
            default: [
              "## Stats configurados",
              "- `Vida Máxima` (numeric) com limites, dados condicionais e replacements.",
              "- `Agilidade` (numeric) alimenta cálculos e dados.",
              "- `Estilo de Combate` (enum) mostra opções com emoji.",
              "- `Em Foco de Batalha` (boolean) alterna mensagens e bônus.",
              "- `Frase de Efeito` (string) com limites de caracteres.",
              "- `Iniciativa Total` (calculated) demonstra <math:> com comparações.",
              "",
              "### Rolagens configuradas",
              "O card de Vida Máxima possui duas entradas na área de dados:",
              "1. Se `<stat:4:value>` for 1, usa o dado: `2d10 + <stat:2:value>`.",
              "2. Caso contrário, cai no dado padrão `2d8 + <stat:2:value>`.",
              "",
              "Use o botão \"Editar\" na aba de stats para abrir os editores completos."
            ].join("\n")
          }
        },
        view_pages: [2]
      },
      {
        id: 3,
        name: { default: "Imagem Exemplo" },
        emoji: "🖼️",
        preview: {
          type: "img",
          content: {
            default: "https://picsum.photos/seed/rpg-demo/800/360"
          }
        },
        view_pages: [1, 3]
      }
    ],
    integrations: {
      iniciative: {
        dice_notation: "1d20 + <stat:2:value> + <math:(<stat:4:value> == 1) * 3:>"
      },
      atributes_roll: "<math:<stat:1:value> / 5 + <stat:2:value>:>",
      schemas: [
        {
          id: 0,
          name: { default: "Ficha Simplificada" },
          description: {
            default: "Mostra como combinar stats, condicionais e opções avaliadas automaticamente."
          },
          fields: {
            1: {
              name: { default: "vida_total" as LabelString },
              type: "eval",
              options: [
                { value: "<stat:1:value>", label: { default: "Vida base" as LabelString } },
                {
                  value: "<math:<stat:1:value> + (<stat:4:value> == 1) * 5:>",
                  label: { default: "Vida com foco" as LabelString }
                }
              ]
            },
            2: {
              name: { default: "estilo" as LabelString },
              type: "eval",
              options: [
                {
                  value: "<stat:3:value>",
                  label: { default: "Estilo selecionado (valor enum)" as LabelString }
                }
              ]
            }
          },
          AutorizedModifierList: [],
          authorized_status_ids: [1, 99]
        }
      ]
    }
  });
  const [selectedTab, setSelectedTab] = useState<string>("config");
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const errors = useMemo(() => validate(system), [system]);

  const handleLoadTemplate = (newSystem: RPGSystem) => {
    console.log("Loading template:", newSystem);
    setSystem(newSystem);
    setSelectedTab("config");
  };

  const addStat = (kind: Stats["type"]) => {
    const id = nextId(system.stats); const base = { id, name: { default: "Novo Stat" } } as BaseStat; let stat: Stats;
    switch (kind) {
      case "numeric": stat = { ...base, type: "numeric", min: -100000, max: 100000 } as StatsNumeric; break;
      case "enum": stat = { ...base, type: "enum", options: [] } as StatsEnum; break;
      case "boolean": stat = { ...base, type: "boolean" } as StatsBoolean; break;
      case "string": stat = { ...base, type: "string", minLength: 0, maxLength: 200 } as StatsString; break;
      case "calculated": stat = { ...base, type: "calculated", formula: "" } as StatsCalculated; break;
    }
    setSystem({ ...system, stats: [...system.stats, stat] }); setSelectedTab("stats");
  };
  const updateStat = (index: number, v: Stats) => { const copy = clone(system); copy.stats[index] = v; setSystem(copy); };
  const removeStat = (index: number) => { const copy = clone(system); copy.stats.splice(index, 1); setSystem(copy); };
  const duplicateStat = (index: number) => {
    const copy = clone(system);
    const originalStat = copy.stats[index];
    const newId = nextId(copy.stats);
    const duplicatedStat = {
      ...originalStat,
      id: newId,
      name: {
        ...originalStat.name,
        default: `${originalStat.name?.default || 'Stat'} (Cópia)`
      }
    };
    copy.stats.splice(index + 1, 0, duplicatedStat);
    setSystem(copy);
  };
  const moveStat = (index: number, dir: -1 | 1) => { const copy = clone(system); const j = index + dir; if (j < 0 || j >= copy.stats.length) return; const tmp = copy.stats[index]; copy.stats[index] = copy.stats[j]; copy.stats[j] = tmp; setSystem(copy); };

  const addSection = () => { setSystem({ ...system, sections: [...system.sections, { id: nextId(system.sections), name: { default: "Nova Seção" }, preview: { type: "string", content: { default: "" } }, view_pages: [] }] }); setSelectedTab("sections"); };
  const updateSection = (index: number, v: Section) => { const copy = clone(system); copy.sections[index] = v; setSystem(copy); };
  const removeSection = (index: number) => { const copy = clone(system); copy.sections.splice(index, 1); setSystem(copy); };
  const moveSection = (index: number, dir: -1 | 1) => { const copy = clone(system); const j = index + dir; if (j < 0 || j >= copy.sections.length) return; const tmp = copy.sections[index]; copy.sections[index] = copy.sections[j]; copy.sections[j] = tmp; setSystem(copy); };

  const exportJson = () => { const text = JSON.stringify(system, null, 2); download(`rpg-system-${system.config.name.default || system.config.id}.json`, text); };
  const fileRef = useRef<HTMLInputElement | null>(null);
  const importJson = (file: File) => { const reader = new FileReader(); reader.onload = () => { try { const parsed = JSON.parse(String(reader.result)); setSystem(parsed); toast.success("Importado com sucesso!"); } catch { toast.error("Falha ao importar JSON"); } }; reader.readAsText(file); };
  const importFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text || text.trim() === '') {
        toast.error("Área de transferência está vazia");
        return;
      }
      const parsed = JSON.parse(text);
      setSystem(parsed);
      toast.success("Sistema importado do clipboard com sucesso!");
    } catch (err) {
      if (err instanceof SyntaxError) {
        toast.error("Conteúdo do clipboard não é um JSON válido");
      } else {
        toast.error("Falha ao importar do clipboard");
      }
    }
  };
  const copyJson = async () => { try { await navigator.clipboard.writeText(JSON.stringify(system, null, 2)); toast.success("JSON copiado para a área de transferência"); } catch { toast.error("Não foi possível copiar o JSON"); } };

  return (
    <div className="flex min-h-[78vh] w-full bg-background overflow-hidden">
      {/* Barra Lateral */}
      <aside className="hidden w-64 transition-all duration-300 bg-gradient-to-b from-sidebar to-sidebar/95 border-r border-border flex flex-col relative">
        <div className="p-6 border-b border-border/50 relative">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Editor de Sistema</h1>
          <p className="text-xs text-sidebar-foreground/70 mt-1">Construtor visual de sistemas</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <button
            onClick={() => setSelectedTab("config")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${selectedTab === "config"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            title="Configuração"
          >
            <span className="text-xl">⚙️</span>
            <span className="font-medium">Configuração</span>
          </button>

          <button
            onClick={() => setSelectedTab("stats")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${selectedTab === "stats"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            title="Stats"
          >
            <span className="text-xl">📊</span>
            <div className="flex-1 text-left">
              <span className="font-medium block">Stats</span>
              <span className="text-xs opacity-70">{system.stats.length} itens</span>
            </div>
          </button>

          <button
            onClick={() => setSelectedTab("sections")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${selectedTab === "sections"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            title="Seções"
          >
            <span className="text-xl">📄</span>
            <div className="flex-1 text-left">
              <span className="font-medium block">Seções</span>
              <span className="text-xs opacity-70">{system.sections.length} itens</span>
            </div>
          </button>

          <button
            onClick={() => setSelectedTab("integrations")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${selectedTab === "integrations"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            title="Integrações"
          >
            <span className="text-xl">🔌</span>
            <span className="font-medium">Integrações</span>
          </button>
        </nav>

        <div className="p-3 border-t border-border/50 space-y-2">
          <Button onClick={exportJson} className="w-full justify-start bg-green-600 hover:bg-green-700 text-white">
            <Download className="h-4 w-4 mr-2" /> Exportar
          </Button>
          <Button variant="outline" onClick={copyJson} className="w-full justify-start">
            <Copy className="h-4 w-4 mr-2" /> Copiar
          </Button>
          <Button variant="outline" onClick={() => setShowTemplatesModal(true)} className="w-full justify-start hover:bg-purple-500/10 hover:text-purple-500 hover:border-purple-500">
            <Globe className="h-4 w-4 mr-2" /> Sistemas Implementados
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()} className="w-full justify-start">
            <Upload className="h-4 w-4 mr-2" /> Importar Arquivo
          </Button>
          <Button variant="outline" onClick={importFromClipboard} className="w-full justify-start hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500">
            <Copy className="h-4 w-4 mr-2" /> Colar do Clipboard
          </Button>
        </div>

      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-[1600px] mx-auto">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <TabsList className="w-full lg:w-auto justify-start bg-sidebar-accent/60">
                  <TabsTrigger value="config" className="gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Configuração</span>
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Stats</span>
                    <Badge variant="secondary" className="hidden sm:inline-flex">
                      {system.stats.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="sections" className="gap-2">
                    <Layers className="h-4 w-4" />
                    <span>Seções</span>
                    <Badge variant="secondary" className="hidden sm:inline-flex">
                      {system.sections.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="integrations" className="gap-2">
                    <Plug className="h-4 w-4" />
                    <span>Integrações</span>
                  </TabsTrigger>
                </TabsList>

                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={exportJson} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                    <Download className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Exportar</span>
                  </Button>
                  <Button variant="outline" onClick={copyJson} size="sm">
                    <Copy className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Copiar</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={importFromClipboard}
                    size="sm"
                    className="hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500"
                  >
                    <ClipboardPaste className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Colar</span>
                  </Button>
                  <Button variant="outline" onClick={() => fileRef.current?.click()} size="sm">
                    <Upload className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Importar</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowTemplatesModal(true)}
                    size="sm"
                    className="hover:bg-purple-500/10 hover:text-purple-500 hover:border-purple-500"
                  >
                    <Globe className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Sistemas</span>
                  </Button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={(e) => e.target.files && importJson(e.target.files[0])}
                  />
                </div>
              </div>
          {errors.length > 0 && (
            <Card className="border-red-500/40 bg-red-500/5 mb-6">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span className="text-red-500">⚠️</span>
                  Validação
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-1">
                {errors.map((er, i) => (<div key={i} className="text-sm text-red-500">• {er}</div>))}
              </CardContent>
            </Card>
          )}

              <TabsContent value="config" className="mt-0">
                <ConfigTab
                  value={system.config}
                  onChange={(v) => setSystem({ ...system, config: v })}
                  LabelLocalizationEditor={LabelLocalizationEditor}
                  CompactTextLocalizationEditor={CompactTextLocalizationEditor}
                />
              </TabsContent>

              <TabsContent value="stats" className="mt-0">
                <StatsTab
                  stats={system.stats as any}
                  sections={system.sections as any}
                  onAddStat={addStat}
                  onUpdateStat={updateStat}
                  onRemoveStat={removeStat}
                  onDuplicateStat={duplicateStat}
                  onMoveStat={moveStat}
                  PolymorphicStatEditor={PolymorphicStatEditor as any}
                />
              </TabsContent>

              <TabsContent value="sections" className="mt-0">
                <SectionsTab
                  sections={system.sections as any}
                  stats={system.stats as any}
                  onAddSection={addSection}
                  onUpdateSection={updateSection}
                  onRemoveSection={removeSection}
                  onMoveSection={moveSection}
                  SectionEditor={SectionEditor as any}
                />
              </TabsContent>

              <TabsContent value="integrations" className="mt-0">
                <IntegrationsTab
                  integrations={system.integrations}
                  stats={system.stats}
                  onUpdateIntegrations={(integrations) => setSystem({ ...system, integrations })}
                  LabelLocalizationEditor={LabelLocalizationEditor}
                  CompactTextLocalizationEditor={CompactTextLocalizationEditor}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>

      <TemplatesModal
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        onSelectSystem={handleLoadTemplate}
      />
    </div>
  );
}
