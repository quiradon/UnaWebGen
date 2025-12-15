import { Canvas2DRenderer } from './canvas2d-renderer';
import { EffectsManager } from './effects';
import { ExportUtils } from './export-utils';

declare global {
  interface Window {
    effectsManager: EffectsManager;
    canvas2dRenderer: Canvas2DRenderer;
    exportUtils: ExportUtils;
    addBreathingEffect: () => void;
    resetCanvas: () => void;
    exportGIF: () => void;
    exportWebM: () => void;
    exportWebMHigh: () => void;
    exportWebMMedium: () => void;
  }
}

class TokenAnimatorApp {
  private canvas!: HTMLCanvasElement;
  private renderer!: Canvas2DRenderer;
  private effectsManager!: EffectsManager;
  private exportUtils!: ExportUtils;
  private abortController = new AbortController();

  constructor() {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas element not found!');
      return;
    }

    this.canvas = canvas;
    
    const { signal } = this.abortController;
    this.renderer = new Canvas2DRenderer(canvas, { signal });
    this.effectsManager = new EffectsManager({ signal });
    this.exportUtils = new ExportUtils(canvas, this.renderer, this.effectsManager);

    window.canvas2dRenderer = this.renderer;
    window.effectsManager = this.effectsManager;
    window.exportUtils = this.exportUtils;

    this.setupEventListeners();
    this.setupGlobalFunctions();
    this.setupDragAndDrop();
    
