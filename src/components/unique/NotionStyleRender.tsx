import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MentionChipProps {
  id: string;
  label: string;
  type?: string;
  emoji?: string;
}

function MentionChip({ id, label, type, emoji }: MentionChipProps) {
  const getTypeColor = (mentionType: string) => {
    switch (mentionType) {
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
        return "hsl(var(--primary))";
    }
  };

  return (
    <span
      data-stat-id={id}
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-colors hover:opacity-80"
      style={{
        backgroundColor: type ? getTypeColor(type) : "hsl(var(--primary))",
        color: "white",
      }}
      title={`@${label} � ID: ${id}`}
    >
      {emoji && <span>{emoji}</span>}
      <span>@{label}</span>
    </span>
  );
}

const PROPERTY_LABEL: Record<string, string> = {
  value: "valor",
  strvalue: "texto",
  name: "nome",
  emoji: "emoji",
};

interface NotionStyleRenderProps {
  content: string;
  stats?: Array<{
    id: number;
    type: string;
    emoji?: string;
    name?: { default: string };
  }>;
  sections?: Array<{
    id: number;
    name?: { default: string };
    emoji?: string;
  }>;
}

export function NotionStyleRender({
  content,
  stats = [],
  sections = [],
}: NotionStyleRenderProps) {
  const mentionRegex = /<(stat|section):(\d+):(value|strvalue|name|emoji)>/g;

  const resolveMention = (
    category: string,
    id: string,
    property: string
  ): { label: string; type: string; emoji: string } => {
    if (category === "stat") {
      const stat = stats.find((item) => item.id.toString() === id);
      const baseName = stat?.name?.default ?? `Stat ${id}`;
      const propertyLabel = PROPERTY_LABEL[property] ?? property;
      return {
        label: `${baseName} � ${propertyLabel}`,
        type: stat?.type ?? "unknown",
        emoji: stat?.emoji ?? "",
      };
    }

    const section = sections.find((item) => item.id.toString() === id);
    const baseName = section?.name?.default ?? `Secao ${id}`;
    const propertyLabel = PROPERTY_LABEL[property] ?? property;
    return {
      label: `${baseName} � ${propertyLabel}`,
      type: "section",
      emoji: section?.emoji ?? "",
    };
  };

  const renderContent = () => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = mentionRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {content.slice(lastIndex, match.index)}
          </span>
        );
      }

      const [fullMatch, category, id, property] = match;
      const info = resolveMention(category, id, property);

      parts.push(
        <MentionChip
          key={`mention-${match.index}`}
          id={id}
          label={info.label}
          type={info.type}
          emoji={info.emoji}
        />
      );

      lastIndex = match.index + fullMatch.length;
    }

    if (lastIndex < content.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {content.slice(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : content;
  };

  const hasMarkdown = /[#[\]*_>\-]/.test(content);

  if (!hasMarkdown) {
    return (
      <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
        {renderContent()}
      </div>
    );
  }

  const placeholderRegex = /__MENTION__(\w+)__(\d+)__(\w+)__/g;
  const contentWithPlaceholders = content.replace(
    mentionRegex,
    (_, category, id, property) => `__MENTION__${category}__${id}__${property}__`
  );

  return (
    <div className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => {
            const processNodes = (nodes: React.ReactNode): React.ReactNode => {
              if (typeof nodes === "string") {
                const parts: React.ReactNode[] = [];
                let lastIndex = 0;
                let match: RegExpExecArray | null;

                while ((match = placeholderRegex.exec(nodes)) !== null) {
                  if (match.index > lastIndex) {
                    parts.push(nodes.slice(lastIndex, match.index));
                  }

                  const [, category, id, property] = match;
                  const info = resolveMention(category, id, property);

                  parts.push(
                    <MentionChip
                      key={`mention-${match.index}`}
                      id={id}
                      label={info.label}
                      type={info.type}
                      emoji={info.emoji}
                    />
                  );

                  lastIndex = match.index + match[0].length;
                }

                if (lastIndex < nodes.length) {
                  parts.push(nodes.slice(lastIndex));
                }

                return parts.length > 0 ? <>{parts}</> : nodes;
              }

              return nodes;
            };

            return <p>{processNodes(children)}</p>;
          },
        }}
      >
        {contentWithPlaceholders}
      </ReactMarkdown>
    </div>
  );
}
