function TitleAndSubtitle(title, subtitle, paragraph) {
  paragraph = paragraph || '';
  paragraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<span class="text-primary">$1</span>');
  return `
            <div class="mb-3">
            <h4 class="fw-semibold text-primary mb-0">${subtitle}</h4>
            <h1 class="display-5 fw-bold mt-0">${title}</h1>
            <p class="lead text-secondary -3">${paragraph}</p>
        </div>
        `;
}

module.exports = { TitleAndSubtitle };

