import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { useMemo, useState } from "react";
import { Button } from "./button";
import { Badge } from "./badge";
import { ChevronDown } from "lucide-react";
import { PopoverContent } from "./popover";
import { Input } from "./input";
import { ScrollArea } from "./scroll-area";
import { Checkbox } from "./checkbox";

export type Locale =
  | "id" | "da" | "de" | "en-GB" | "en-US" | "es-ES" | "es-419" | "fr" | "hr" | "it"
  | "lt" | "hu" | "nl" | "no" | "pl" | "pt-BR" | "ro" | "fi" | "sv-SE" | "vi" | "tr"
  | "cs" | "el" | "bg" | "ru" | "uk" | "hi" | "th" | "zh-CN" | "ja" | "zh-TW" | "ko"
  | string;

export type Localization<T = string> = { default: T } & Partial<Record<Locale, T>>;

export type LabelString = string & { __brand_label100?: true };

export type LabelLocalization = { default: LabelString } & Partial<Record<Locale, LabelString>>;

export interface BaseSelectable {
  id: number;
  name: LabelLocalization;
  emoji?: string;
}

function shouldKeepInSearch(name: LabelLocalization, search: string) {
  if (search === "") {
    return true;
  }

  return Object.values(name).some(str => {
    if (!str) return false;
    str = str.toLowerCase();
    const words = search.toLowerCase().split(" ");
    return words.every(word => str.toLowerCase().includes(word));
  })
}


// =====================
// MultiSelect (reusável)
// =====================
export default function MultiSelect<T extends BaseSelectable>({ 
  options, 
  value, 
  onChange, 
  placeholders, 
  includeDefault = false 
}: { 
  options: T[]; 
  value: number[] | undefined; 
  onChange: (ids: number[]) => void; 
  placeholders: {
    input: string;
    search: string;
    notfound: string;
  }; 
  includeDefault?: boolean; 
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
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
    return options.find((s) => s.id === id)?.name?.default ?? String(id);
  };
  const selectedLabels = Array.from(selected).map(labelFor);

  const filteredOptions = useMemo(() => options.filter((value) => shouldKeepInSearch(value.name, search)), [options, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          <div className="flex flex-wrap gap-1 items-center">
            {selected.size === 0 ? (
              <span className="text-muted-foreground">{placeholders.input}</span>
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
              placeholder={placeholders.search}
              className="mb-2"
              onChange={(ev) => {
                setSearch(ev.target.value)
              }}
            />
          </div>
          <ScrollArea className="h-64">
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
              {filteredOptions.length === 0 ? (
                <div className="text-sm text-muted-foreground p-2">
                  {placeholders.notfound}
                </div>
              ) : (
                filteredOptions.map((section) => (
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
                      {section.name?.default ?? `ID ${section.id}`}
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