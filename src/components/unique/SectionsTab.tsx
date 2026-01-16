import React, { useState } from "react";
import { ChevronUp, ChevronDown, ChevronRight, Trash2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { EmojiDisplay } from "@/components/unique/EmojiDisplay";

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

type Stats = BaseStat & (
  | { type: "numeric"; min?: number; max?: number }
  | { type: "enum"; options: number | any[] }
  | { type: "boolean" }
  | { type: "string"; minLength?: number; maxLength?: number }
  | { type: "calculated"; formula: string }
);

interface Section {
  id: number;
  name: LabelLocalization;
  emoji?: string;
  preview: any;
  view_pages: number[];
}

interface SectionsTabProps {
  sections: Section[];
  stats: Stats[];
  onAddSection: () => void;
  onUpdateSection: (index: number, value: Section) => void;
  onRemoveSection: (index: number) => void;
  onMoveSection: (index: number, dir: -1 | 1) => void;
  openSectionIndex?: number | null;
  // Componente auxiliar passado como prop
  SectionEditor: React.ComponentType<{
    value: Section;
    onChange: (v: Section) => void;
    sections: Section[];
    stats: Stats[];
  }>;
}

const SectionsTab: React.FC<SectionsTabProps> = ({
  sections,
  stats,
  onAddSection,
  onUpdateSection,
  onRemoveSection,
  onMoveSection,
  openSectionIndex,
  SectionEditor,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0])); // Primeira seção expandida por padrão
  const [copiedId, setCopiedId] = useState<string | null>(null);

  React.useEffect(() => {
    if (openSectionIndex !== null && openSectionIndex !== undefined) {
      setExpandedSections(prev => new Set([...prev, openSectionIndex]));
      // Scroll to item
      setTimeout(() => {
        const element = document.getElementById(`section-item-${openSectionIndex}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add a temporary highlight effect
          element.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
          setTimeout(() => element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2'), 2000);
        }
      }, 100);
    }
  }, [openSectionIndex]);

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

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
      <div className="mb-3">
        <Button size="sm" className="bg-indigo-500 hover:bg-indigo-600 text-white" onClick={onAddSection}>
          + Adicionar Seção
        </Button>
      </div>
      <div className="grid gap-4">
        {sections.map((sec, i) => (
          <Card 
            key={i} 
            id={`section-item-${i}`}
            className="border-l-4 border-l-indigo-500 hover:shadow-lg transition-all duration-500"
          >
            <Collapsible open={expandedSections.has(i)} onOpenChange={() => toggleSection(i)}>
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <CollapsibleTrigger className="flex items-center gap-2 hover:bg-accent/50 cursor-pointer rounded px-2 py-1 flex-1 transition-colors">
                    <Popover>
                      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Badge 
                          variant="outline" 
                          className="font-mono text-xs cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors"
                        >
                          ID: {sec.id}
                        </Badge>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-2" align="start" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-muted-foreground px-2 py-1">
                            Copiar menção da seção:
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-xs font-mono"
                            onClick={() => copyToClipboard(`<section:${sec.id}:name>`, "Nome")}
                          >
                            {copiedId === `<section:${sec.id}:name>` ? (
                              <Check className="h-3 w-3 mr-2 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3 mr-2" />
                            )}
                            <span className="flex-1 text-left">&lt;section:{sec.id}:name&gt;</span>
                            <span className="text-muted-foreground ml-2">Nome</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-xs font-mono"
                            onClick={() => copyToClipboard(`<section:${sec.id}:emoji>`, "Emoji")}
                          >
                            {copiedId === `<section:${sec.id}:emoji>` ? (
                              <Check className="h-3 w-3 mr-2 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3 mr-2" />
                            )}
                            <span className="flex-1 text-left">&lt;section:{sec.id}:emoji&gt;</span>
                            <span className="text-muted-foreground ml-2">Emoji</span>
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Badge className="bg-indigo-500 text-white">Seção</Badge>
                    <div className="flex items-center gap-2 text-base font-semibold">
                      <EmojiDisplay value={sec.emoji} className="h-5 w-5" />
                      <span>{sec.name?.default || `Seção ${i + 1}`}</span>
                    </div>
                    <ChevronRight className={`h-4 w-4 transition-transform duration-200 ml-auto ${expandedSections.has(i) ? 'rotate-90' : ''}`} />
                  </CollapsibleTrigger>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onMoveSection(i, -1)}
                      title="Mover para cima"
                      disabled={i === 0}
                      className="hover:bg-green-500/10 hover:text-green-500"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onMoveSection(i, +1)}
                      title="Mover para baixo"
                      disabled={i === sections.length - 1}
                      className="hover:bg-green-500/10 hover:text-green-500"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onRemoveSection(i)}
                      title="Remover seção"
                      className="hover:bg-red-500/10 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  <SectionEditor
                    value={sec}
                    onChange={(v) => onUpdateSection(i, v)}
                    sections={sections}
                    stats={stats}
                  />
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </>
  );
};

export default SectionsTab;