    this.renderer.startAnimation();
  }

  destroy(): void {
    this.abortController.abort();

    try {
      this.renderer?.stopAnimation();
      this.renderer?.destroy?.();
    } catch {
      // ignore
    }

    try {
      this.effectsManager?.destroy?.();
    } catch {
      // ignore
    }

    try {
      delete window.effectsManager;
      delete window.canvas2dRenderer;
      delete window.exportUtils;
      delete window.addBreathingEffect;
      delete window.resetCanvas;
      delete window.exportGIF;
      delete window.exportWebM;
      delete window.exportWebMHigh;
      delete window.exportWebMMedium;
    } catch {
      // ignore
    }
  }

  private setupEventListeners(): void {
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetCanvas(), { signal: this.abortController.signal });
    }
    
    // Inicializar botões desabilitados
    this.updateButtonStates(false);
  }

  private updateButtonStates(enabled: boolean): void {
    const buttons = [
      'resetBtn',
      'animationToggle',
      'exportBtn'
    ];
    
    buttons.forEach(id => {
      const btn = document.getElementById(id) as HTMLButtonElement;
      if (btn) {
        btn.disabled = !enabled;
      }
    });
    
    // Botão de adicionar efeito
    const addBreathingBtn = document.querySelector('button[onclick*="addBreathingEffect"]') as HTMLButtonElement;
    if (addBreathingBtn) addBreathingBtn.disabled = !enabled;
  }

  private setupGlobalFunctions(): void {
    window.addBreathingEffect = () => {
      if (!this.renderer.hasImage) {
        this.effectsManager.showNotification('Carregue uma imagem primeiro!', 'warning');
        return;
      }
      this.effectsManager.addEffect('breathing');
    };

    window.resetCanvas = () => {
      this.resetCanvas();
    };

    window.exportGIF = () => {
      if (!this.renderer.hasImage) {
        this.effectsManager.showNotification('Carregue uma imagem primeiro!', 'warning');
        return;
      }
      // Mantido para compatibilidade (gera GIF)
      this.exportUtils.exportAsGIF({ quality: 10 });
    };

    window.exportWebM = () => {
      if (!this.renderer.hasImage) {
        this.effectsManager.showNotification('Carregue uma imagem primeiro!', 'warning');
        return;
      }
      
      // Não fazer verificação de premium aqui - já é feita no modal
      this.exportUtils.exportAsWebM({});
    };
    
    // Novas funções: exportar como WebM (perfis High/Medium)
    window.exportWebMHigh = () => {
      if (!this.renderer.hasImage) {
        this.effectsManager.showNotification('Carregue uma imagem primeiro!', 'warning');
        return;
      }
      // Alta qualidade: maior resolução e qualidade
      this.exportUtils.exportAsWebM({ fps: 24, maxWidth: 1080, maxHeight: 1080, quality: 10, ext: 'webm', filename: 'token-animation-high.webm' });
    };

    window.exportWebMMedium = () => {
      if (!this.renderer.hasImage) {
        this.effectsManager.showNotification('Carregue uma imagem primeiro!', 'warning');
        return;
      }
      // Qualidade média (nerf): resolução reduzida e qualidade menor
      this.exportUtils.exportAsWebM({ fps: 24, maxWidth: 512, maxHeight: 512, quality: 5, ext: 'webm', filename: 'token-animation-medium.webm' });
    };
    
    // Modal de exportação é configurado no Astro
  }

  // Métodos de premium removidos - verificação feita no modal

  private setupDragAndDrop(): void {
    const dropZone = document.getElementById('canvasPlaceholder');
    const fileInput = document.getElementById('file-input') as HTMLInputElement;

    if (!dropZone || !fileInput) return;

    const { signal } = this.abortController;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, this.preventDefaults, { signal });
      document.body.addEventListener(eventName, this.preventDefaults, { signal });
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => {
        document.getElementById('canvasContainer')?.classList.add('drag-over');
      }, { signal });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => {
        document.getElementById('canvasContainer')?.classList.remove('drag-over');
      }, { signal });
    });

    dropZone.addEventListener('drop', (e) => {
      const dt = (e as DragEvent).dataTransfer;
      if (dt?.files) {
        const files = dt.files;
        this.handleFiles(files);
      }
    }, { signal });

    dropZone.addEventListener('click', () => {
      fileInput.click();
    }, { signal });

    fileInput.addEventListener('change', () => {
      if (fileInput.files) {
        this.handleFiles(fileInput.files);
      }
    }, { signal });
  }

  private preventDefaults = (e: Event): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  private handleFiles(files: FileList): void {
    if (files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      this.effectsManager.showNotification('Por favor, selecione uma imagem válida.', 'warning');
      return;
    }

    // Validar formato (apenas PNG e WebP)
    if (file.type !== 'image/png' && file.type !== 'image/webp') {
      this.effectsManager.showNotification('Apenas imagens PNG e WebP são suportadas.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        this.resizeAndLoadImage(result);
      }
    };
    reader.readAsDataURL(file);
  }

  private resizeAndLoadImage(src: string): void {
    const img = new Image();
    img.onload = () => {
      const maxSize = 1920;
      let width = img.width;
      let height = img.height;

      // Verificar se precisa redimensionar
      if (width > maxSize || height > maxSize) {
        const scale = Math.min(maxSize / width, maxSize / height);
        width = Math.floor(width * scale);
        height = Math.floor(height * scale);

        console.log(`[ImageResize] Original: ${img.width}x${img.height} → Redimensionado: ${width}x${height}`);
        
        // Criar canvas temporário para redimensionar
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d', { alpha: true });

        if (tempCtx) {
          // Redimensionar com qualidade
          tempCtx.imageSmoothingEnabled = true;
          tempCtx.imageSmoothingQuality = 'high';
          tempCtx.drawImage(img, 0, 0, width, height);

          // Converter de volta para data URL
          const resizedSrc = tempCanvas.toDataURL('image/png');
          this.loadImage(resizedSrc);
        } else {
          // Fallback: carregar imagem original
          this.loadImage(src);
        }
      } else {
        console.log(`[ImageResize] Imagem dentro do limite: ${width}x${height}`);
        // Imagem já está dentro do limite
        this.loadImage(src);
      }
    };

    img.onerror = () => {
      this.effectsManager.showNotification('Erro ao processar imagem.', 'error');
    };

    img.src = src;
  }

  private async loadImage(src: string): Promise<void> {
    try {
      await this.renderer.loadImage(src);
      this.effectsManager.showNotification('Imagem carregada!', 'success');
      
      this.showCanvas();
      this.updateButtonStates(true);
    } catch (error) {
      this.effectsManager.showNotification('Erro ao carregar imagem.', 'error');
      console.error('Error loading image:', error);
    }
  }

  private showCanvas(): void {
    const canvas = document.getElementById('canvas');
    const overlay = document.getElementById('overlay');
    const placeholder = document.getElementById('canvasPlaceholder');
    
    canvas?.classList.remove('d-none');
    overlay?.classList.remove('d-none');
    placeholder?.classList.add('d-none');
  }

  private hideCanvas(): void {
    const canvas = document.getElementById('canvas');
    const overlay = document.getElementById('overlay');
    const placeholder = document.getElementById('canvasPlaceholder');
    
    canvas?.classList.add('d-none');
    overlay?.classList.add('d-none');
    placeholder?.classList.remove('d-none');
  }

  private resetCanvas(): void {
    this.renderer.reset();
    this.effectsManager.reset();
    
    this.hideCanvas();
    this.updateButtonStates(false);
    
    this.effectsManager.showNotification('Canvas resetado!', 'info');
  }
}

let currentApp: TokenAnimatorApp | null = null;

function mountTokenAnimator(): void {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;

  currentApp?.destroy();
  currentApp = new TokenAnimatorApp();
}

function unmountTokenAnimator(): void {
  currentApp?.destroy();
  currentApp = null;
}

if (typeof window !== 'undefined') {
  document.addEventListener('astro:page-load', mountTokenAnimator);
  document.addEventListener('astro:before-swap', unmountTokenAnimator);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountTokenAnimator, { once: true });
  } else {
    mountTokenAnimator();
  }
}

export { TokenAnimatorApp };
