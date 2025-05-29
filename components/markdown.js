/**
 * Markdown to HTML converter for MiniKraken-Website
 * This module provides functions to convert Markdown text to HTML
 */

/**
 * Converts Markdown text to HTML
 * @param {string} markdown - The markdown text to convert
 * @returns {string} - The HTML representation of the markdown
 */
function markdownToHtml(markdown) {
    if (!markdown) return '';
    
    let html = markdown;
      // Process code blocks first (```code```)
    html = processCodeBlocks(html);
    
    // Process inline code (`code`)
    html = processInlineCode(html);
    
    // Process blockquotes
    html = processBlockquotes(html);
    
    // Process headers (# Header)
    html = processHeaders(html);
    
    // Process bold and italic
    html = processBoldItalic(html);
    
    // Process lists
    html = processLists(html);
    
    // Process links [text](url)
    html = processLinks(html);
    
    // Process images ![alt](url)
    html = processImages(html);
    
    // Process tables
    html = processTables(html);
    
    // Process horizontal rules
    html = processHorizontalRules(html);
    
    // Process paragraphs (must be last)
    html = processParagraphs(html);
    
    return html;
}

/**
 * Processes code blocks in markdown
 * @param {string} text - The markdown text
 * @returns {string} - Text with code blocks converted to HTML
 */
function processCodeBlocks(text) {
    // Replace code blocks with styled <pre><code> tags
    const codeBlockRegex = /```([\s\S]*?)```/g;
    return text.replace(codeBlockRegex, (match, code) => {
        return `<pre class="bg-dark text-light p-3 rounded border-start border-primary border-4"><code class="text-info">${escapeHtml(code.trim())}</code></pre>`;
    });
}

/**
 * Processes inline code in markdown
 * @param {string} text - The markdown text
 * @returns {string} - Text with inline code converted to HTML
 */
