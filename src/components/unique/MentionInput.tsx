import React, { useRef, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type MentionOption = {
  id: number;
  type: string;
  emoji?: string;
  name?: { default: string };
};

type MentionInputProps = {
  value: string;
  onChange: (value: string) => void;
  stats?: MentionOption[];
  placeholder?: string;
  className?: string;
  maxLength?: number;
  showCharCount?: boolean;
};

const TYPE_COLOR: Record<string, string> = {
  numeric: "hsl(217, 91%, 60%)",
  enum: "hsl(262.1, 83.3%, 57.8%)",
  boolean: "hsl(142, 76%, 36%)",
  string: "hsl(25, 95%, 53%)",
  calculated: "hsl(346, 77%, 50%)",
};

export const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChange,
  stats = [],
  placeholder,
  className,
  maxLength,
  showCharCount,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<MentionOption[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);

  const currentLength = String(value || "").length;
  const isNearLimit = maxLength && currentLength > maxLength * 0.8;
  const isOverLimit = maxLength && currentLength > maxLength;

  function getMentionContext(text: string, cursor: number) {
    const before = text.slice(0, cursor);
    const match = before.match(/@([^\s@]*)$/);
    if (!match) return null;
    const queryRaw = match[1] ?? "";
    const start = before.lastIndexOf("@");
    return { start, end: cursor, query: queryRaw };
  }

  function measureCaret() {
    const input = inputRef.current;
    if (!input) return null;

    const { selectionStart } = input;
    if (selectionStart === null) return null;
    
    // Cria um elemento temporário para medir a posição do cursor
    const mirror = document.createElement("div");
    const computed = window.getComputedStyle(input);
    
    for (const prop of [
      "fontFamily",
      "fontSize",
      "fontWeight",
      "letterSpacing",
      "paddingLeft",
      "paddingRight",
      "borderLeftWidth",
      "borderRightWidth",
    ]) {
      // @ts-expect-error - computed style index signature
      mirror.style[prop] = computed[prop];
    }
    
    mirror.style.position = "absolute";
    mirror.style.visibility = "hidden";
    mirror.style.whiteSpace = "pre";
    mirror.textContent = value.substring(0, selectionStart);
    
    document.body.appendChild(mirror);
    const mirrorRect = mirror.getBoundingClientRect();
    const inputRect = input.getBoundingClientRect();
    document.body.removeChild(mirror);

    return {
      top: inputRect.bottom + 4,
      left: inputRect.left + mirrorRect.width,
    };
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newVal = e.target.value;
    onChange(newVal);

    const ctx = getMentionContext(newVal, e.target.selectionStart ?? 0);
    if (!ctx) {
      if (open) setOpen(false);
      return;
    }

    setOpen(true);
    setDropdownPosition(measureCaret());

    const normalized = ctx.query.trim().toLowerCase();
    const filtered = stats.filter((stat) => {
      const label = stat.name?.default || `Stat ${stat.id}`;
      return (
        label.toLowerCase().includes(normalized) ||
        stat.id.toString().includes(normalized)
      );
    });
    
    setResults(filtered.slice(0, 8));
    setActiveIndex(0);
  }

  function insertMention(stat: MentionOption) {
    const input = inputRef.current;
    if (!input) return;
    
    const { selectionStart } = input;
    if (selectionStart === null) return;
    
    const ctx = getMentionContext(value, selectionStart);
    if (!ctx) return;
    
    const before = value.slice(0, ctx.start);
    const after = value.slice(selectionStart);
    const token = `<stat:${stat.id}:value>`;
    const next = before + token + after;
    
    onChange(next);
    
    requestAnimationFrame(() => {
      if (!inputRef.current) return;
      const pos = (before + token).length;
      inputRef.current.selectionStart = pos;
      inputRef.current.selectionEnd = pos;
      inputRef.current.focus();
    });
    
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(0, results.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" || e.key === "Tab") {
      if (results.length > 0) {
        e.preventDefault();
        const pick = results[activeIndex];
        if (pick) insertMention(pick);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  }

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  // Atualiza a posição do dropdown ao rolar
  useEffect(() => {
    function onScrollOrResize() {
      if (!open) return;
      setDropdownPosition(measureCaret());
    }
    
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);
    
    return () => {
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, [open]);

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          isOverLimit && "border-red-500 focus-visible:ring-red-500",
          className
        )}
      />
      
      {showCharCount && maxLength && (
        <div
          className={cn(
            "text-xs mt-1 text-right",
            isOverLimit
              ? "text-red-500"
              : isNearLimit
              ? "text-yellow-600"
              : "text-muted-foreground"
          )}
        >
          {currentLength}/{maxLength}
        </div>
      )}
      
      {open && dropdownPosition && results.length > 0 && (
        <div
          className="fixed z-50 w-80 rounded-xl border border-border bg-popover shadow-2xl animate-in fade-in-0 zoom-in-95"
          style={{
            top: dropdownPosition.top,
            left: Math.min(dropdownPosition.left, window.innerWidth - 340), // Garante que não saia da tela
          }}
        >
          <div className="p-1">
            <ul className="max-h-64 overflow-auto">
              {results.map((stat, i) => {
                const label = stat.name?.default || `Stat ${stat.id}`;
                return (
                  <li
                    key={stat.id}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      insertMention(stat);
                    }}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                      i === activeIndex
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50"
                    }`}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-lg">
                      {stat.emoji || "✨"}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm font-medium">{label}</span>
                      <span className="text-xs text-muted-foreground">
                        ID: {stat.id}
                      </span>
                    </div>
                    <Badge
                      style={{
                        backgroundColor: TYPE_COLOR[stat.type],
                        color: "white",
                      }}
                      className="text-xs"
                    >
                      {stat.type}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
