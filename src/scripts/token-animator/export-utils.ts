import type { ExportOptions } from './types';
import { Output, WebMOutputFormat, BufferTarget, CanvasSource, QUALITY_HIGH } from 'mediabunny';

interface ExportConfig {
  fps: number;
  maxWidth: number;
  maxHeight: number;
  formatName: string;
}

interface FrameRenderData {
  breathingPeriod: number;
  totalFrames: number;
  exportDuration: number;
}

export class ExportUtils {
  private canvas: HTMLCanvasElement;
  private renderer: any;
  private effectsManager: any;
  private tempExportCanvas: HTMLCanvasElement | null = null;
  private tempExportCtx: CanvasRenderingContext2D | null = null;

  constructor(canvas: HTMLCanvasElement, renderer: any, effectsManager: any) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.effectsManager = effectsManager;
  }

  /**
   * Calcula os parâmetros de renderização para exportação com loop perfeito
   */
  private calculateRenderParameters(fps: number): { breathingPeriod: number; totalFrames: number; exportDuration: number } | null {
    const activeEffects = this.effectsManager.getActiveEffects();
    
    if (activeEffects.length === 0) {
      this.effectsManager.showNotification('Adicione pelo menos um efeito!', 'warning');
      return null;
    }
    
    // Para loop perfeito: um ciclo completo de cos é 2π
    // A função é: -cos(time * speed) * 0.5 + 0.5
    // Para completar um ciclo: time * speed = 2π → time = 2π / speed
    const minSpeed = Math.min(...activeEffects.map((e: any) => e.speed || 1.5));
    const breathingPeriod = (2 * Math.PI) / minSpeed;
    
    // Garantir que temos frames suficientes para cobrir o ciclo completo
    const totalFrames = Math.max(Math.round(fps * breathingPeriod), fps); // Mínimo de 1 segundo
    const exportDuration = totalFrames / fps; // Duração real ajustada aos frames
    
    return {
      breathingPeriod,
      totalFrames,
      exportDuration
    };
  }

  /**
   * Calcula dimensões de exportação mantendo aspect ratio
   */
  private calculateExportDimensions(maxWidth: number, maxHeight: number): { width: number; height: number } {
    let width = this.canvas.width;
    let height = this.canvas.height;
    
    if (width > maxWidth || height > maxHeight) {
      const scale = Math.min(maxWidth / width, maxHeight / height);
      width = Math.floor(width * scale);
      height = Math.floor(height * scale);
    }
    
    return { width, height };
  }

  /**
   * Renderiza um frame específico no tempo dado e redimensiona
   */
  private renderFrameAtTime(
    frameTime: number,
    exportWidth: number,
    exportHeight: number,
    targetCanvas?: HTMLCanvasElement
  ): HTMLCanvasElement {
    // SEMPRE renderizar no canvas original para garantir consistência
    this.renderer.render(frameTime, true);
    
    // Reusar canvas temporário para GIF (evita criar/destruir objetos)
    let frameCanvas: HTMLCanvasElement;
    let frameCtx: CanvasRenderingContext2D | null;
    
    if (targetCanvas) {
      // WebM: usar canvas fornecido
      frameCanvas = targetCanvas;
      frameCtx = frameCanvas.getContext('2d', { alpha: true, willReadFrequently: false });
    } else {
      // GIF: reusar canvas em cache
      if (!this.tempExportCanvas || this.tempExportCanvas.width !== exportWidth || this.tempExportCanvas.height !== exportHeight) {
        this.tempExportCanvas = document.createElement('canvas');
        this.tempExportCanvas.width = exportWidth;
        this.tempExportCanvas.height = exportHeight;
        this.tempExportCtx = this.tempExportCanvas.getContext('2d', { alpha: true, willReadFrequently: false });
      }
      frameCanvas = this.tempExportCanvas;
      frameCtx = this.tempExportCtx;
    }
    
    if (frameCtx) {
      // Não precisa de clearRect - drawImage sobrescreve tudo
      // Smoothing HIGH apenas se redimensionando significativamente
      const needsSmoothing = (exportWidth < this.canvas.width * 0.8) || (exportHeight < this.canvas.height * 0.8);
      frameCtx.imageSmoothingEnabled = needsSmoothing;
      if (needsSmoothing) {
        frameCtx.imageSmoothingQuality = 'high';
      }
      frameCtx.drawImage(this.canvas, 0, 0, exportWidth, exportHeight);
    }
    
    return frameCanvas;
  }

  async exportAsGIF(options: ExportOptions): Promise<void> {
    const { quality = 10 } = options;
    const config: ExportConfig = {
      fps: 24,
      maxWidth: 512,
      maxHeight: 512,
      formatName: 'GIF'
    };
    
    if (typeof (window as any).GIF === 'undefined') {
      this.effectsManager.showNotification('Biblioteca GIF.js não carregada!', 'error');
      console.error('GIF.js library not loaded. Include: https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js');
      return;
    }
    
    this.setExportingState(true, 'Preparando exportação GIF...');
    
    // Pausar animação principal e resetar para tempo 0
    const wasAnimating = this.effectsManager.animationEnabled;
    this.effectsManager.animationEnabled = false;
    this.renderer.render(0, true); // Forçar render no tempo 0
    
    // Calcular dimensões de exportação (512p máximo)
    const { width: exportWidth, height: exportHeight } = this.calculateExportDimensions(config.maxWidth, config.maxHeight);
    
    const renderData = this.calculateRenderParameters(config.fps);
    if (!renderData) {
      this.effectsManager.animationEnabled = wasAnimating;
      this.setExportingState(false);
      return;
    }
    
    const { breathingPeriod, totalFrames, exportDuration } = renderData;
    const frameDuration = 1000 / config.fps;
    
    console.log(`[Export${config.formatName}] Período de respiração: ${breathingPeriod.toFixed(3)}s`);
    console.log(`[Export${config.formatName}] Frames: ${totalFrames} a ${config.fps} FPS`);
    console.log(`[Export${config.formatName}] Duração final: ${exportDuration.toFixed(3)}s (1 ciclo completo)`);
    console.log(`[Export${config.formatName}] Delay entre frames: ${frameDuration.toFixed(2)}ms`);
    console.log(`[Export${config.formatName}] Dimensões: ${exportWidth}x${exportHeight} (max ${config.maxWidth}p)`);
    console.log(`[Export${config.formatName}] Ciclo: t=0s (sem efeito) → t=${(breathingPeriod/2).toFixed(2)}s (máximo) → t=${breathingPeriod.toFixed(2)}s (sem efeito)`);
    
    const gif = new (window as any).GIF({
      workers: 2,
      quality: quality,
      width: exportWidth,
      height: exportHeight,
      workerScript: '/js/libs/gif.worker.js',
      transparent: 0x000000,
      background: 0x000000
    });
    
    // Renderizar frames sequencialmente de forma assíncrona (não trava a UI)
    for (let i = 0; i < totalFrames; i++) {
      // Calcular o tempo exato dentro do ciclo de respiração
      const frameTime = (i / totalFrames) * breathingPeriod;
      
      // Log de debug para alguns frames chave
      if (i === 0 || i === Math.floor(totalFrames / 2) || i === totalFrames - 1) {
        const breathValue = (-Math.cos(frameTime * (2 * Math.PI / breathingPeriod)) * 0.5 + 0.5);
        console.log(`[ExportGIF] Frame ${i}/${totalFrames}: t=${frameTime.toFixed(3)}s, breath=${breathValue.toFixed(3)}`);
      }
      
      // Renderizar frame usando canvas original e redimensionar na cópia
      const frameCanvas = this.renderFrameAtTime(frameTime, exportWidth, exportHeight);
      gif.addFrame(frameCanvas, { delay: frameDuration, transparent: true });
      
      // Atualizar progresso e liberar a UI periodicamente
      if (i % 5 === 0 || i === totalFrames - 1) {
        const captureProgress = Math.round((i / totalFrames) * 50);
        this.updateExportProgress(captureProgress, `Capturando: ${i + 1}/${totalFrames}`);
        // Permite que a UI atualize a cada 5 frames - balanceamento entre UX e performance
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    gif.on('finished', (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      this.downloadFile(url, 'token-animation.gif');
      this.effectsManager.showNotification('GIF exportado com sucesso!', 'success');
      
      // Restaurar estado da animação
      this.effectsManager.animationEnabled = wasAnimating;
      this.setExportingState(false);
    });
    
    gif.on('progress', (progress: number) => {
      const percentage = 50 + Math.round(progress * 50);
      this.updateExportProgress(percentage, `Renderizando GIF: ${percentage}%`);
    });
    
    gif.render();
  }

  async exportAsWebM(options: ExportOptions): Promise<void> {
    const config: ExportConfig = {
      fps: 24,
      maxWidth: 1080,
      maxHeight: 1080,
      formatName: 'WebM'
    };
    
    this.setExportingState(true, 'Preparando exportação WebM...');
    
    // Pausar animação principal e resetar para tempo 0 (MESMA LÓGICA DO GIF)
    const wasAnimating = this.effectsManager.animationEnabled;
    this.effectsManager.animationEnabled = false;
    this.renderer.render(0, true); // Forçar render no tempo 0
    
    // Calcular dimensões de exportação (1080p máximo)
    const { width: exportWidth, height: exportHeight } = this.calculateExportDimensions(config.maxWidth, config.maxHeight);
    
    const renderData = this.calculateRenderParameters(config.fps);
    if (!renderData) {
      this.effectsManager.animationEnabled = wasAnimating;
      this.setExportingState(false);
      return;
    }
    
    const { breathingPeriod, totalFrames, exportDuration } = renderData;
    const frameDuration = 1000 / config.fps;
    
    console.log(`[Export${config.formatName}] Período de respiração: ${breathingPeriod.toFixed(3)}s`);
    console.log(`[Export${config.formatName}] Frames: ${totalFrames} a ${config.fps} FPS`);
    console.log(`[Export${config.formatName}] Duração final: ${exportDuration.toFixed(3)}s (1 ciclo completo)`);
    console.log(`[Export${config.formatName}] Delay entre frames: ${frameDuration.toFixed(2)}ms`);
    console.log(`[Export${config.formatName}] Dimensões: ${exportWidth}x${exportHeight} (max ${config.maxWidth}p)`);
    console.log(`[Export${config.formatName}] Ciclo: t=0s (sem efeito) → t=${(breathingPeriod/2).toFixed(2)}s (máximo) → t=${breathingPeriod.toFixed(2)}s (sem efeito)`);
    
    try {
      // Criar canvas de exportação redimensionado
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = exportWidth;
      exportCanvas.height = exportHeight;
      
      // Criar output WebM com mediabunny
      const output = new Output({
        format: new WebMOutputFormat(),
        target: new BufferTarget(),
      });
      
      // Criar fonte de vídeo do canvas
      const videoSource = new CanvasSource(exportCanvas, {
        codec: 'vp9',
        bitrate: QUALITY_HIGH,
        alpha: 'keep',
        bitrateMode: 'constant',
        latencyMode: 'quality'
      });
      
      output.addVideoTrack(videoSource, { 
        frameRate: config.fps 
      });
      
      await output.start();
      
      // Renderizar e adicionar frames sequencialmente de forma assíncrona (MESMA LÓGICA DO GIF)
      for (let i = 0; i < totalFrames; i++) {
        // Calcular o tempo exato dentro do ciclo de respiração (MESMA FÓRMULA DO GIF)
        const frameTime = (i / totalFrames) * breathingPeriod;
        
        // Log de debug para alguns frames chave
        if (i === 0 || i === Math.floor(totalFrames / 2) || i === totalFrames - 1) {
          const breathValue = (-Math.cos(frameTime * (2 * Math.PI / breathingPeriod)) * 0.5 + 0.5);
          console.log(`[ExportWebM] Frame ${i}/${totalFrames}: t=${frameTime.toFixed(3)}s, breath=${breathValue.toFixed(3)}`);
        }
        
        // Renderizar frame no canvas original e copiar para canvas de exportação
        this.renderFrameAtTime(frameTime, exportWidth, exportHeight, exportCanvas);
        
        // Calcular timestamp e duração em segundos
        const timestamp = (i / config.fps);
        const duration = (1 / config.fps);
        
        // Adicionar frame ao vídeo (CanvasSource captura o estado atual do canvas)
        await videoSource.add(timestamp, duration);
        
        // Atualizar progresso e liberar a UI periodicamente
        if (i % 3 === 0 || i === totalFrames - 1) {
          const progress = Math.round((i / totalFrames) * 100);
          this.updateExportProgress(progress, `Encodando: ${i + 1}/${totalFrames}`);
          
          // Permite que a UI atualize a cada 3 frames - balanceamento entre UX e performance
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      
      // Fechar fonte de vídeo e finalizar output
      videoSource.close();
      await output.finalize();
      
      // Obter buffer do arquivo
      const buffer = output.target.buffer;
      
      if (!buffer) {
        throw new Error('Falha ao obter buffer do WebM');
      }
      
      console.log(`[ExportWebM] WebM criado: ${(buffer.byteLength / 1024).toFixed(2)} KB`);
      
      // Criar blob e download
      const blob = new Blob([buffer], { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      this.downloadFile(url, 'token-animation.webm');
      this.effectsManager.showNotification('WebM exportado com sucesso!', 'success');
      
      // Restaurar estado da animação
      this.effectsManager.animationEnabled = wasAnimating;
      this.setExportingState(false);
      
    } catch (error) {
      console.error('WebM encoding failed:', error);
      this.effectsManager.showNotification('Erro ao compilar WebM. Tente novamente.', 'error');
      
      // Restaurar estado da animação mesmo em caso de erro
      this.effectsManager.animationEnabled = wasAnimating;
      this.setExportingState(false);
    }
  }

  private setExportingState(isExporting: boolean, message?: string): void {
    const exportButtons = document.querySelectorAll('[onclick*="export"]');
    const loadingOverlay = document.getElementById('loading');
    const loadingText = document.getElementById('loadingText');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    exportButtons.forEach(btn => {
      (btn as HTMLButtonElement).disabled = isExporting;
      if (isExporting) {
        btn.classList.add('disabled');
      } else {
        btn.classList.remove('disabled');
      }
    });
    
    if (loadingOverlay && loadingText) {
      if (isExporting && message) {
        loadingText.textContent = message;
        loadingOverlay.classList.remove('d-none');
        
        // Reset progress bar
        if (progressBar) {
          progressBar.style.width = '0%';
        }
        if (progressText) {
          progressText.textContent = '0%';
        }
      } else {
        loadingOverlay.classList.add('d-none');
      }
    }
  }

  private updateExportProgress(percentage: number, message: string): void {
    const loadingText = document.getElementById('loadingText');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    if (loadingText) {
      loadingText.textContent = message;
    }
    
    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }
    
    if (progressText) {
      progressText.textContent = `${percentage}%`;
    }
  }

  private downloadFile(url: string, filename: string): void {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  }

  // Liberar recursos
  dispose(): void {
    this.tempExportCanvas = null;
    this.tempExportCtx = null;
  }
}