function processInlineCode(text) {
    // Replace inline code (`code`) with styled <code> tags
    return text.replace(/`([^`]+)`/g, '<code class="bg-light text-secondary  px-2 py-1 rounded border">$1</code>');
}

/**
 * Processes blockquotes in markdown
 * @param {string} text - The markdown text
 * @returns {string} - Text with blockquotes converted to HTML
 */
function processBlockquotes(text) {
    // Replace blockquotes (> text) with styled blockquote tags
    const blockquoteRegex = /^>\s*(.*)$/gm;
    let processed = text.replace(blockquoteRegex, '<blockquote-line>$1</blockquote-line>');
      // Group consecutive blockquote lines
    processed = processed.replace(/(<blockquote-line>.*?<\/blockquote-line>\s*)+/gs, match => {
        const content = match.replace(/<blockquote-line>(.*?)<\/blockquote-line>/gs, '$1<br>').replace(/<br>$/, '');
        return `<blockquote class="blockquote border-start border-primary border-4 ps-4 py-3 bg-light rounded-end mb-4">
                  <p class="mb-0 text-dark fst-italic lead">${content}</p>
                </blockquote>`;
    });
    
    return processed;
}

/**
 * Processes headers in markdown
 * @param {string} text - The markdown text
 * @returns {string} - Text with headers converted to HTML
 */
function processHeaders(text) {
    // Replace headers (# Header) with styled <h1> to <h6> tags with white text for dark backgrounds
    return text
        .replace(/^# (.*)$/gm, '<h1 class="display-5 fw-bold text-white mb-4 border-bottom border-primary pb-2">$1</h1>')
        .replace(/^## (.*)$/gm, '<h2 class="h2 fw-semibold text-white mb-3 mt-5">$1</h2>')
        .replace(/^### (.*)$/gm, '<h3 class="h3 fw-semibold text-white mb-3 mt-4">$1</h3>')
        .replace(/^#### (.*)$/gm, '<h4 class="h4 fw-normal text-white mb-2 mt-3">$1</h4>')
        .replace(/^##### (.*)$/gm, '<h5 class="h5 fw-normal text-white  mb-2 mt-3">$1</h5>')
        .replace(/^###### (.*)$/gm, '<h6 class="h6 fw-normal text-secondary  mb-2 mt-2">$1</h6>');
}

/**
 * Processes bold and italic text in markdown
 * @param {string} text - The markdown text
 * @returns {string} - Text with bold and italic converted to HTML
 */
function processBoldItalic(text) {
    // Replace bold (**text**) with styled <strong> tags
    let processed = text.replace(/\*\*(.*?)\*\*/g, '<strong class="fw-bold">$1</strong>');
    
    // Replace italic (*text*) with styled <em> tags
    processed = processed.replace(/\*(.*?)\*/g, '<em class="fst-italic text-info">$1</em>');
    
    return processed;
}

/**
 * Processes lists in markdown
 * @param {string} text - The markdown text
 * @returns {string} - Text with lists converted to HTML
 */
function processLists(text) {
    // Process unordered lists with better styling
    let processed = text.replace(/^\s*[-*+]\s+(.*)$/gm, '<li class="mb-2 text-secondary lead">$1</li>');
    
    // Process ordered lists with better styling
    processed = processed.replace(/^\s*\d+\.\s+(.*)$/gm, '<li class="mb-2 text-secondary lead">$1</li>');
    
    // Wrap list items in styled <ul> or <ol> tags
    const ulRegex = /<li>.*?<\/li>/gs;
    if (ulRegex.test(processed)) {
        processed = processed.replace(/(<li class="mb-2 text-light lead">.*?<\/li>)+/gs, match => 
            `<ul class="list-unstyled ps-4 border-start border-primary border-3">${match}</ul>`
        );
    }
    
    return processed;
}

/**
 * Processes links in markdown
 * @param {string} text - The markdown text
 * @returns {string} - Text with links converted to HTML
 */
function processLinks(text) {
    // Replace links [text](url) with styled <a> tags
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;
    return text.replace(linkRegex, '<a href="$2" class="text-decoration-none fw-semibold text-primary">$1 <i class="fas fa-external-link-alt ms-1 small"></i></a>');
}

/**
 * Processes images in markdown
 * @param {string} text - The markdown text
 * @returns {string} - Text with images converted to HTML
 */
function processImages(text) {
    // Replace images ![alt](url) with styled <img> tags
    const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
    return text.replace(imageRegex, '<figure class="text-center my-4"><img src="$2" alt="$1" class="img-fluid rounded shadow-sm border"><figcaption class="figure-caption text-muted mt-2">$1</figcaption></figure>');
}

/**
 * Processes tables in markdown
 * @param {string} text - The markdown text
 * @returns {string} - Text with tables converted to HTML
 */
function processTables(text) {
    // Match markdown tables (pipe-separated values with header separator)
    const tableRegex = /^(\|.*\|)\s*\n(\|[-:\s\|]*\|)\s*\n((?:\|.*\|\s*(?:\n|$))+)/gm;
    
    return text.replace(tableRegex, (match, headerRow, separatorRow, bodyRows) => {
        // Process header row
        const headers = headerRow
            .split('|')
            .map(cell => cell.trim())
            .filter(cell => cell !== '');
        
        // Parse alignment from separator row
        const alignments = separatorRow
            .split('|')
            .map(cell => cell.trim())
            .filter(cell => cell !== '')
            .map(cell => {
                if (cell.startsWith(':') && cell.endsWith(':')) return 'center';
                if (cell.endsWith(':')) return 'right';
                return 'left';
            });
        
        // Process body rows
        const rows = bodyRows
            .trim()
            .split('\n')
            .map(row => {
                return row
                    .split('|')
                    .map(cell => cell.trim())
                    .filter(cell => cell !== '');
            })
            .filter(row => row.length > 0);          // Build HTML table with custom enhanced styling
        let html = '<div class="table-responsive-enhanced">\n';
        html += '  <table class="table table-hover table-enhanced table-dark table-sm">\n';          // Add header with custom enhanced styling
        if (headers.length > 0) {
            html += '    <thead>\n      <tr>\n';
            headers.forEach((header, index) => {
                const align = alignments[index] || 'left';
                const alignClass = align === 'center' ? ' class="text-center"' : 
                                 align === 'right' ? ' class="text-end"' : '';
                html += `        <th${alignClass}>${header}</th>\n`;
            });
            html += '      </tr>\n    </thead>\n';
        }        // Add body with custom enhanced styling and responsive data labels
        if (rows.length > 0) {
            html += '    <tbody>\n';
            rows.forEach((row, rowIndex) => {
                html += `      <tr>\n`;
                row.forEach((cell, index) => {
                    const align = alignments[index] || 'left';
                    const alignClass = align === 'center' ? ' class="text-center"' : 
                                     align === 'right' ? ' class="text-end"' : '';
                    const dataLabel = headers[index] || `Column ${index + 1}`;
                    html += `        <td${alignClass} data-label="${dataLabel}">${cell}</td>\n`;
                });
                html += '      </tr>\n';
            });
            html += '    </tbody>\n';
        }html += '  </table>\n</div>';
        return html;
    });
}

/**
 * Processes horizontal rules in markdown
 * @param {string} text - The markdown text
 * @returns {string} - Text with horizontal rules converted to HTML
 */
function processHorizontalRules(text) {
    // Replace horizontal rules (---, ***, ___) with styled <hr> tags
    return text.replace(/^(---|\*\*\*|___)$/gm, '<hr class="my-5 border-primary border-2 opacity-50">');
}

/**
 * Processes paragraphs in markdown
 * @param {string} text - The markdown text
 * @returns {string} - Text with paragraphs converted to HTML
 */
function processParagraphs(text) {
    // Split by double newlines to identify paragraphs
    const paragraphs = text.split(/\n\s*\n/);
    
    // Wrap each paragraph with styled <p> tags if it doesn't already have block-level HTML
    return paragraphs
        .map(p => {
            p = p.trim();            if (p && !p.startsWith('<h') && !p.startsWith('<ul') && 
                !p.startsWith('<ol') && !p.startsWith('<pre') && 
                !p.startsWith('<hr') && !p.startsWith('<table') && 
                !p.startsWith('<figure') && !p.startsWith('<blockquote')) {
                return `<p class="lead text-secondary mb-3">${p}</p>`;
            }
            return p;
        })
        .join('\n\n');
}

/**
 * Escapes HTML special characters
 * @param {string} text - The text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

module.exports = {
    markdownToHtml
};