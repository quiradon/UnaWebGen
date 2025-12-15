import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SimpleMarkdownEditor } from "./SimpleMarkdownEditor";

type Locale =
  | "pt-BR"
  | "en-US"
  | "es-ES"
  | "fr"
  | "de"
  | "it"
  | "ru"
  | "zh-CN"
  | "ja"
  | "ko";
type Localization<T> = { default: T } & Partial<Record<Locale, T>>;

type StatOption = { value: number; name: { default: string; [key: string]: string }; emoji?: string };

interface Stats {
  id: number;
  type: string;
  emoji?: string;
  name?: { default: string; [key: string]: string };
  min?: number;
  options?: number | StatOption[];
}

interface Section {
  id: number;
  name?: { default: string; [key: string]: string };
  emoji?: string;
}

interface CompactMarkdownLocalizationEditorProps {
  value: Localization<string>;
  onChange: (value: Localization<string>) => void;
  label: string;
  locales?: Locale[];
  sections?: Section[];
  stats?: Stats[];
}

function allLocalesFrom(
  value: Localization<string>,
  locales: Locale[]
): Array<Locale | "default"> {
  const result: Array<Locale | "default"> = ["default"];
  locales.forEach((loc) => {
    if (value[loc] !== undefined) {
      result.push(loc);
    }
  });
  locales.forEach((loc) => {
    if (!result.includes(loc)) {
      result.push(loc);
    }
  });
  return result;
}

function getLocaleName(locale: Locale | "default"): string {
  const names: Record<string, string> = {
    default: "Padrao",
    "pt-BR": "Portugues (BR)",
    "en-US": "English (US)",
    "es-ES": "Espanol",
    fr: "Frances",
    de: "Deutsch",
    it: "Italiano",
    ru: "Russo",
    "zh-CN": "Chines (CN)",
    ja: "Japones",
    ko: "Coreano",
  };
  return names[locale] || locale;
}

export function CompactMarkdownLocalizationEditor({
  value,
  onChange,
  label,
  locales = ["pt-BR", "en-US", "es-ES", "fr", "de", "it", "ru", "zh-CN", "ja", "ko"],
  sections = [],
  stats = [],
}: CompactMarkdownLocalizationEditorProps) {
  const [curr, setCurr] = useState<Locale | "default">("default");
  const all = allLocalesFrom(value, locales);

  const updateLocale = (key: Locale | "default", nextValue: string) => {
    if (key === "default") {
      onChange({ ...value, default: nextValue });
      return;
    }
    onChange({ ...value, [key]: nextValue });
  };

  return (
    <Card className="border border-dashed border-border/60">
      <CardHeader className="py-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {label}
          <Select
            value={curr}
            onValueChange={(opt) =>
              setCurr(opt as Locale | "default")
            }
          >
            <SelectTrigger className="ml-auto w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {all.map((opt) => (
                <SelectItem key={String(opt)} value={opt}>
                  {getLocaleName(opt)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SimpleMarkdownEditor
          value={
            curr === "default"
              ? value.default ?? ""
              : value[curr] ?? ""
          }
          onChange={(text) => updateLocale(curr, text)}
          placeholder={curr === "default" ? "Obrigatorio" : `Opcional (${curr})`}
          sections={sections}
          stats={stats}
        />
      </CardContent>
    </Card>
  );
}
