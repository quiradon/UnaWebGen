import { useRef, useState } from 'react';
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  linkDialogPlugin,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import './notion-markdown-editor.css';
import { NotionStyleRender } from './NotionStyleRender';
import { Badge } from '@/components/ui/badge';

interface Stats {
  id: number;
  type: string;
  emoji?: string;
  name?: { default: string; [key: string]: string };
  min?: number;
  options?: number | any[];
}

interface Section {
  id: number;
  name?: { default: string; [key: string]: string };
  emoji?: string;
}

interface NotionMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  stats?: Stats[];
  sections?: Section[];
  locale?: string;
}

export function NotionMarkdownEditor({
  value,
  onChange,
  placeholder = "Digite seu markdown...",
  stats = [],
  sections = [],
}: NotionMarkdownEditorProps) {
  const editorRef = useRef<any>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery] = useState('');
  const [cursorPosition] = useState<{ top: number; left: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Filtrar stats e sections para mentions
  const allMentions = [
    ...stats.map(stat => ({
      id: `stat:${stat.id}`,
      label: stat.name?.default || `Stat ${stat.id}`,
      type: 'stat',
      emoji: stat.emoji,
      subType: stat.type,
    })),
    ...sections.map(section => ({
      id: `section:${section.id}`,
      label: section.name?.default || `Seção ${section.id}`,
      type: 'section',
      emoji: section.emoji,
      subType: 'section',
    }))
  ];

  const filteredMentions = allMentions.filter(m =>
    m.label.toLowerCase().includes(mentionQuery.toLowerCase())
  ).slice(0, 8);

  const insertMention = (mentionId: string, property: 'name' | 'value' | 'emoji' = 'value') => {
    const [type, id] = mentionId.split(':');
    const token = `<${type}:${id}:${property}>`;
    
    // Inserir no editor
    if (editorRef.current) {
      const currentValue = value;
      // Inserir na posição do cursor
      onChange(currentValue + token);
    }
    
    setShowMentions(false);
  };

  const getTypeColor = (subType: string) => {
    switch (subType) {
      case 'numeric': return 'hsl(217, 91%, 60%)';
      case 'enum': return 'hsl(262.1, 83.3%, 57.8%)';
      case 'boolean': return 'hsl(142, 76%, 36%)';
      case 'string': return 'hsl(25, 95%, 53%)';
      case 'calculated': return 'hsl(346, 77%, 50%)';
      case 'section': return 'hsl(262.1, 83.3%, 57.8%)';
      default: return 'hsl(var(--primary))';
    }
  };

  return (
    <div className="relative">
      <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden notion-markdown-editor">
        <MDXEditor
          ref={editorRef}
          markdown={value}
          onChange={onChange}
          placeholder={placeholder}
          className="min-h-[200px]"
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            markdownShortcutPlugin(),
            linkPlugin(),
            linkDialogPlugin(),
            tablePlugin(),
            codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
            codeMirrorPlugin({ 
              codeBlockLanguages: { 
                js: 'JavaScript', 
                ts: 'TypeScript',
                css: 'CSS',
                python: 'Python',
                json: 'JSON'
              } 
            }),
          ]}
        />
      </div>

      {/* Preview com variáveis renderizadas */}
      <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
        <h4 className="text-sm font-medium mb-2 text-muted-foreground">Preview</h4>
        <div className="prose prose-sm max-w-none">
          <NotionStyleRender content={value} stats={stats} />
        </div>
      </div>

      {/* Dropdown de Mentions */}
      {showMentions && cursorPosition && (
        <div
          className="fixed z-50 w-80 rounded-xl border border-border bg-popover shadow-2xl animate-in fade-in-0 zoom-in-95"
          style={{
            top: cursorPosition.top,
            left: cursorPosition.left,
          }}
        >
          <div className="p-1">
            <ul className="max-h-64 overflow-auto">
              {filteredMentions.map((m, idx) => (
                <li
                  key={m.id}
                  onClick={() => insertMention(m.id)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                    idx === activeIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-lg">
                    {m.emoji || (m.type === 'stat' ? '📊' : '📄')}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm font-medium">{m.label}</span>
                    <span className="text-xs text-muted-foreground">{m.id}</span>
                  </div>
                  <Badge
                    style={{ backgroundColor: getTypeColor(m.subType), color: 'white' }}
                    className="text-xs"
                  >
                    {m.subType}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
