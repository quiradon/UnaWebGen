// Minimal markdown to HTML converter adapted for SSR usage
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';
  let html = markdown;
  html = processCodeBlocks(html);
  html = html.replace(/`([^`]+)`/g, '<code class="bg-light text-secondary  px-2 py-1 rounded border">$1</code>');
  html = processBlockquotes(html);
  html = processHeaders(html);
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="fw-bold">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em class="fst-italic text-info">$1</em>');
  html = processLists(html);
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1<\/a>');
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<figure class="text-center my-4"><img src="$2" alt="$1" class="img-fluid rounded shadow-sm border"><figcaption class="figure-caption text-muted mt-2">$1<\/figcaption><\/figure>');
  html = processHorizontalRules(html);
  html = processParagraphs(html);
  return html;
}

function processCodeBlocks(text: string): string {
  const codeBlockRegex = /```([\s\S]*?)```/g;
  return text.replace(codeBlockRegex, (_m, code) => {
    return `<pre class="bg-dark text-light p-3 rounded border-start border-primary border-4"><code class="text-info">${escapeHtml(String(code).trim())}</code></pre>`;
  });
}

function processBlockquotes(text: string): string {
  const blockquoteRegex = /^>\s*(.*)$/gm;
  let processed = text.replace(blockquoteRegex, '<blockquote-line>$1</blockquote-line>');
  processed = processed.replace(/(<blockquote-line>.*?<\/blockquote-line>\s*)+/gs, (match) => {
    const content = match.replace(/<blockquote-line>(.*?)<\/blockquote-line>/gs, '$1<br>').replace(/<br>$/, '');
    return `<blockquote class="blockquote border-start border-primary border-4 ps-4 py-3 bg-light rounded-end mb-4"><p class="mb-0 text-dark fst-italic lead">${content}</p></blockquote>`;
  });
  return processed;
}

function processHeaders(text: string): string {
  return text
    .replace(/^# (.*)$/gm, '<h1 class="display-5 fw-bold text-white mb-4 border-bottom border-primary pb-2">$1</h1>')
    .replace(/^## (.*)$/gm, '<h2 class="h2 fw-semibold text-white mb-3 mt-5">$1</h2>')
    .replace(/^### (.*)$/gm, '<h3 class="h3 fw-semibold text-white mb-3 mt-4">$1</h3>')
    .replace(/^#### (.*)$/gm, '<h4 class="h4 fw-normal text-white mb-2 mt-3">$1</h4>')
    .replace(/^##### (.*)$/gm, '<h5 class="h5 fw-normal text-white  mb-2 mt-3">$1</h5>')
    .replace(/^###### (.*)$/gm, '<h6 class="h6 fw-normal text-secondary  mb-2 mt-2">$1</h6>');
}

function processLists(text: string): string {
  // Simple unordered lists
  return text.replace(/(^|\n)\* (.*)(?=\n|$)/g, (_m, lead, item) => `${lead}<ul><li>${item}</li></ul>`);
}

function processHorizontalRules(text: string): string {
  return text.replace(/^(---|\*\*\*|___)$/gm, '<hr class="my-5 border-primary border-2 opacity-50">');
}

function processParagraphs(text: string): string {
  const paragraphs = text.split(/\n\s*\n/);
  return paragraphs
    .map((p) => {
      p = p.trim();
      if (
        p &&
        !p.startsWith('<h') &&
        !p.startsWith('<ul') &&
        !p.startsWith('<ol') &&
        !p.startsWith('<pre') &&
        !p.startsWith('<hr') &&
        !p.startsWith('<table') &&
        !p.startsWith('<figure') &&
        !p.startsWith('<blockquote')
      ) {
        return `<p class="lead text-secondary mb-3">${p}</p>`;
      }
      return p;
    })
    .join('\n\n');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

