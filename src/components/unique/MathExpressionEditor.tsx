import React from "react";
import { VariableExpressionEditor } from "./VariableExpressionEditor";
import type { QuickInsertGroup } from "./VariableExpressionEditor";
import { evaluate } from "mathjs";
import { normalizeSingleEquals } from "@/lib/utils";

type StatOption = { value: number; name: { default: string; [key: string]: string }; emoji?: string };

interface Stats {
  id: number;
  type: string;
  emoji?: string;
  name?: { default: string };
  min?: number;
  options?: number | StatOption[];
}

interface MathExpressionEditorProps {
  value: string;
  onChange: (value: string) => void;
  stats?: Stats[];
  onConfirm?: (expression: string) => void;
}

const ALLOWED_TYPES = ["numeric", "boolean", "enum", "calculated"];

const OPERATORS = [
  { symbol: "+", label: "soma" },
  { symbol: "-", label: "subtracao" },
  { symbol: "*", label: "multiplicacao" },
  { symbol: "/", label: "divisao" },
  { symbol: "^", label: "potencia" },
  { symbol: "%", label: "modulo" },
  { symbol: "(", label: "abre parenteses" },
  { symbol: ")", label: "fecha parenteses" },
];

const MATH_FUNCTIONS = [
  { name: "abs", label: "abs(x)", desc: "valor absoluto" },
  { name: "ceil", label: "ceil(x)", desc: "arredonda para cima" },
  { name: "cos", label: "cos(x)", desc: "cosseno" },
  { name: "exp", label: "exp(x)", desc: "exponencial" },
  { name: "floor", label: "floor(x)", desc: "arredonda para baixo" },
  { name: "log", label: "log(x)", desc: "logaritmo natural" },
  { name: "max", label: "max(a,b)", desc: "maior valor" },
  { name: "min", label: "min(a,b)", desc: "menor valor" },
  { name: "pow", label: "pow(x,y)", desc: "potencia x^y" },
  { name: "round", label: "round(x)", desc: "arredonda" },
  { name: "sign", label: "sign(x)", desc: "sinal do numero" },
  { name: "sin", label: "sin(x)", desc: "seno" },
  { name: "sqrt", label: "sqrt(x)", desc: "raiz quadrada" },
  { name: "tan", label: "tan(x)", desc: "tangente" },
];

const TOKEN_REGEX = /<(stat|section):(\d+):(value|strvalue|name|emoji)>/g;

const SAMPLE_FOR_STAT: Record<string, (stat: Stats) => string> = {
  numeric: (stat) => String(stat.min ?? 1),
  boolean: () => "0",
  enum: (stat) => {
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
  },
  calculated: () => "1",
  string: () => "1",
};

const sampleValueForStat = (stat: Stats) => {
  const resolver = SAMPLE_FOR_STAT[stat.type];
  return resolver ? resolver(stat) : "1";
};

const getEnumOptionLabel = (stat: Stats, value: string): string => {
  if (stat.type !== 'enum' || !Array.isArray(stat.options)) {
    return value;
  }
  const numValue = Number(value);
  const option = stat.options.find(opt => opt.value === numValue);
  if (option) {
    return option.emoji ? `${option.emoji} ${option.name.default}` : option.name.default;
  }
  return value;
};

