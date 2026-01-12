import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

// Types - importados do editor principal
type Locale = 
  | "id" | "da" | "de" | "en-GB" | "en-US" | "es-ES" | "es-419" | "fr" | "hr" | "it" 
  | "lt" | "hu" | "nl" | "no" | "pl" | "pt-BR" | "ro" | "fi" | "sv-SE" | "vi" | "tr" 
  | "cs" | "el" | "bg" | "ru" | "uk" | "hi" | "th" | "zh-CN" | "ja" | "zh-TW" | "ko" 
  | string;
type Localization<T = string> = { default: T } & Partial<Record<Locale, T>>;
type LabelString = string & { __brand_label100?: true };
type LabelLocalization = { default: LabelString } & Partial<Record<Locale, LabelString>>;

interface RPGSystemConfig {
  id: number;
  name: LabelLocalization;
  description: Localization<string>;
  emoji?: string;
}

interface ConfigTabProps {
  value: RPGSystemConfig;
  onChange: (value: RPGSystemConfig) => void;
  // Componentes auxiliares passados como props para evitar duplicação
  LabelLocalizationEditor: React.ComponentType<{
    label: string;
    value: LabelLocalization;
    onChange: (v: LabelLocalization) => void;
  }>;
  CompactTextLocalizationEditor: React.ComponentType<{
    label: string;
    value: Localization<string>;
    onChange: (v: Localization<string>) => void;
    placeholder?: string;
  }>;
  EmojiPicker: React.ComponentType<{
    value?: string;
    onChange: (v: string) => void;
    placeholder?: string;
  }>;
}

const ConfigTab: React.FC<ConfigTabProps> = ({
  value,
  onChange,
  LabelLocalizationEditor,
  CompactTextLocalizationEditor,
  EmojiPicker,
}) => {
  const patch = (p: Partial<RPGSystemConfig>) => onChange({ ...value, ...p });

  return (
    <Card className="border-l-4 border-l-cyan-500 hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gradient-to-r from-cyan-500/10 to-transparent">
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">⚙️</span>
          Configuração do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 pt-6">
        <div className="grid gap-2">
          <Label>Emoji</Label>
          <EmojiPicker
            value={value.emoji ?? ""}
            onChange={(v) => patch({ emoji: v })}
            placeholder="ex.: 🎲"
          />
        </div>
        <LabelLocalizationEditor
          label="Nome (localizado)"
          value={value.name}
          onChange={(v) => patch({ name: v })}
        />
        <CompactTextLocalizationEditor
          label="Descrição"
          value={value.description}
          onChange={(v) => patch({ description: v })}
          placeholder="Breve resumo do sistema"
        />
      </CardContent>
    </Card>
  );
};

export default ConfigTab;
