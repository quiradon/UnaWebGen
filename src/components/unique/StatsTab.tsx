import React, { useMemo, useState } from "react";
import { Copy, ChevronUp, ChevronDown, ChevronRight, Trash2, Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// Types - importados do editor principal
type Locale = 
  | "id" | "da" | "de" | "en-GB" | "en-US" | "es-ES" | "es-419" | "fr" | "hr" | "it" 
  | "lt" | "hu" | "nl" | "no" | "pl" | "pt-BR" | "ro" | "fi" | "sv-SE" | "vi" | "tr" 
  | "cs" | "el" | "bg" | "ru" | "uk" | "hi" | "th" | "zh-CN" | "ja" | "zh-TW" | "ko" 
  | string;
type LabelString = string & { __brand_label100?: true };
type LabelLocalization = { default: LabelString } & Partial<Record<Locale, LabelString>>;

interface BaseStat {
  id: number;
  type: string;
  name: LabelLocalization;
  edit_page?: number[];
  emoji?: string;
}

// Definindo os types de Stats necessários
type Stats = BaseStat & (
  | { type: "numeric"; min?: number; max?: number }
  | { type: "enum"; options: number | any[] }
  | { type: "boolean" }
  | { type: "string"; minLength?: number; maxLength?: number }
  | { type: "calculated"; formula: string }
);

interface Section {
  emoji: string;
  id: number;
  name: LabelLocalization;
  preview: any;
  view_pages: number[];
}

interface StatsTabProps {
  stats: Stats[];
  sections: Section[];
  onAddStat: (kind: Stats["type"]) => void;
  onUpdateStat: (index: number, value: Stats) => void;
  onRemoveStat: (index: number) => void;
  onDuplicateStat: (index: number) => void;
  onMoveStat: (index: number, dir: -1 | 1) => void;
  // Componente auxiliar passado como prop
  PolymorphicStatEditor: React.ComponentType<{
    value: Stats;
    onChange: (v: Stats) => void;
    sections: Section[];
    allStats: Stats[];
  }>;
}

const StatsTab: React.FC<StatsTabProps> = ({
  stats,
  sections,
  onAddStat,
  onUpdateStat,
  onRemoveStat,
  onDuplicateStat,
  onMoveStat,
  PolymorphicStatEditor,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageFilter, setPageFilter] = useState<string>("all");

  const filteredStats = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return stats.filter((st) => {
      const matchesText = term.length === 0 || [
        String(st.id),
        st.type,
        st.emoji ?? "",
        ...Object.values(st.name ?? {}).filter(Boolean),
      ].some((value) => String(value).toLowerCase().includes(term));

      const matchesPage = pageFilter === "all"
        || (st.edit_page ?? []).includes(Number(pageFilter));

      return matchesText && matchesPage;
    });
  }, [stats, searchTerm, pageFilter]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(text);
      toast.success(`${label} copiado!`);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Falha ao copiar");
    }
  };

  return (
    <>
      <div className="grid gap-2 mb-3 md:grid-cols-[1fr,240px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar stats por nome, ID, tipo ou emoji..."
            className="!pl-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={pageFilter} onValueChange={setPageFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por página" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as páginas</SelectItem>
            {sections.map((section) => (
              <SelectItem key={section.id} value={String(section.id)}>
                {section.emoji && `${section.emoji} `}
                {section.name?.default ?? `Seção ${section.id}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => onAddStat("numeric")}>
          + Numeric
        </Button>
        <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white" onClick={() => onAddStat("enum")}>
          + Enum
        </Button>
        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => onAddStat("boolean")}>
          + Boolean
        </Button>
        <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => onAddStat("string")}>
          + String
        </Button>
        <Button size="sm" className="bg-pink-500 hover:bg-pink-600 text-white" onClick={() => onAddStat("calculated")}>
          + Calculated
        </Button>
      </div>
      <div className="grid gap-4">
        {filteredStats.map((st, i) => (
          <Card key={i} className="relative border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-end gap-1 absolute top-2 right-2 z-10">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDuplicateStat(i)}
                title="Duplicar stat"
                className="hover:bg-blue-500/10 hover:text-blue-500"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onMoveStat(i, -1)}
                title="Mover para cima"
                className="hover:bg-green-500/10 hover:text-green-500"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onMoveStat(i, +1)}
                title="Mover para baixo"
                className="hover:bg-green-500/10 hover:text-green-500"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onRemoveStat(i)}
                title="Remover stat"
                className="hover:bg-red-500/10 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Collapsible defaultOpen={false}>
              <CollapsibleTrigger className="w-full text-left hover:bg-accent/50 transition-colors">
                <CardHeader className="py-3 pr-32">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Badge 
                          variant="outline" 
                          className="font-mono text-xs cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors"
                        >
                          ID: {st.id}
                        </Badge>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-2" align="start" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-muted-foreground px-2 py-1">
                            Copiar menção do stat:
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-xs font-mono"
                            onClick={() => copyToClipboard(`<stat:${st.id}:value>`, "Valor")}
                          >
                            {copiedId === `<stat:${st.id}:value>` ? (
                              <Check className="h-3 w-3 mr-2 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3 mr-2" />
                            )}
                            <span className="flex-1 text-left">&lt;stat:{st.id}:value&gt;</span>
                            <span className="text-muted-foreground ml-2">Valor</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-xs font-mono"
                            onClick={() => copyToClipboard(`<stat:${st.id}:name>`, "Nome")}
                          >
                            {copiedId === `<stat:${st.id}:name>` ? (
                              <Check className="h-3 w-3 mr-2 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3 mr-2" />
                            )}
                            <span className="flex-1 text-left">&lt;stat:{st.id}:name&gt;</span>
                            <span className="text-muted-foreground ml-2">Nome</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-xs font-mono"
                            onClick={() => copyToClipboard(`<stat:${st.id}:emoji>`, "Emoji")}
                          >
                            {copiedId === `<stat:${st.id}:emoji>` ? (
                              <Check className="h-3 w-3 mr-2 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3 mr-2" />
                            )}
                            <span className="flex-1 text-left">&lt;stat:{st.id}:emoji&gt;</span>
                            <span className="text-muted-foreground ml-2">Emoji</span>
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Badge variant={
                      st.type === 'numeric' ? 'blue' :
                      st.type === 'enum' ? 'purple' :
                      st.type === 'boolean' ? 'green' :
                      st.type === 'string' ? 'orange' :
                      st.type === 'calculated' ? 'pink' : 'secondary'
                    }>{st.type}</Badge>
                    <span>{st.emoji && `${st.emoji} `}{st.name?.default || `Stat ${i + 1}`}</span>
                    <ChevronRight className="h-4 w-4 transition-transform duration-200 ui-state-open:rotate-90" />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <PolymorphicStatEditor
                    value={st}
                    onChange={(v) => onUpdateStat(i, v)}
                    sections={sections}
                    allStats={stats}
                  />
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
        {filteredStats.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-6">
            Nenhum stat encontrado com os filtros atuais.
          </div>
        )}
      </div>
    </>
  );
};

export default StatsTab;
