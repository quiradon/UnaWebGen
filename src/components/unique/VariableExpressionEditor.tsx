import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { NotionStyleEditor } from "./NotionStyleEditor";
import type { NotionStyleEditorHandle } from "./NotionStyleEditor";
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react";

interface Stats {
  id: number;
  type: string;
  emoji?: string;
  name?: { default: string; [key: string]: string };
  options?: Array<{ value: number; name: { default: string; [key: string]: string }; emoji?: string }> | number;
}

interface Section {
  id: number;
  name?: { default: string; [key: string]: string };
  emoji?: string;
}

type QuickInsertItem = {
  label: string;
  snippet: string;
  description?: string;
};

export type QuickInsertGroup = {
  title: string;
  items: QuickInsertItem[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
};

const TYPE_COLOR: Record<string, string> = {
  numeric: "hsl(217, 91%, 60%)",
  enum: "hsl(262.1, 83.3%, 57.8%)",
  boolean: "hsl(142, 76%, 36%)",
  string: "hsl(25, 95%, 53%)",
  calculated: "hsl(346, 77%, 50%)",
};

const PROPERTY_LABEL: Record<"value" | "strvalue" | "name" | "emoji", string> = {
  value: "valor",
  strvalue: "texto",
  name: "nome",
  emoji: "emoji",
};

type VariableUsage = {
  token: string;
  label: string;
  property: "value" | "strvalue" | "name" | "emoji";
  type?: string;
  emoji?: string;
};

interface VariableExpressionEditorProps {
  title: string;
  badge?: string;
  description?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  stats?: Stats[];
  sections?: Section[];
  allowedStatTypes?: string[];
  includeSections?: boolean;
  placeholder?: string;
  quickInsert?: QuickInsertGroup[];
  renderPreview?: (
    expression: string,
    resolveSample: (token: string) => string
  ) => React.ReactNode;
  previewLabel?: string;
  previewSupportText?: string;
  onConfirm?: () => void;
  confirmLabel?: string;
  confirmDisabled?: boolean;
  resolveTokenValue?: (token: string) => string;
}

const TOKEN_REGEX = /<(stat|section):(\d+):(value|strvalue|name|emoji)>/g;

export function VariableExpressionEditor({
  title,
  badge,
  description,
  value,
  onChange,
  stats = [],
  sections = [],
  allowedStatTypes,
  includeSections = false,
  placeholder = "Digite sua expressao... Use @ para inserir variaveis",
  quickInsert = [],
  renderPreview,
  previewLabel = "Resultado com valores exemplo",
  previewSupportText,
  onConfirm,
  confirmLabel = "Confirmar",
  confirmDisabled,
  resolveTokenValue,
}: VariableExpressionEditorProps) {
  const editorRef = useRef<NotionStyleEditorHandle | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>(
    {}
  );
  const [sampleOverrides, setSampleOverrides] = useState<Record<string, string>>({});

  const filteredStats = useMemo(() => {
    if (!allowedStatTypes || allowedStatTypes.length === 0) {
      return stats;
    }
    return stats.filter((stat) => allowedStatTypes.includes(stat.type));
  }, [stats, allowedStatTypes]);

  const mentionOptions = useMemo(() => {
    const statOptions = filteredStats.map((stat) => ({
      id: stat.id.toString(),
      label: stat.name?.default || `Stat ${stat.id}`,
      type: stat.type,
      emoji: stat.emoji,
      property: "value" as const,
      category: "stat" as const,
    }));

    if (!includeSections) {
      return statOptions;
    }

    const sectionOptions = sections.map((section) => ({
      id: section.id.toString(),
      label: section.name?.default || `Secao ${section.id}`,
      type: "section",
      emoji: section.emoji,
      property: "name" as const,
      category: "section" as const,
    }));

    return [...statOptions, ...sectionOptions];
  }, [filteredStats, includeSections, sections]);

  async function fetchMentions(query: string) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return mentionOptions.slice(0, 8);
    }
    return mentionOptions
      .filter((item) => {
        return (
          item.label.toLowerCase().includes(normalized) ||
          item.id.includes(normalized)
        );
      })
      .slice(0, 8);
  }

  const variablesInUse = useMemo(() => {
    const found = new Map<string, VariableUsage>();
    let match: RegExpExecArray | null;
    while ((match = TOKEN_REGEX.exec(value)) !== null) {
      const [, category, id, property] = match;
      const token = match[0];

      if (category === "stat") {
        const stat = filteredStats.find((item) => item.id.toString() === id);
        if (stat) {
          found.set(token, {
            token,
            label: stat.name?.default || `Stat ${id}`,
            property: property as "value" | "strvalue" | "name" | "emoji",
            type: stat.type,
            emoji: stat.emoji,
          });
        }
      } else if (includeSections) {
        const section = sections.find((item) => item.id.toString() === id);
        if (section) {
          found.set(token, {
            token,
            label: section.name?.default || `Secao ${id}`,
            property: property as "value" | "strvalue" | "name" | "emoji",
            emoji: section.emoji,
          });
        }
      }
    }
    TOKEN_REGEX.lastIndex = 0;
    return Array.from(found.values());
  }, [value, filteredStats, includeSections, sections]);

  const handleInsertSnippet = (snippet: string) => {
    editorRef.current?.insertText(snippet);
  };

  const handleInsertToken = (token: string) => {
    editorRef.current?.insertText(`${token} `);
  };

  useEffect(() => {
    setSampleOverrides((prev) => {
      const allowed = new Set(variablesInUse.map((item) => item.token));
      let changed = false;
      const next: Record<string, string> = {};
      for (const [token, value] of Object.entries(prev)) {
        if (allowed.has(token)) {
          next[token] = value;
        } else {
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [variablesInUse]);

  const getTokenSample = useCallback(
    (token: string) => {
      if (sampleOverrides[token] !== undefined) {
        return sampleOverrides[token];
      }
      return resolveTokenValue?.(token) ?? "";
    },
    [sampleOverrides, resolveTokenValue]
  );

  const handleSampleChange = useCallback(
    (token: string, nextValue: string) => {
      setSampleOverrides((prev) => {
        if (!nextValue.length) {
          if (!(token in prev)) return prev;
          const next = { ...prev };
          delete next[token];
          return next;
        }
        if (prev[token] === nextValue) return prev;
        return { ...prev, [token]: nextValue };
      });
    },
    []
  );

  const toggleGroup = (index: number) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <Card className="rounded-3xl border border-border/70 bg-card shadow-sm">
      <CardHeader className="space-y-3 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        {description && (
          <div className="text-sm text-muted-foreground">{description}</div>
        )}
      </CardHeader>

      <CardContent className="grid gap-6 pt-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
            <NotionStyleEditor
              ref={(instance) => {
                editorRef.current = instance;
              }}
              value={value}
              onChange={onChange}
              fetchMentions={fetchMentions}
              placeholder={placeholder}
              className="min-h-[160px] bg-transparent px-0 py-0 font-mono text-sm leading-relaxed text-foreground"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Digite <code className="rounded bg-muted px-1">@</code> para listar
              variaveis disponiveis.
            </p>
          </div>

          {quickInsert.map((group, index) => {
            const isExpanded =
              expandedGroups[index] ??
              group.defaultExpanded ??
              !group.collapsible;
            return (
              <div
                key={group.title}
                className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-3"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => {
                    if (group.collapsible) toggleGroup(index);
                  }}
                >
                  <span>{group.title}</span>
                  {group.collapsible && (
                    <span className="ml-2">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </button>
                {(!group.collapsible || isExpanded) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <Button
                        key={`${group.title}-${item.label}`}
                        size="sm"
                        variant="outline"
                        className="h-auto rounded-xl border-border/60 px-3 py-2 text-xs"
                        onClick={() => handleInsertSnippet(item.snippet)}
                        title={item.description}
                      >
                        <span className="font-semibold">{item.label}</span>
                        {item.description && (
                          <span className="ml-2 text-[10px] text-muted-foreground">
                            {item.description}
                          </span>
                        )}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {renderPreview && (
            <div className="rounded-2xl border border-border/80 bg-background px-5 py-5">
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{previewLabel}</span>
              </div>
              {previewSupportText && (
                <p className="mb-3 text-xs text-muted-foreground">
                  {previewSupportText}
                </p>
              )}
              <div className="rounded-xl border border-border/80 bg-muted/20 px-3 py-3">
                <div className="font-mono text-sm text-foreground">
                  {renderPreview(value, getTokenSample)}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex min-h-full flex-col gap-4">
          <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Variaveis utilizadas
              </h4>
              <Badge variant="outline" className="text-[10px]">
                {variablesInUse.length}
              </Badge>
            </div>
            <div className="mt-3 space-y-2">
              {variablesInUse.length > 0 ? (
                variablesInUse.map((variable) => {
                  const resolvedValue = getTokenSample(variable.token);
                  const isCustom = sampleOverrides[variable.token] !== undefined;
                  return (
                    <div
                      key={variable.token}
                      className="rounded-xl border border-dashed border-border/70 bg-background px-3 py-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-medium text-foreground">
                            {variable.label}
                          </p>
                          <p className="text-muted-foreground">
                            {variable.token}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[10px]"
                          style={{
                            borderColor: variable.type
                              ? TYPE_COLOR[variable.type] ?? undefined
                              : undefined,
                            color: variable.type
                              ? TYPE_COLOR[variable.type] ?? undefined
                              : undefined,
                          }}
                        >
                          {PROPERTY_LABEL[variable.property]}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        {(() => {
                          const statMatch = variable.token.match(/^<stat:(\d+):value>$/);
                          const sectionMatch = variable.token.match(/^<section:(\d+):(name|emoji)>$/);
                          
                          // Se for boolean com property value, mostra checkbox
                          if (statMatch && variable.type === 'boolean' && variable.property === 'value') {
                            const isChecked = resolvedValue === '1' || resolvedValue === 'true';
                            return (
                              <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 h-8">
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
                            const stat = filteredStats.find(s => s.id === statId);
                            if (stat && Array.isArray(stat.options)) {
                              return (
                                <Select
                                  value={resolvedValue}
                                  onValueChange={(value) => handleSampleChange(variable.token, value)}
                                >
                                  <SelectTrigger className="h-8 text-xs">
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
                                    : resolveTokenValue?.(variable.token) ?? "Ex: valor"
                                }
                                className="h-8 font-mono text-xs"
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
                              placeholder={
                                resolveTokenValue?.(variable.token) ?? "Ex: 10"
                              }
                              className="h-8 font-mono text-xs"
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
                <p className="text-xs text-muted-foreground">
                  Ainda sem variaveis na expressao.
                </p>
              )}
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-4 pr-2">
              {filteredStats.length > 0 && (
                <section>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Inserir atributo
                  </h4>
                  <div className="mt-3 space-y-2">
                    {filteredStats.map((stat) => (
                      <Button
                        key={stat.id}
                        variant="outline"
                        size="sm"
                        className="h-auto w-full justify-start rounded-xl border-border/60 px-3 py-2 text-xs"
                        onClick={() =>
                          handleInsertToken(`<stat:${stat.id}:value>`)
                        }
                      >
                        <span className="mr-3 text-lg">{stat.emoji || "@"}</span>
                        <div className="flex-1 text-left">
                          <p className="font-medium">
                            {stat.name?.default || `Stat ${stat.id}`}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            valor do atributo ({stat.type})
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[10px]"
                          style={{
                            borderColor: TYPE_COLOR[stat.type] ?? undefined,
                            color: TYPE_COLOR[stat.type] ?? undefined,
                          }}
                        >
                          valor
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </section>
              )}

              {includeSections && sections.length > 0 && (
                <section>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Inserir secao
                  </h4>
                  <div className="mt-3 space-y-2">
                    {sections.map((section) => (
                      <Button
                        key={section.id}
                        variant="outline"
                        size="sm"
                        className="h-auto w-full justify-start rounded-xl border-border/60 px-3 py-2 text-xs"
                        onClick={() =>
                          handleInsertToken(`<section:${section.id}:name>`)
                        }
                      >
                        <span className="mr-3 text-lg">
                          {section.emoji || "@"}
                        </span>
                        <div className="flex-1 text-left">
                          <p className="font-medium">
                            {section.name?.default || `Secao ${section.id}`}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            nome da secao
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          nome
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>

      {onConfirm && (
        <CardFooter className="justify-end border-t border-border/60">
          <Button onClick={onConfirm} disabled={confirmDisabled}>
            {confirmLabel}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
