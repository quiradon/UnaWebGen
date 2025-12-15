import { useCallback, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { evaluate } from "mathjs";
import {
  Bold,
  Code,
  GitBranch,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  FileText,
  Strikethrough,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { NotionStyleEditor } from "./NotionStyleEditor";
import type { NotionStyleEditorHandle } from "./NotionStyleEditor";
import { normalizeSingleEquals } from "@/lib/utils";

type StatOption = { value: number; name: { default: string; [key: string]: string }; emoji?: string };

interface Stats {
  id: number;
  type: string;
  emoji?: string;
  name?: { default: string; [key: string]: string };
  min?: number;
  options?: number | StatOption[];
  formula?: string;
}

interface Section {
  id: number;
  name?: { default: string; [key: string]: string };
  emoji?: string;
}

interface SimpleMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  stats?: Stats[];
  sections?: Section[];
}

type SelectionRange = { start: number; end: number };

type MentionInfo = {
  token: string;
  label: string;
  property: "value" | "strvalue" | "name" | "emoji";
  category: "stat" | "section";
  emoji?: string;
  type?: string;
};

const PROPERTY_LABEL: Record<"value" | "strvalue" | "name" | "emoji", string> = {
  value: "valor",
  strvalue: "texto",
  name: "nome",
  emoji: "emoji",
};

const TOKEN_REGEX = /<(stat|section):(\d+):(value|strvalue|name|emoji)>/g;

// Função auxiliar para extrair tokens de uma string
const extractTokensFromString = (text: string): string[] => {
  const tokens: string[] = [];
  const regex = /<(stat|section):(\d+):(value|strvalue|name|emoji)>/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    tokens.push(match[0]);
  }
  regex.lastIndex = 0;
  return tokens;
};

const TYPE_COLOR: Record<string, string> = {
  numeric: "hsl(217, 91%, 60%)",
  enum: "hsl(262.1, 83.3%, 57.8%)",
  boolean: "hsl(142, 76%, 36%)",
  string: "hsl(25, 95%, 53%)",
  calculated: "hsl(346, 77%, 50%)",
  section: "hsl(var(--primary))",
};

const sampleValueForStat = (stat: Stats) => {
  switch (stat.type) {
    case "numeric":
      return stat.min !== undefined ? String(stat.min) : "0";
    case "boolean":
      return "1";
    case "enum":
      if (Array.isArray(stat.options) && stat.options.length > 0) {
        const first = stat.options[0];
        if (typeof first === "number") return String(first);
        if (typeof first === "object" && first) {
          if (typeof first.value === "number") return String(first.value);
          const entry = Object.values(first)[0];
          if (typeof entry === "number") return String(entry);
        }
      }
      if (typeof stat.options === "number") return String(stat.options);
      return "1";
    case "calculated":
      return "1";
    default:
      return "";
  }
};