const MathExpressionEditor: React.FC<MathExpressionEditorProps> = ({
  value,
  onChange,
  stats = [],
  onConfirm,
}) => {
  const quickInsert: QuickInsertGroup[] = [
    {
      title: "Operadores basicos",
      items: OPERATORS.map((op) => ({
        label: op.symbol,
        snippet:
          op.symbol === "(" || op.symbol === ")"
            ? op.symbol
            : ` ${op.symbol} `,
        description: op.label,
      })),
    },
    {
      title: "Funcoes matematicas",
      collapsible: true,
      defaultExpanded: false,
      items: MATH_FUNCTIONS.map((func) => ({
        label: func.label,
        snippet: `${func.name}(`,
        description: func.desc,
      })),
    },
  ];

  const previewRenderer = (
    expr: string,
    resolveSample: (token: string) => string
  ) => {
    if (!expr.trim()) {
      return (
        <span className="text-xs text-muted-foreground">
          Digite uma expressao para ver a avaliacao.
        </span>
      );
    }

    try {
      const numericRegex = /^-?\d+(\.\d+)?$/;
      const toNumeric = (value?: string): string | null => {
        if (!value) return null;
        const trimmed = value.trim();
        return numericRegex.test(trimmed) ? trimmed : null;
      };
      const findStatById = (statId: string) =>
        stats.find((item) => item.id === Number(statId));

      let previewExpression = expr.replace(
        /<math:([\s\S]*?)(?:\:>)/g,
        (__, mathExpr: string) => {
          try {
            const resolvedMathExpr = mathExpr.replace(
              TOKEN_REGEX,
              (___, category: string, id: string, property: string) => {
                const propertyKey = property as
                  | "value"
                  | "strvalue"
                  | "name"
                  | "emoji";

                if (propertyKey === "value" || propertyKey === "strvalue") {
                  const token = `<${category}:${id}:${property}>`;
                  const directSample = toNumeric(resolveSample(token));
                  const linkedSample =
                    propertyKey === "strvalue"
                      ? toNumeric(resolveSample(`<${category}:${id}:value>`))
                      : null;

                  if (directSample) return directSample;
                  if (linkedSample) return linkedSample;

                  if (category === "stat") {
                    const stat = findStatById(id);
                    if (stat) {
                      return sampleValueForStat(stat);
                    }
                  }
                  return "0";
                }

                return "0";
              }
            );

            let normalized = resolvedMathExpr
              .replace(/\bAND\b/gi, " and ")
              .replace(/\bOR\b/gi, " or ")
              .replace(/\bNOT\b/gi, " not ")
              .replace(/:=/g, "==");

            normalized = normalizeSingleEquals(normalized);

            const result = evaluate(normalized);

            if (typeof result === "boolean") {
              return result ? "1" : "0";
            }

            return String(result);
          } catch {
            return "0";
          }
        }
      );

      previewExpression = previewExpression.replace(
        TOKEN_REGEX,
        (_, category: string, id: string, property: string) => {
          const propertyKey = property as
            | "value"
            | "strvalue"
            | "name"
            | "emoji";
          const token = `<${category}:${id}:${property}>`;
          const rawSample = resolveSample(token);
          let finalSample: string | null = null;

          if (category === "stat") {
            const stat = findStatById(id);
            if (stat) {
              switch (propertyKey) {
                case "value": {
                  finalSample =
                    toNumeric(rawSample) ??
                    toNumeric(sampleValueForStat(stat)) ??
                    "0";
                  break;
                }
                case "strvalue": {
                  const numericSample =
                    toNumeric(resolveSample(`<${category}:${id}:value>`)) ??
                    toNumeric(rawSample) ??
                    toNumeric(sampleValueForStat(stat)) ??
                    "0";

                  if (stat.type === "enum" && Array.isArray(stat.options)) {
                    const option = stat.options.find(
                      (opt) => opt.value === Number(numericSample)
                    );
                    if (option) {
                      finalSample = option.emoji
                        ? `${option.emoji} ${option.name.default}`
                        : option.name.default;
                      break;
                    }
                  }

                  finalSample = numericSample;
                  break;
                }
                case "name":
                  finalSample = stat.name?.default ?? "0";
                  break;
                case "emoji":
                  finalSample = stat.emoji ?? "0";
                  break;
              }
            }
          }

          if (finalSample === null) {
            if (propertyKey === "value" || propertyKey === "strvalue") {
              finalSample = toNumeric(rawSample) ?? "0";
            } else {
              finalSample = rawSample || "0";
            }
          }

          if (
            typeof finalSample === "string" &&
            finalSample.trim().startsWith("-")
          ) {
            return `(${finalSample.trim()})`;
          }

          return finalSample ?? "0";
        }
      );

      let normalized = previewExpression
        .replace(/\bAND\b/gi, " and ")
        .replace(/\bOR\b/gi, " or ")
        .replace(/\bNOT\b/gi, " not ")
        .replace(/:=/g, "==");

      normalized = normalizeSingleEquals(normalized);

      const result = evaluate(normalized);
      let displayResult =
        typeof result === "boolean" ? (result ? "1" : "0") : String(result);

      const singleStatMatch = expr.trim().match(/^<stat:(\d+):value>$/);
      if (singleStatMatch) {
        const statId = Number(singleStatMatch[1]);
        const stat = stats.find((s) => s.id === statId);
        if (stat) {
          const enumLabel = getEnumOptionLabel(stat, displayResult);
          if (enumLabel !== displayResult) {
            displayResult = `${displayResult} (${enumLabel})`;
          }
        }
      }

      return (
        <div className="space-y-2">
          <div className="rounded-lg bg-muted/50 px-3 py-2">
            <p className="text-xs text-muted-foreground mb-1">Expressao:</p>
            <p className="font-mono text-sm">{previewExpression}</p>
          </div>
          <div className="rounded-lg bg-primary/10 px-3 py-2">
            <p className="text-xs text-muted-foreground mb-1">Resultado:</p>
            <p className="font-mono text-lg font-semibold text-primary">
              {displayResult}
            </p>
          </div>
        </div>
      );
    } catch (error) {
      return (
        <div className="rounded-lg bg-destructive/10 px-3 py-2 text-destructive">
          <p className="text-xs font-semibold mb-1">Erro na avaliacao:</p>
          <p className="text-xs">
            {error instanceof Error ? error.message : "Expressao invalida"}
          </p>
        </div>
      );
    }
  };

  return (
    <VariableExpressionEditor
      title="Expressao Matematica"
      badge="math"
      description="Crie expressoes matematicas complexas usando variaveis, operadores e funcoes."
      value={value}
      onChange={onChange}
      stats={stats}
      allowedStatTypes={ALLOWED_TYPES}
      placeholder="Ex: (<stat:1:value> + 5) * 2"
      quickInsert={quickInsert}
      renderPreview={previewRenderer}
      previewLabel="Avaliacao"
      previewSupportText="Preview com valores simulados"
      onConfirm={onConfirm ? () => onConfirm(value) : undefined}
      confirmLabel="Confirmar"
    />
  );
};

export default MathExpressionEditor;
