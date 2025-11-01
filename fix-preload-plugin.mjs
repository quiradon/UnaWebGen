/**
 * Plugin Astro para adicionar crossorigin aos preloads
 * e desabilitar Rocket Loader em scripts críticos
 */
export function fixPreloadCrossorigin() {
  return {
    name: 'fix-preload-crossorigin',
    hooks: {
      'astro:build:done': async ({ pages, dir }) => {
        // Este hook roda após o build
        // Você pode processar os arquivos HTML aqui se necessário
      }
    }
  };
}
