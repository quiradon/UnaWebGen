import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Badge } from "@/components/ui/badge";

type MentionTarget = {
  id: string;
  label: string;
  type: string;
  emoji?: string;
  property?: "value" | "strvalue" | "name" | "emoji";
  category?: "stat" | "section";
};

export type NotionStyleEditorHandle = {
  focus: () => void;
  getSelection: () => { start: number; end: number; value: string };
  setSelection: (start: number, end: number) => void;
  insertText: (text: string) => void;
  replaceSelection: (text: string) => void;
  wrapSelection: (before: string, after?: string, placeholder?: string) => void;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  fetchMentions: (query: string) => Promise<MentionTarget[]>;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
};

export const NotionStyleEditor = forwardRef<NotionStyleEditorHandle, Props>(
  function NotionStyleEditor(
    { value, onChange, fetchMentions, placeholder, className = "", style },
    ref
  ) {
    const taRef = useRef<HTMLTextAreaElement | null>(null);
    const [open, setOpen] = useState(false);
    const [results, setResults] = useState<MentionTarget[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [anchorRect, setAnchorRect] =
      useState<{ top: number; left: number } | null>(null);

    const placeholderLabel =
      placeholder || "Digite @ para mencionar variaveis...";

    function getMentionContext(text: string, cursor: number) {
      const before = text.slice(0, cursor);
      const match = before.match(/@([^\s@]*)$/);
      if (!match) return null;
      const queryRaw = match[1] ?? "";
      const start = before.lastIndexOf("@");
      return { start, end: cursor, query: queryRaw };
    }

    function measureCaret() {
      const ta = taRef.current;
      if (!ta) return null;
      const { selectionStart } = ta;
      const mirror = document.createElement("div");
      const computed = window.getComputedStyle(ta);
      for (const prop of [
        "fontFamily",
        "fontSize",
        "fontWeight",
        "letterSpacing",
        "lineHeight",
        "paddingTop",
        "paddingLeft",
        "paddingRight",
        "paddingBottom",
        "borderLeftWidth",
        "borderTopWidth",
        "whiteSpace",
      ]) {
      // @ts-expect-error - computed style index signature is not defined in TS
      mirror.style[prop] = computed[prop];
      }
      mirror.style.position = "absolute";
      mirror.style.visibility = "hidden";
      mirror.style.whiteSpace = "pre-wrap";
      mirror.style.wordWrap = "break-word";
      mirror.style.width = ta.offsetWidth + "px";
      mirror.textContent = ta.value.substring(0, selectionStart);
      document.body.appendChild(mirror);
      const rect = mirror.getBoundingClientRect();
      const taRect = ta.getBoundingClientRect();
      document.body.removeChild(mirror);
      return {
        top: taRect.top + rect.height,
        left: taRect.left + parseInt(computed.paddingLeft ?? "0", 10),
      };
    }

    async function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
      const newVal = e.target.value;
      onChange(newVal);

      const ctx = getMentionContext(newVal, e.target.selectionStart);
      if (!ctx) {
        if (open) setOpen(false);
        return;
      }

      setOpen(true);
      setAnchorRect(measureCaret());

      try {
        const items = await fetchMentions(ctx.query);
        setResults(items.slice(0, 8));
        setActiveIndex(0);
      } catch (error) {
        console.error("Error fetching mentions:", error);
        setResults([]);
      }
    }

    function insertMention(m: MentionTarget) {
      const ta = taRef.current;
      if (!ta) return;
      const { selectionStart } = ta;
      const ctx = getMentionContext(value, selectionStart);
      if (!ctx) return;
      const before = value.slice(0, ctx.start);
      const after = value.slice(selectionStart);
      const category = m.category || "stat";
      const property = m.property || "value";
      const token = `<${category}:${m.id}:${property}>`;
      const next = before + token + after;
      onChange(next);
      requestAnimationFrame(() => {
        if (!taRef.current) return;
        const pos = (before + token).length;
        taRef.current.selectionStart = pos;
        taRef.current.selectionEnd = pos;
        taRef.current.focus();
      });
      setOpen(false);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) =>
          Math.min(i + 1, Math.max(0, results.length - 1))
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        const pick = results[activeIndex];
        if (pick) insertMention(pick);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    }

    useImperativeHandle(ref, () => ({
      focus() {
        taRef.current?.focus();
      },
      getSelection() {
        const ta = taRef.current;
        if (!ta) return { start: 0, end: 0, value };
        return {
          start: ta.selectionStart,
          end: ta.selectionEnd,
          value,
        };
      },
      setSelection(start, end) {
        requestAnimationFrame(() => {
          if (!taRef.current) return;
          taRef.current.selectionStart = start;
          taRef.current.selectionEnd = end;
        });
      },
      insertText(text) {
        const ta = taRef.current;
        if (!ta) return;
        const { selectionStart, selectionEnd } = ta;
        const next =
          value.slice(0, selectionStart) +
          text +
          value.slice(selectionEnd, value.length);
        onChange(next);
        const caret = selectionStart + text.length;
        requestAnimationFrame(() => {
          if (!taRef.current) return;
          taRef.current.selectionStart = caret;
          taRef.current.selectionEnd = caret;
          taRef.current.focus();
        });
      },
      replaceSelection(text) {
        const ta = taRef.current;
        if (!ta) return;
        const { selectionStart, selectionEnd } = ta;
        const next =
          value.slice(0, selectionStart) +
          text +
          value.slice(selectionEnd, value.length);
        onChange(next);
        const caret = selectionStart + text.length;
        requestAnimationFrame(() => {
          if (!taRef.current) return;
          taRef.current.selectionStart = caret;
          taRef.current.selectionEnd = caret;
          taRef.current.focus();
        });
      },
      wrapSelection(before, after = before, placeholder = "") {
        const ta = taRef.current;
        if (!ta) return;
        const { selectionStart, selectionEnd } = ta;
        const hasSelection = selectionStart !== selectionEnd;
        const inner = hasSelection
          ? value.slice(selectionStart, selectionEnd)
          : placeholder;
        const wrapped = before + inner + after;
        const next =
          value.slice(0, selectionStart) +
          wrapped +
          value.slice(selectionEnd, value.length);
        onChange(next);
        const start = selectionStart + before.length;
        const end = start + inner.length;
        requestAnimationFrame(() => {
          if (!taRef.current) return;
          taRef.current.selectionStart = start;
          taRef.current.selectionEnd = end;
          taRef.current.focus();
        });
      },
    }));

    useEffect(() => {
      function onScrollOrResize() {
        if (!open) return;
        setAnchorRect(measureCaret());
      }
      window.addEventListener("resize", onScrollOrResize);
      window.addEventListener("scroll", onScrollOrResize, true);
      return () => {
        window.removeEventListener("resize", onScrollOrResize);
        window.removeEventListener("scroll", onScrollOrResize, true);
      };
    }, [open]);

    const getTypeColor = (type: string) => {
      switch (type) {
        case "numeric":
          return "hsl(217, 91%, 60%)";
        case "enum":
          return "hsl(262.1, 83.3%, 57.8%)";
        case "boolean":
          return "hsl(142, 76%, 36%)";
        case "string":
          return "hsl(25, 95%, 53%)";
        case "calculated":
          return "hsl(346, 77%, 50%)";
        default:
          return undefined;
      }
    };

    return (
      <div className="relative">
        <textarea
          ref={taRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholderLabel}
          className={`w-full min-h-[80px] rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm shadow-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-ring ${className}`}
          style={style}
        />
        {open && anchorRect && results.length > 0 && (
          <div
            className="fixed z-50 w-80 translate-y-1 rounded-xl border border-border bg-popover shadow-2xl animate-in fade-in-0 zoom-in-95"
            style={{
              top: anchorRect.top + window.scrollY,
              left: anchorRect.left + window.scrollX,
            }}
          >
            <div className="p-1">
              <ul className="max-h-64 overflow-auto">
                {results.map((m, i) => (
                  <li
                    key={`${m.category ?? "stat"}-${m.id}-${m.property ?? ""}`}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      insertMention(m);
                    }}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                      i === activeIndex
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50"
                    }`}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-lg">
                      {m.emoji || "✨"}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm font-medium">{m.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {m.property
                          ? `propriedade: ${m.property}`
                          : `ID: ${m.id}`}
                      </span>
                    </div>
                    {m.property ? (
                      <Badge variant="outline" className="text-xs">
                        {m.property}
                      </Badge>
                    ) : (
                      <Badge
                        style={{
                          backgroundColor: getTypeColor(m.type),
                          color: "white",
                        }}
                        className="text-xs"
                      >
                        {m.type}
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  }
);

NotionStyleEditor.displayName = "NotionStyleEditor";