export function SimpleMarkdownEditor({
  value,
  onChange,
  placeholder = "Escreva seu documento... Use @ para inserir variaveis",
  stats = [],
  sections = [],
}: SimpleMarkdownEditorProps) {
  const editorRef = useRef<NotionStyleEditorHandle | null>(null);
  const [sampleOverrides, setSampleOverrides] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState("");

  const mentionOptions = useMemo(() => {
    const statMentions = stats.flatMap((stat) => {
      const baseLabel = stat.name?.default || `Stat ${stat.id}`;
      return (["value", "strvalue", "name", "emoji"] as const).map((property) => ({
        id: stat.id.toString(),
        label: `${baseLabel} • ${PROPERTY_LABEL[property]}`,
        type: stat.type,
        emoji: stat.emoji,
        property,
        category: "stat" as const,
      }));
    });

    const sectionMentions = sections.flatMap((section) => {
      const baseLabel = section.name?.default || `Secao ${section.id}`;
      return (["name", "emoji"] as const).map((property) => ({
        id: section.id.toString(),
        label: `${baseLabel} • ${PROPERTY_LABEL[property]}`,
        type: "section",
        emoji: section.emoji,
        property,
        category: "section" as const,
      }));
    });

    return [...statMentions, ...sectionMentions];
  }, [stats, sections]);

  async function fetchMentions(query: string) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return mentionOptions.slice(0, 8);
    }
    return mentionOptions
      .filter((item) => {
        return (
          item.label.toLowerCase().includes(normalized) ||
          item.id.includes(normalized) ||
          item.property.includes(normalized)
        );
      })
      .slice(0, 8);
  }

  const resolveMention = useCallback(
    (
      category: "stat" | "section",
      id: string,
      property: "value" | "strvalue" | "name" | "emoji"
    ): MentionInfo | null => {
      if (category === "stat") {
        const stat = stats.find((item) => item.id.toString() === id);
        if (!stat) return null;
        const label = `${stat.name?.default || `Stat ${id}`} • ${
          PROPERTY_LABEL[property]
        }`;
        return {
          token: `<stat:${id}:${property}>`,
          label,
          property,
          category,
          emoji: stat.emoji,
          type: stat.type,
        };
      }
      const section = sections.find((item) => item.id.toString() === id);
      if (!section) return null;
      const label = `${section.name?.default || `Secao ${id}`} • ${
        PROPERTY_LABEL[property]
      }`;
      return {
        token: `<section:${id}:${property}>`,
        label,
        property,
        category,
        emoji: section.emoji,
        type: "section",
      };
    },
    [sections, stats]
  );

  const variablesInUse = useMemo(() => {
    const found = new Map<string, MentionInfo>();

    // Extrai variáveis diretas do conteúdo
    let match: RegExpExecArray | null;
    while ((match = TOKEN_REGEX.exec(value)) !== null) {
      const [, category, id, property] = match;
      const resolved = resolveMention(
        category as "stat" | "section",
        id,
        property as "value" | "strvalue" | "name" | "emoji"
      );
      if (resolved) {
        found.set(resolved.token, resolved);
      }
    }
    TOKEN_REGEX.lastIndex = 0;

    // Para cada stat usado, se for do tipo calculated, extrai suas dependências
    const processedStats = new Set<number>();
    const processStatDependencies = (statId: number) => {
      if (processedStats.has(statId)) return;
      processedStats.add(statId);

      const stat = stats.find((s) => s.id === statId);
      if (stat && stat.type === "calculated" && stat.formula) {
        const tokens = extractTokensFromString(stat.formula);
        tokens.forEach((token) => {
          const tokenMatch = token.match(/<(stat|section):(\d+):(value|strvalue|name|emoji)>/);
          if (tokenMatch) {
            const [, category, id, property] = tokenMatch;
            const resolved = resolveMention(
              category as "stat" | "section",
              id,
              property as "value" | "strvalue" | "name" | "emoji"
            );
            if (resolved && !found.has(resolved.token)) {
              found.set(resolved.token, resolved);
              // Recursivamente processa dependências
              if (category === "stat") {
                processStatDependencies(Number(id));
              }
            }
          }
        });
      }
    };

    // Processa dependências de todos os stats calculados encontrados
    found.forEach((mentionInfo) => {
      if (mentionInfo.category === "stat") {
        const statId = parseInt(mentionInfo.token.match(/<stat:(\d+):/)![1]);
        processStatDependencies(statId);
      }
    });

    return Array.from(found.values()).filter((variable) => {
      // Remove strings, mantém apenas valores numéricos/booleanos
      if (variable.category === "stat") {
        return variable.type !== "string";
      }
      // Exclui itens do tipo <section:VALOR:name>
      if (variable.category === "section" && variable.property === "name") {
        return false;
      }
      // Sections sempre são incluídas pois podem ter valores relevantes
      return true;
    });
  }, [value, resolveMention, stats]);

  const markdownResolved = useMemo(() => {
    // Função para resolver tokens com valores simulados
    const resolveToken = (
      text: string,
      options: { forMath?: boolean } = {}
    ): string => {
      const { forMath = false } = options;
      const tokenRegex = /<(stat|section):(\d+):(value|strvalue|name|emoji)>/g;
      const numericRegex = /^-?\d+(\.\d+)?$/;

      const extractNumeric = (candidate?: string): string | null => {
        if (candidate === undefined) return null;
        const trimmed = candidate.trim();
        return numericRegex.test(trimmed) ? trimmed : null;
      };

      return text.replace(
        tokenRegex,
        (
          _,
          category: "stat" | "section",
          id: string,
          property: "value" | "strvalue" | "name" | "emoji"
        ) => {
          const token = `<${category}:${id}:${property}>`;
          const tokenOverride = sampleOverrides[token];

          if (tokenOverride !== undefined) {
            if (property === "value") {
              const numericOverride = extractNumeric(tokenOverride);
              if (numericOverride !== null) {
                return numericOverride;
              }
            } else if (property === "strvalue") {
              if (!forMath) {
                return tokenOverride;
              }
            } else {
              return tokenOverride;
            }
          }

          if (category === "stat") {
            const stat = stats.find((item) => item.id.toString() === id);
            if (!stat) return "";

            const numericOverride = extractNumeric(
              sampleOverrides[`<stat:${id}:value>`]
            );
            const numericValue =
              (property === "value" && extractNumeric(tokenOverride)) ||
              numericOverride ||
              sampleValueForStat(stat);

            switch (property) {
              case "value":
                return numericValue;
              case "strvalue":
                if (forMath) {
                  return numericValue;
                }
                if (stat.type === "enum" && Array.isArray(stat.options)) {
                  const option = stat.options.find(
                    (opt) => opt.value === Number(numericValue)
                  );
                  if (option) {
                    return option.emoji
                      ? `${option.emoji} ${option.name.default}`
                      : option.name.default;
                  }
                }
                return numericValue;
              case "name":
                return stat.name?.default ?? "";
              case "emoji":
                return stat.emoji ?? "";
              default:
                return "";
            }
          }

          const section = sections.find((item) => item.id.toString() === id);
          if (!section) return "";

          switch (property) {
            case "name":
            case "strvalue":
              return section.name?.default ?? "";
            case "emoji":
              return section.emoji ?? "";
            case "value":
              return "";
            default:
              return "";
          }
        }
      );
    };

    // Processa condicionais <if:>/<else>
    const processConditionals = (text: string): string => {
      // Regex para capturar <if:<math:EXPR:>>CONTENT<else>ELSE_CONTENT</if> ou <if:<math:EXPR>>CONTENT...
      const conditionalRegex = /<if:<math:([\s\S]*?)(?:\:>)>([\s\S]*?)(?:<else>([\s\S]*?))?<\/if>/g;
      
      return text.replace(conditionalRegex, (_, expression, trueContent, falseContent) => {
        try {
          // Resolve tokens na expressão
          const resolvedExpression = resolveToken(expression, { forMath: true });
          
          // Avalia a expressão booleana
          const result = evaluate(resolvedExpression);
          
          // Retorna o conteúdo apropriado baseado no resultado
          if (result) {
            return trueContent || "";
          } else {
            return falseContent || "";
          }
        } catch (error) {
          // Se houver erro na avaliação, retorna mensagem de erro
          return `[Erro ao avaliar condição: ${expression}]`;
        }
      });
    };

    // Primeiro processa condicionais, depois resolve tokens restantes e expressões <math:>
    let processed = processConditionals(value);
    
    // Processa expressões <math:EXPR:> ou <math:EXPR> (com ou sem :> no final)
    const processMathExpressions = (text: string): string => {
      let result = text;
      const mathRegex = /<math:([\s\S]*?)(?:\:>)/g;
      
      result = result.replace(mathRegex, (_, expression) => {
        try {
          // Primeiro resolve tokens dentro da expressão
          const resolvedExpression = resolveToken(expression, { forMath: true });
          
          // Normaliza operadores para mathjs
          let normalized = resolvedExpression
            .replace(/\bAND\b/gi, " and ")
            .replace(/\bOR\b/gi, " or ")
            .replace(/\bNOT\b/gi, " not ")
            .replace(/:=/g, "==");

          normalized = normalizeSingleEquals(normalized);
          
          // Avalia expressão
          const evalResult = evaluate(normalized);
          
          // Converte booleano para numérico (true=1, false=0)
          return typeof evalResult === "boolean" 
            ? (evalResult ? "1" : "0") 
            : String(evalResult);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          return `[Erro: ${errorMsg}]`;
        }
      });
      
      return result;
    };
    
    processed = processMathExpressions(processed);
    
    // Resolve tokens restantes (fora de <math:>)
    processed = resolveToken(processed);
    
    return processed;
  }, [value, stats, sections, sampleOverrides]);

  const runEditorCommand = (
    transform: (
      current: string,
      range: SelectionRange
    ) =>
      | {
          text: string;
          selection?: [number, number];
        }
      | null
  ) => {
    const editor = editorRef.current;
    if (!editor) return;
    const { start, end } = editor.getSelection();
    const result = transform(value, { start, end });
    if (!result) return;
    onChange(result.text);
    const nextSelection = result.selection ?? [start, start];
    requestAnimationFrame(() => {
      editor.focus();
      editor.setSelection(nextSelection[0], nextSelection[1]);
    });
  };

  const wrapInline = (
    before: string,
    after: string,
    placeholder: string = ""
  ) => {
    runEditorCommand((current, range) => {
      const hasSelection = range.start !== range.end;
      const selected = hasSelection
        ? current.slice(range.start, range.end)
        : placeholder;
      const nextText =
        current.slice(0, range.start) +
        before +
        selected +
        after +
        current.slice(range.end);
      const start = range.start + before.length;
      const end = start + selected.length;
      return { text: nextText, selection: [start, end] };
    });
  };

  const insertHeading = (level: 1 | 2 | 3) => {
    runEditorCommand((current, range) => {
      const prefix = "#".repeat(level) + " ";
      const caret = range.start;
      const lineStart = current.lastIndexOf("\n", caret - 1) + 1;
      const lineEndIdx = current.indexOf("\n", range.end);
      const lineEnd = lineEndIdx === -1 ? current.length : lineEndIdx;
      const originalLine = current
        .slice(lineStart, lineEnd)
        .replace(/^#{1,6}\s*/, "")
        .trimStart();
      const nextLine = prefix + originalLine;
      const nextText =
        current.slice(0, lineStart) + nextLine + current.slice(lineEnd);
      const selectionStart = lineStart + prefix.length;
      const selectionEnd = selectionStart + originalLine.length;
      return {
        text: nextText,
        selection: [selectionStart, selectionEnd],
      };
    });
  };

  const insertList = (ordered: boolean) => {
    runEditorCommand((current, range) => {
      const startLine = current.lastIndexOf("\n", range.start - 1) + 1;
      const endLineIdx = current.indexOf("\n", range.end);
      const endLine = endLineIdx === -1 ? current.length : endLineIdx;
      const block = current.slice(startLine, endLine);
      const lines = block.split("\n");
      const nextLines = lines.map((line, index) => {
        if (!line.trim()) return ordered ? `${index + 1}. ` : "- ";
        const cleaned = line.replace(/^([-*+]|[0-9]+\.)\s+/, "").trimStart();
        if (ordered) {
          return `${index + 1}. ${cleaned}`;
        }
        return `- ${cleaned}`;
      });
      const nextBlock = nextLines.join("\n");
      const nextText =
        current.slice(0, startLine) + nextBlock + current.slice(endLine);
      return {
        text: nextText,
        selection: [startLine, startLine + nextBlock.length],
      };
    });
  };

  const insertQuote = () => {
    runEditorCommand((current, range) => {
      const startLine = current.lastIndexOf("\n", range.start - 1) + 1;
      const endLineIdx = current.indexOf("\n", range.end);
      const endLine = endLineIdx === -1 ? current.length : endLineIdx;
      const block = current.slice(startLine, endLine);
      const lines = block.split("\n");
      const nextLines = lines.map((line) => {
        if (!line.trim()) return "> ";
        const cleaned = line.replace(/^>\s*/, "").trimStart();
        return `> ${cleaned}`;
      });
      const nextBlock = nextLines.join("\n");
      const nextText =
        current.slice(0, startLine) + nextBlock + current.slice(endLine);
      return {
        text: nextText,
        selection: [startLine, startLine + nextBlock.length],
      };
    });
  };

  const insertCodeBlock = () => {
    runEditorCommand((current, range) => {
      const hasSelection = range.start !== range.end;
      const selected = hasSelection
        ? current.slice(range.start, range.end)
        : "codigo";
      const needsLeadingBreak =
        range.start > 0 && !current.slice(0, range.start).endsWith("\n\n");
      const needsTrailingBreak =
        range.end < current.length && !current.slice(range.end).startsWith("\n");
      const prefix = needsLeadingBreak ? "\n\n" : "\n";
      const suffix = needsTrailingBreak ? "\n\n" : "\n";
      const snippet = `${prefix}\`\`\`\n${selected}\n\`\`\`${suffix}`;
      const nextText =
        current.slice(0, range.start) + snippet + current.slice(range.end);
      const selectionStart = range.start + prefix.length + 4;
      const selectionEnd = selectionStart + selected.length;
      return {
        text: nextText,
        selection: [selectionStart, selectionEnd],
      };
    });
  };

  const insertLink = () => {
    runEditorCommand((current, range) => {
      const hasSelection = range.start !== range.end;
      const selected = hasSelection
        ? current.slice(range.start, range.end)
        : "texto";
      const snippet = `[${selected}](https://)`;
      const nextText =
        current.slice(0, range.start) + snippet + current.slice(range.end);
      const urlStart = range.start + selected.length + 3;
      const urlEnd = urlStart + 8;
      return {
        text: nextText,
        selection: [urlStart, urlEnd],
      };
    });
  };

  const insertConditional = () => {
    runEditorCommand((current, range) => {
      const template = `<if:<math:EXPRESSAO_BOOLEANA:>>\n  Conteúdo se verdadeiro\n<else>\n  Conteúdo se falso\n</if>`;
      const nextText =
        current.slice(0, range.start) + template + current.slice(range.end);
      const selectionStart = range.start + "<if:<math:".length;
      const selectionEnd = selectionStart + "EXPRESSAO_BOOLEANA".length;
      return {
        text: nextText,
        selection: [selectionStart, selectionEnd],
      };
    });
  };

  const insertMathCondition = () => {
    runEditorCommand((current, range) => {
      const template = `<math:<stat:ID:value> >= VALOR:>`;
      const nextText =
        current.slice(0, range.start) + template + current.slice(range.end);
      const selectionStart = range.start + "<math:<stat:".length;
      const selectionEnd = selectionStart + "ID".length;
      return {
        text: nextText,
        selection: [selectionStart, selectionEnd],
      };
    });
  };

  const handleSampleChange = (token: string, newValue: string) => {
    setSampleOverrides((prev) => ({
      ...prev,
      [token]: newValue,
    }));
  };

  const getTokenSample = (token: string): string => {
    if (sampleOverrides[token]) {
      return sampleOverrides[token];
    }
    const match = token.match(/<(stat|section):(\d+):(value|name|emoji)>/);
    if (!match) return "";
    const [, category, id, property] = match;
    if (category === "stat") {
      const stat = stats.find((item) => item.id.toString() === id);
      if (!stat) return "0";
      switch (property) {
        case "value":
          return sampleValueForStat(stat);
        case "name":
          return stat.name?.default ?? "";
        case "emoji":
          return stat.emoji ?? "";
        default:
          return "";
      }
    }
    const section = sections.find((item) => item.id.toString() === id);
    if (!section) return "";
    if (property === "name") {
      return section.name?.default ?? "";
    }
    if (property === "emoji") {
      return section.emoji ?? "";
    }
    return "";
  };

  const filteredVariables = useMemo(() => {
    if (!searchTerm.trim()) return variablesInUse;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return variablesInUse.filter((variable) =>
      variable.label.toLowerCase().includes(lowerSearchTerm)
    );
  }, [searchTerm, variablesInUse]);

  return (
    <div className="rounded-3xl border border-border bg-card shadow-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Type className="h-4 w-4" />
          <span className="text-sm font-medium">Documento em Markdown</span>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title="Titulo 1"
            onClick={() => insertHeading(1)}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title="Titulo 2"
            onClick={() => insertHeading(2)}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title="Titulo 3"
            onClick={() => insertHeading(3)}
          >
            <Heading3 className="h-4 w-4" />
          </Button>
          <div className="h-5 w-px bg-border/60" />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title="Negrito"
            onClick={() => wrapInline("**", "**", "texto")}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title="Italico"
            onClick={() => wrapInline("*", "*", "texto")}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title="Riscado"
            onClick={() => wrapInline("~~", "~~", "texto")}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title="Codigo inline"
            onClick={() => wrapInline("`", "`", "codigo")}
          >
            <Code className="h-4 w-4" />
          </Button>
          <div className="h-5 w-px bg-border/60" />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title="Lista ordenada"
            onClick={() => insertList(true)}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title="Lista simples"
            onClick={() => insertList(false)}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title="Citar"
            onClick={insertQuote}
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title="Bloco de codigo"
            onClick={insertCodeBlock}
          >
            <FileText className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title="Link"
            onClick={insertLink}
          >
            <Link className="h-4 w-4" />
          </Button>
          <div className="h-5 w-px bg-border/60" />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title="Inserir condição matemática <math:>"
            onClick={insertMathCondition}
          >
            <span className="text-xs font-bold">=</span>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title="Inserir bloco condicional <if:>"
            onClick={insertConditional}
          >
            <GitBranch className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4 px-6 py-5">
          <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
            <NotionStyleEditor
              ref={(instance) => {
                editorRef.current = instance;
              }}
              value={value}
              onChange={onChange}
              fetchMentions={fetchMentions}
              placeholder={placeholder}
              className="min-h-[400px] bg-transparent px-0 py-0 text-base font-normal leading-relaxed text-foreground"
              style={{ fontFamily: "Inter, sans-serif" }}
            />
          </div>

          <div className="rounded-2xl border border-border/80 bg-background px-5 py-6">
            <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              Preview com Markdown
            </div>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdownResolved}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        <div className="flex min-h-full flex-col border-t border-border/60 md:border-l md:border-t-0">
          <ScrollArea className="h-full px-5 py-4">
            <div className="space-y-6">
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Simulador de Valores
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Configure valores de teste para preview
                </p>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar variáveis..."
                  className="mt-3 h-8 text-xs"
                />
                <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
                  {filteredVariables.length > 0 ? (
                    filteredVariables.map((variable) => {
                      const resolvedValue = getTokenSample(variable.token);
                      const isCustom = sampleOverrides[variable.token] !== undefined;
                      return (
                        <div
                          key={variable.token}
                          className="rounded-xl border border-dashed border-border/70 bg-background px-3 py-2 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{variable.emoji || "@"}</span>
                              <div>
                                <p className="font-medium text-foreground">
                                  {variable.label}
                                </p>
                                <p className="text-muted-foreground">
                                  {variable.token}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-[10px]"
                              style={{
                                borderColor:
                                  TYPE_COLOR[variable.type ?? "section"] ?? undefined,
                                color:
                                  TYPE_COLOR[variable.type ?? "section"] ?? undefined,
                              }}
                            >
                              {PROPERTY_LABEL[variable.property]}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {(() => {
                              const statMatch = variable.token.match(/^<stat:(\d+):value>$/);
                              const sectionMatch = variable.token.match(/^<section:(\d+):(name|emoji)>$/);

                              // Se for boolean com property value, mostra checkbox
                              if (statMatch && variable.type === 'boolean' && variable.property === 'value') {
                                const isChecked = resolvedValue === '1' || resolvedValue === 'true';
                                return (
                                  <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 h-8 flex-1">
                                    <Checkbox
                                      checked={isChecked}
                                      onCheckedChange={(checked) => {
                                        handleSampleChange(variable.token, checked ? '1' : '0');
                                      }}
                                      id={`checkbox-${variable.token}`}
                                    />
                                    <label
                                      htmlFor={`checkbox-${variable.token}`}
                                      className="text-xs cursor-pointer select-none"
                                    >
                                      {isChecked ? 'Verdadeiro (1)' : 'Falso (0)'}
                                    </label>
                                  </div>
                                );
                              }
                              
                              // Se for enum com property value, mostra select
                              if (statMatch && variable.type === 'enum' && variable.property === 'value') {
                                const statId = parseInt(statMatch[1]);
                                const stat = stats?.find(s => s.id === statId);
                                if (stat && Array.isArray(stat.options)) {
                                  return (
                                    <Select
                                      value={resolvedValue}
                                      onValueChange={(value) => handleSampleChange(variable.token, value)}
                                    >
                                      <SelectTrigger className="h-8 text-xs flex-1">
                                        <SelectValue placeholder="Selecione..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {stat.options.map((opt) => (
                                          <SelectItem key={opt.value} value={String(opt.value)} className="text-xs">
                                            {opt.emoji && `${opt.emoji} `}{opt.name.default}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  );
                                }
                              }
                              
                              // Se for section, mostra input apropriado para name ou emoji
                              if (sectionMatch) {
                                const property = sectionMatch[2];
                                return (
                                  <Input
                                    value={resolvedValue}
                                    onChange={(event) =>
                                      handleSampleChange(variable.token, event.target.value)
                                    }
                                    placeholder={
                                      property === 'name' 
                                        ? 'Nome da seção' 
                                        : property === 'emoji'
                                        ? 'Emoji'
                                        : 'Valor de teste'
                                    }
                                    className="h-8 font-mono text-xs flex-1"
                                  />
                                );
                              }
                              
                              // Caso contrário, mostra input normal
                              return (
                                <Input
                                  value={resolvedValue}
                                  onChange={(event) =>
                                    handleSampleChange(variable.token, event.target.value)
                                  }
                                  placeholder="Valor de teste"
                                  className="h-8 font-mono text-xs flex-1"
                                />
                              );
                            })()}
                            {isCustom && (
                              <Badge variant="secondary" className="text-[10px]">
                                mock
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-4 bg-muted/20 rounded-lg border border-dashed">
                      Nenhuma variável utilizada no documento.
                      <br />
                      <span className="text-[10px]">
                        Use @ no editor para inserir variáveis.
                      </span>
                    </p>
                  )}
                </div>
              </section>
            </div>
          </ScrollArea>
        </div>
      </div>

      <div className="rounded-b-3xl border-t border-border/60 bg-muted/30 px-6 py-3 text-xs text-muted-foreground">
        Dica: mencione variaveis com <code className="rounded bg-muted px-1">@</code> e
        use os botoes acima para formatar como em um documento do Figma.
      </div>
    </div>
  );
}
