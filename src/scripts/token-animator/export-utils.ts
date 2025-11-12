import type { ExportOptions } from './types';
import { Muxer, ArrayBufferTarget } from 'webm-muxer';

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
  exportWidth: number;
  exportHeight: number;
}

export class ExportUtils {
  private canvas: HTMLCanvasElement;
  private renderer: any;
  private effectsManager: any;

  constructor(canvas: HTMLCanvasElement, renderer: any, effectsManager: any) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.effectsManager = effectsManager;
  }

  /**
   * Calcula os parâmetros de renderização para exportação com loop perfeito
   */
  private calculateRenderParameters(fps: number, maxWidth: number, maxHeight: number): FrameRenderData | null {
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
    
    // Calcular dimensões de exportação mantendo aspect ratio
    let exportWidth = this.canvas.width;
    let exportHeight = this.canvas.height;
    
    if (exportWidth > maxWidth || exportHeight > maxHeight) {
      const scale = Math.min(maxWidth / exportWidth, maxHeight / exportHeight);
      exportWidth = Math.floor(exportWidth * scale);
      exportHeight = Math.floor(exportHeight * scale);
    }
    
    return {
      breathingPeriod,
      totalFrames,
      exportDuration,
      exportWidth,
      exportHeight
    };
  }

  /**
   * Renderiza um frame específico no tempo dado
   */
  private renderFrameAtTime(
    frameTime: number,
    exportWidth: number,
    exportHeight: number,
    targetCanvas?: HTMLCanvasElement
  ): HTMLCanvasElement {
    // Renderizar no canvas original
    this.renderer.render(frameTime, true);
    
    // Criar canvas temporário se necessário
    const frameCanvas = targetCanvas || document.createElement('canvas');
    frameCanvas.width = exportWidth;
    frameCanvas.height = exportHeight;
    const frameCtx = frameCanvas.getContext('2d', { alpha: true });
    
    if (frameCtx) {
      // Limpar e desenhar com redimensionamento
      frameCtx.clearRect(0, 0, exportWidth, exportHeight);
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
    
    const renderData = this.calculateRenderParameters(config.fps, config.maxWidth, config.maxHeight);
    if (!renderData) {
      this.setExportingState(false);
      return;
    }
    
    const { breathingPeriod, totalFrames, exportDuration, exportWidth, exportHeight } = renderData;
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
    
    // Renderizar frames sequencialmente
    for (let i = 0; i < totalFrames; i++) {
      // Calcular o tempo exato dentro do ciclo de respiração
      const frameTime = (i / totalFrames) * breathingPeriod;
      
      // Log de debug para alguns frames chave
      if (i === 0 || i === Math.floor(totalFrames / 2) || i === totalFrames - 1) {
        const breathValue = (-Math.cos(frameTime * (2 * Math.PI / breathingPeriod)) * 0.5 + 0.5);
        console.log(`[ExportGIF] Frame ${i}/${totalFrames}: t=${frameTime.toFixed(3)}s, breath=${breathValue.toFixed(3)}`);
      }
      
      // Renderizar e adicionar frame
      const frameCanvas = this.renderFrameAtTime(frameTime, exportWidth, exportHeight);
      gif.addFrame(frameCanvas, { delay: frameDuration, transparent: true });
      
      // Atualizar progresso
      if (i % 5 === 0) {
        const captureProgress = Math.round((i / totalFrames) * 50);
        this.updateExportProgress(captureProgress, `Capturando frames: ${i}/${totalFrames}`);
      }
    }
    
    gif.on('finished', (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      this.downloadFile(url, 'token-animation.gif');
      this.effectsManager.showNotification('GIF exportado com sucesso!', 'success');
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
    
    // Verificar suporte ao WebCodecs
    if (typeof VideoEncoder === 'undefined' || typeof VideoFrame === 'undefined') {
      this.effectsManager.showNotification('WebCodecs não suportado. Use um navegador moderno (Chrome/Edge 94+).', 'error');
      console.error('WebCodecs API not supported.');
      return;
    }
    
    this.setExportingState(true, 'Preparando exportação WebM...');
    
    const renderData = this.calculateRenderParameters(config.fps, config.maxWidth, config.maxHeight);
    if (!renderData) {
      this.setExportingState(false);
      return;
    }
    
    const { breathingPeriod, totalFrames, exportDuration, exportWidth, exportHeight } = renderData;
    const frameDuration = 1000 / config.fps;
    
    console.log(`[Export${config.formatName}] Período de respiração: ${breathingPeriod.toFixed(3)}s`);
    console.log(`[Export${config.formatName}] Frames: ${totalFrames} a ${config.fps} FPS`);
    console.log(`[Export${config.formatName}] Duração final: ${exportDuration.toFixed(3)}s (1 ciclo completo)`);
    console.log(`[Export${config.formatName}] Delay entre frames: ${frameDuration.toFixed(2)}ms`);
    console.log(`[Export${config.formatName}] Dimensões: ${exportWidth}x${exportHeight} (max ${config.maxWidth}p)`);
    console.log(`[Export${config.formatName}] Ciclo: t=0s (sem efeito) → t=${(breathingPeriod/2).toFixed(2)}s (máximo) → t=${breathingPeriod.toFixed(2)}s (sem efeito)`);
    
    try {
      // Criar muxer WebM
      const muxer = new Muxer({
        target: new ArrayBufferTarget(),
        video: {
          codec: 'V_VP9',
          width: exportWidth,
          height: exportHeight,
          frameRate: config.fps,
          alpha: true
        },
        firstTimestampBehavior: 'strict'
      });
      
      // Criar encoder de vídeo
      const videoEncoder = new VideoEncoder({
        output: (chunk, metadata) => {
          muxer.addVideoChunk(chunk, metadata);
        },
        error: (error) => {
          console.error('VideoEncoder error:', error);
          this.effectsManager.showNotification('Erro ao encodar vídeo.', 'error');
        }
      });
      
      videoEncoder.configure({
        codec: 'vp09.00.10.08',
        width: exportWidth,
        height: exportHeight,
        bitrate: 5_000_000,
        framerate: config.fps,
        alpha: 'keep',
        latencyMode: 'quality'
      });
      
      const frameDurationMicros = Math.round(1_000_000 / config.fps);
      
      // Renderizar e encodar frames sequencialmente (MESMO MÉTODO DO GIF)
      for (let i = 0; i < totalFrames; i++) {
        // Calcular o tempo exato dentro do ciclo de respiração (MESMA FÓRMULA DO GIF)
        const frameTime = (i / totalFrames) * breathingPeriod;
        
        // Log de debug para alguns frames chave
        if (i === 0 || i === Math.floor(totalFrames / 2) || i === totalFrames - 1) {
          const breathValue = (-Math.cos(frameTime * (2 * Math.PI / breathingPeriod)) * 0.5 + 0.5);
          console.log(`[ExportWebM] Frame ${i}/${totalFrames}: t=${frameTime.toFixed(3)}s, breath=${breathValue.toFixed(3)}`);
        }
        
        // Renderizar frame (MESMO MÉTODO DO GIF)
        const frameCanvas = this.renderFrameAtTime(frameTime, exportWidth, exportHeight);
        
        // Converter para ImageBitmap e encodar
        const bitmap = await createImageBitmap(frameCanvas);
        const videoFrame = new VideoFrame(bitmap, {
          timestamp: i * frameDurationMicros,
          duration: frameDurationMicros,
          alpha: 'keep'
        });
        
        // Keyframe apenas no primeiro frame
        const isKeyFrame = i === 0;
        videoEncoder.encode(videoFrame, { keyFrame: isKeyFrame });
        
        videoFrame.close();
        bitmap.close();
        
        // Atualizar progresso
        if (i % 5 === 0) {
          const progress = Math.round((i / totalFrames) * 100);
          this.updateExportProgress(progress, `Encodando: ${i + 1}/${totalFrames} frames`);
        }
      }
      
      // Finalizar encoding
      await videoEncoder.flush();
      videoEncoder.close();
      
      // Finalizar muxer e obter arquivo
      muxer.finalize();
      const buffer = (muxer.target as ArrayBufferTarget).buffer;
      
      console.log(`[ExportWebM] WebM criado: ${(buffer.byteLength / 1024).toFixed(2)} KB`);
      
      // Criar blob e download
      const blob = new Blob([buffer], { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      this.downloadFile(url, 'token-animation.webm');
      this.effectsManager.showNotification('WebM exportado com sucesso!', 'success');
      this.setExportingState(false);
      
    } catch (error) {
      console.error('WebM encoding failed:', error);
      this.effectsManager.showNotification('Erro ao compilar WebM. Tente novamente.', 'error');
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
}