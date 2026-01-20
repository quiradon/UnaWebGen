// Robust markdown to HTML converter using unified/remark ecosystem
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';

export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  try {
    const result = unified()
      .use(remarkParse) // Parse markdown
      .use(remarkGfm) // Support GitHub Flavored Markdown (tables, strikethrough, task lists, etc.)
      .use(remarkRehype, { allowDangerousHtml: true }) // Convert to HTML AST
      .use(rehypeRaw) // Parse HTML in markdown
      .use(rehypeHighlight) // Add syntax highlighting to code blocks
      .use(rehypeStringify) // Serialize to HTML
      .processSync(markdown);
    
    let html = String(result);
    
    // Apply Bootstrap classes to maintain the existing styling
    html = applyBootstrapClasses(html);
    
    return html;
  } catch (error) {
    console.error('Error processing markdown:', error);
    return markdown;
  }
}

function applyBootstrapClasses(html: string): string {
  // Headers
  html = html.replace(/<h1>/g, '<h1 class="display-6 fw-bold text-white mb-4 mt-4">');
  html = html.replace(/<h2>/g, '<h2 class="h2 fw-semibold text-white mb-3 mt-5">');
  html = html.replace(/<h3>/g, '<h3 class="h3 fw-semibold text-light mb-3 mt-4">');
  html = html.replace(/<h4>/g, '<h4 class="h4 fw-normal text-light mb-2 mt-3">');
  html = html.replace(/<h5>/g, '<h5 class="h5 fw-normal text-light mb-2 mt-3">');
  html = html.replace(/<h6>/g, '<h6 class="h6 fw-normal text-secondary mb-2 mt-2">');
  
  // Paragraphs
  html = html.replace(/<p>/g, '<p class="lead text-secondary mb-3 lh-lg" style="font-size: 1.1rem;">');
  
  // Code blocks - clean styling without colored borders
  html = html.replace(/<pre>/g, '<pre class="hljs rounded shadow-sm my-4 code-block-custom" style="background: #1e1e1e; overflow-x: auto; padding: 1.25rem; border: 1px solid rgba(255, 255, 255, 0.1);">');
  
  // Inline code
  html = html.replace(/<code(?![^>]*class="language-)/g, '<code class="text-warning px-2 py-1 rounded"');
  
  // Blockquotes
  html = html.replace(/<blockquote>/g, '<blockquote class="blockquote border-start border-info border-3 ps-4 py-3 my-4 bg-dark bg-opacity-50 rounded-end">');
  
  // Horizontal rules
  html = html.replace(/<hr>/g, '<hr class="my-5 border-secondary opacity-25">');
  
  // Images with figure wrapper
  html = html.replace(/<img\s+([^>]*?)src="([^"]*)"([^>]*?)alt="([^"]*)"([^>]*?)>/g, 
    '<figure class="text-center my-4"><img src="$2" alt="$4" class="img-fluid rounded shadow border border-secondary border-opacity-25 markdown-img-zoomable" style="cursor: zoom-in;"$1$3$5><figcaption class="figure-caption text-muted mt-2 fst-italic">$4</figcaption></figure>');
  
  // Lists (unordered)
  html = html.replace(/<ul>/g, '<ul class="ms-3 mb-3">');
  
  // Lists (ordered)
  html = html.replace(/<ol>/g, '<ol class="ms-3 mb-3">');
  
  // List items
  html = html.replace(/<li>/g, '<li class="mb-2 text-light">');
  
  // Links
  html = html.replace(/<a\s+/g, '<a class="text-info text-decoration-none hover-underline" ');
  
  // Tables
  html = html.replace(/<table>/g, '<table class="table table-dark table-striped table-hover my-4">');
  html = html.replace(/<thead>/g, '<thead class="table-secondary">');
  
  // Strong/bold
  html = html.replace(/<strong>/g, '<strong class="fw-bold text-white">');
  
  // Emphasis/italic
  html = html.replace(/<em>/g, '<em class="fst-italic text-info">');
  
  return html;
}

