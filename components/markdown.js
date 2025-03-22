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
    // Replace code blocks with <pre><code> tags
    const codeBlockRegex = /```([\s\S]*?)```/g;
    return text.replace(codeBlockRegex, (match, code) => {
        return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
    });
}

/**
 * Processes headers in markdown
 * @param {string} text - The markdown text
 * @returns {string} - Text with headers converted to HTML
 */
function processHeaders(text) {
    // Replace headers (# Header) with <h1> to <h6> tags
    return text
        .replace(/^# (.*)$/gm, '<h1>$1</h1>')
        .replace(/^## (.*)$/gm, '<h2>$1</h2>')
        .replace(/^### (.*)$/gm, '<h3>$1</h3>')
        .replace(/^#### (.*)$/gm, '<h4>$1</h4>')
        .replace(/^##### (.*)$/gm, '<h5>$1</h5>')
        .replace(/^###### (.*)$/gm, '<h6>$1</h6>');
}

/**
 * Processes bold and italic text in markdown
 * @param {string} text - The markdown text
 * @returns {string} - Text with bold and italic converted to HTML
 */
function processBoldItalic(text) {
    // Replace bold (**text**) with <strong> tags
    let processed = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Replace italic (*text*) with <em> tags
    processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    return processed;
}

/**
 * Processes lists in markdown
 * @param {string} text - The markdown text
 * @returns {string} - Text with lists converted to HTML
 */
function processLists(text) {
    // Process unordered lists
    let processed = text.replace(/^\s*[-*+]\s+(.*)$/gm, '<li class="text-secondary lead">$1</li>');
    
    // Process ordered lists
    processed = processed.replace(/^\s*\d+\.\s+(.*)$/gm, '<li class="text-secondary lead">$1</li>');
    
    // Wrap list items in <ul> or <ol> tags
    // This is a simplified approach; a more robust solution would need to handle nested lists
    const ulRegex = /<li>.*?<\/li>/gs;
    if (ulRegex.test(processed)) {
        processed = processed.replace(/(<li class="text-secondary lead">.*?<\/li>)+/gs, match => `<ul>${match}</ul>`);
    }
    
    return processed;
}

/**
 * Processes links in markdown
 * @param {string} text - The markdown text
 * @returns {string} - Text with links converted to HTML
 */
function processLinks(text) {
    // Replace links [text](url) with <a> tags
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;
    return text.replace(linkRegex, '<a href="$2">$1</a>');
}

/**
 * Processes images in markdown
 * @param {string} text - The markdown text
 * @returns {string} - Text with images converted to HTML
 */
function processImages(text) {
    // Replace images ![alt](url) with <img> tags
    const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
    return text.replace(imageRegex, '<img src="$2" alt="$1">');
}

/**
 * Processes horizontal rules in markdown
 * @param {string} text - The markdown text
 * @returns {string} - Text with horizontal rules converted to HTML
 */
function processHorizontalRules(text) {
    // Replace horizontal rules (---, ***, ___) with <hr> tags
    return text.replace(/^(---|\*\*\*|___)$/gm, '<hr>');
}

/**
 * Processes paragraphs in markdown
 * @param {string} text - The markdown text
 * @returns {string} - Text with paragraphs converted to HTML
 */
function processParagraphs(text) {
    // Split by double newlines to identify paragraphs
    const paragraphs = text.split(/\n\s*\n/);
    
    // Wrap each paragraph with <p> tags if it doesn't already have block-level HTML
    return paragraphs
        .map(p => {
            p = p.trim();
            if (p && !p.startsWith('<h') && !p.startsWith('<ul') && 
                !p.startsWith('<ol') && !p.startsWith('<pre') && 
                !p.startsWith('<hr')) {
                return `<p class="text-secondary lead">${p}</p>`;
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