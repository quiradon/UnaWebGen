import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SimpleMarkdownEditor } from "./SimpleMarkdownEditor";
import { Locale, Section, Stats } from "@/components/sistemaeditor/editor";

type Localization<T> = { default: T } & Partial<Record<Locale, T>>;

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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</span>
      </div>
      <SimpleMarkdownEditor
        value={
          curr === "default"
            ? value.default ?? ""
            : value[curr] ?? ""
        }
        onChange={(text) => updateLocale(curr, text)}
        placeholder={curr === "default" ? "Obrigatório" : `Opcional (${curr})`}
        sections={sections}
        stats={stats}
        headerRight={
          <Select
            value={curr}
            onValueChange={(opt) =>
              setCurr(opt as Locale | "default")
            }
          >
            <SelectTrigger className="w-32 h-8 text-xs">
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
        }
      />
    </div>
  );
}
