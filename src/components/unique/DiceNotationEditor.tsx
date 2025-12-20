import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DiceRoll } from "@dice-roller/rpg-dice-roller";
import { evaluate } from "mathjs";
import { VariableExpressionEditor } from "./VariableExpressionEditor";
import type { QuickInsertGroup } from "./VariableExpressionEditor";
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

interface DiceNotationEditorProps {
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
  { symbol: "(", label: "abre parenteses" },
  { symbol: ")", label: "fecha parenteses" },
];

const COMMON_DICE = [
  { notation: "1d4", label: "d4" },
  { notation: "1d6", label: "d6" },
  { notation: "1d8", label: "d8" },
  { notation: "1d10", label: "d10" },
  { notation: "1d12", label: "d12" },
  { notation: "1d20", label: "d20" },
  { notation: "1d100", label: "d100" },
  { notation: "2d6", label: "2d6" },
  { notation: "3d6", label: "3d6" },
  { notation: "4d6", label: "4d6" },
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

const TOKEN_REGEX = /<(\w+):(\d+):(\w+)>/g;

const ADVANCED_MODIFIERS = [
  { notation: "kh1", label: "kh1", desc: "mantem o maior resultado" },
  { notation: "kl1", label: "kl1", desc: "mantem o menor resultado" },
  { notation: "dh1", label: "dh1", desc: "descarta o maior resultado" },
  { notation: "dl1", label: "dl1", desc: "descarta o menor resultado" },
  { notation: "r1", label: "r1", desc: "rerola valores iguais a 1" },
  { notation: "!!", label: "!!", desc: "explosao composta" },
  { notation: "!p", label: "!p", desc: "explosao penetrante" },
  { notation: "min1", label: "min1", desc: "resultado minimo 1" },
  { notation: "max20", label: "max20", desc: "resultado maximo 20" },
  { notation: "cs>15", label: "cs>15", desc: "conta sucessos acima de 15" },
  { notation: "cf<5", label: "cf<5", desc: "conta falhas abaixo de 5" },
  { notation: "sa", label: "sa", desc: "ordena crescente" },
  { notation: "sd", label: "sd", desc: "ordena decrescente" },
  { notation: "u", label: "u", desc: "apenas valores unicos" },
];

const sampleValueForStat = (stat: Stats) => {
  switch (stat.type) {
    case "numeric":
      return String(stat.min ?? 3);
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
      return "2";
    default:
      return "3";
  }
};

const getEnumOptionLabel = (stat: Stats, value: string): string => {
  if (stat.type !== "enum" || !Array.isArray(stat.options)) {
    return value;
  }

  const numericValue = Number(value);
  const option = stat.options.find((opt) => opt.value === numericValue);
  if (option) {
    return option.emoji
      ? `${option.emoji} ${option.name.default}`
      : option.name.default;
  }

  return value;
};

const DiceNotationEditor: React.FC<DiceNotationEditorProps> = ({
  value,
  onChange,
  stats = [],
  onConfirm,
}) => {
  const [expression, setExpression] = useState(value);

  useEffect(() => {
    setExpression(value);
  }, [value]);

  const getDefaultTokenValue = useCallback(
    (token: string) => {
      const match = token.match(/^<(stat|section):(\d+):(value|strvalue|name|emoji)>$/);
      if (!match) return "";
      const [, category, id, property] = match;
      if (category === "stat") {
        const stat = stats.find((item) => item.id === Number(id));
        if (!stat) return "";
        switch (property) {
          case "value":
            return sampleValueForStat(stat);
          case "strvalue": {
            const numericValue = sampleValueForStat(stat);
            return getEnumOptionLabel(stat, numericValue);
          }
          case "name":
            return stat.name?.default ?? "";
          case "emoji":
            return stat.emoji ?? "";
          default:
            return "";
        }
      }
      return "";
    },
    [stats]
  );

  const handleConfirm = () => {
    onChange(expression);
    onConfirm?.(expression);
  };

  const quickInsert = useMemo<QuickInsertGroup[]>(
    () => [
      {
        title: "Operadores",
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
        title: "Dados comuns",
        items: COMMON_DICE.map((dice) => ({
          label: dice.label.toUpperCase(),
          snippet: dice.notation,
        })),
      },
      {
        title: "Modificadores avancados",
        collapsible: true,
        defaultExpanded: false,
        items: ADVANCED_MODIFIERS.map((mod) => ({
          label: mod.label,
          snippet: mod.notation,
          description: mod.desc,
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
    ],
    []
  );

  const previewRenderer = useMemo(
    () =>
      (expr: string, resolveSample: (token: string) => string) => {
        if (!expr.trim()) {
          return (
            <span className="text-xs text-muted-foreground">
              Digite uma expressao para simular a rolagem.
            </span>
          );
        }
        try {
          // Primeiro processa <math:EXPR:> ou <math:EXPR> (com ou sem :> no final)
          let previewExpression = expr.replace(
            /<math:([\s\S]*?)(?:\:>)/g,
            (_, mathExpr: string) => {
              try {
                // Substitui tokens dentro da expressão matemática
                const resolvedMathExpr = mathExpr.replace(
                  TOKEN_REGEX,
                  (__, category: string, id: string, property: string) => {
                    const token = `<${category}:${id}:${property}>`;
                                    let sample = resolveSample(token);
                const isNumericProperty =
                  property === "value" || property === "strvalue";
                const isNumeric =
                  sample && /^-?\d+\.?\d*$/.test(sample.trim());

                if (!sample || (isNumericProperty && !isNumeric)) {
                  if (category === "stat") {
                    const stat = stats.find((item) => item.id === Number(id));
                    if (!stat) {
                      sample = "0";
                    } else if (property === "value" || property === "strvalue") {
                      sample = sampleValueForStat(stat);
                    } else {
                      sample = "0";
                    }
                  } else {
                    sample = "0";
                  }
                }
                return String(sample).trim() || "0";
                  }
                );

                // Normaliza operadores para mathjs
                let normalized = resolvedMathExpr
                  .replace(/\bAND\b/gi, " and ")
                  .replace(/\bOR\b/gi, " or ")
                  .replace(/\bNOT\b/gi, " not ")
                  .replace(/:=/g, "==");

                normalized = normalizeSingleEquals(normalized);

                const result = evaluate(normalized);
                
                // Converte boolean para número
                const numResult = typeof result === "boolean" ? (result ? 1 : 0) : Number(result);
                
                // Retorna o valor bruto - sem parênteses
                // O parser de dados aceita números diretamente antes de 'd'
                return String(numResult);
              } catch {
                return "0";
              }
            }
          );

          // Depois processa os tokens restantes
          // Substitui tokens por seus valores
          previewExpression = previewExpression.replace(
            TOKEN_REGEX,
            (_, category: string, id: string, property: string) => {
              const token = `<${category}:${id}:${property}>`;
              let sample = resolveSample(token);
              const isNumericProperty =
                property === "value" || property === "strvalue";
              const isNumeric =
                sample && /^-?\d+\.?\d*$/.test(sample.trim());

              if (!sample || (isNumericProperty && !isNumeric)) {
                if (category === "stat") {
                  const stat = stats.find((item) => item.id === Number(id));
                  if (!stat) {
                    sample = "0";
                  } else if (property === "value" || property === "strvalue") {
                    sample = sampleValueForStat(stat);
                  } else {
                    sample = "0";
                  }
                } else {
                  sample = "0";
                }
              }

              sample = String(sample).trim();

              if (!sample) {
                return "0";
              }

              return sample;
            }
          );
          const roll = new DiceRoll(previewExpression);
          return (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                Expressao simulada:{" "}
                <code className="rounded bg-muted px-1 py-0.5">
                  {previewExpression}
                </code>
              </div>
              <div className="text-sm font-semibold text-blue-600">
                {roll.output}
              </div>
            </div>
          );
        } catch (error) {
          return (
            <div className="text-xs font-medium text-red-500">
              {error instanceof Error ? error.message : "Expressão inválida"}
            </div>
          );
        }
      },
    [stats]
  );

  return (
    <VariableExpressionEditor
      title="Dice notation"
      badge="rpg-dice-roller"
      description={
        <span>
          Monte expressoes de rolagem combinando dados clássicos, atributos do
          sistema e modificadores avançados.
        </span>
      }
      value={expression}
      onChange={setExpression}
      stats={stats}
      allowedStatTypes={ALLOWED_TYPES}
      placeholder="Ex: 2d6 + <stat:4:value>"
      quickInsert={quickInsert}
      resolveTokenValue={getDefaultTokenValue}
      renderPreview={previewRenderer}
      previewLabel="Rolagem simulada"
      previewSupportText="Substituimos os atributos por valores exemplo antes de executar a rolagem."
      onConfirm={handleConfirm}
      confirmLabel="Confirmar"
    />
  );
};

export default DiceNotationEditor;
