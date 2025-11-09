import type { ExportOptions } from './types';

export class ExportUtils {
  private canvas: HTMLCanvasElement;
  private renderer: any;
  private effectsManager: any;

  constructor(canvas: HTMLCanvasElement, renderer: any, effectsManager: any) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.effectsManager = effectsManager;
  }

  async exportAsGIF(options: ExportOptions): Promise<void> {
    const { fps = 24, duration = 2, quality = 10 } = options;
    
    if (typeof (window as any).GIF === 'undefined') {
      this.effectsManager.showNotification('Biblioteca GIF.js não carregada!', 'error');
      console.error('GIF.js library not loaded. Include: https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js');
      return;
    }
    
    this.setExportingState(true, 'Preparando exportação GIF...');
    
    // Detectar mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Otimizações para mobile
    const maxWidth = isMobile ? 512 : this.canvas.width;
    const maxHeight = isMobile ? 512 : this.canvas.height;
    const workers = isMobile ? 1 : 2; // 1 worker em mobile para evitar travamento
    const exportQuality = isMobile ? 20 : quality; // Qualidade reduzida em mobile
    
    // Redimensionar canvas se necessário
    let scale = 1;
    if (this.canvas.width > maxWidth || this.canvas.height > maxHeight) {
      scale = Math.min(maxWidth / this.canvas.width, maxHeight / this.canvas.height);
    }
    
    const exportWidth = Math.round(this.canvas.width * scale);
    const exportHeight = Math.round(this.canvas.height * scale);
    
    console.log(`[ExportGIF] Mobile: ${isMobile}, Resolution: ${exportWidth}x${exportHeight}, Workers: ${workers}`);
    
    const gif = new (window as any).GIF({
      workers: workers,
      quality: exportQuality,
      width: exportWidth,
      height: exportHeight,
      workerScript: '/js/libs/gif.worker.js',
      transparent: 0x000000,
      background: 0x000000
    });
    
    const activeEffects = this.effectsManager.getActiveEffects();
    
    if (activeEffects.length === 0) {
      this.effectsManager.showNotification('Adicione pelo menos um efeito!', 'warning');
      this.setExportingState(false);
      return;
    }
    
    // Calcular a duração de um ciclo completo de respiração baseado no efeito mais lento
    const minSpeed = Math.min(...activeEffects.map((e: any) => e.speed || 1.5));
    const breathingPeriod = (2 * Math.PI) / minSpeed;
    
    const exportDuration = breathingPeriod;
    const exportFps = isMobile ? Math.min(fps, 15) : fps; // Reduzir FPS em mobile (máx 15)
    const totalFrames = Math.round(exportFps * exportDuration);
    const frameDuration = Math.round(100 / exportFps); // delay em centissegundos (1/100 seg)
    
    console.log(`[ExportGIF] Exportando ${totalFrames} frames a ${exportFps} FPS`);
    console.log(`[ExportGIF] Duração: ${exportDuration.toFixed(2)}s, Delay: ${frameDuration} centissegundos`);
    
    // Canvas temporário para redimensionamento
    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = exportWidth;
    frameCanvas.height = exportHeight;
    const frameCtx = frameCanvas.getContext('2d', { 
      alpha: true,
      willReadFrequently: true // Otimização para múltiplas leituras
    });
    
    if (!frameCtx) {
      this.effectsManager.showNotification('Erro ao criar contexto de canvas', 'error');
      this.setExportingState(false);
      return;
    }
    
    // Renderizar frames com delay entre cada um em mobile
    const renderFrame = async (i: number) => {
      const frameTime = (i / exportFps);
      
      this.renderer.render(frameTime, true);
      
      frameCtx.clearRect(0, 0, exportWidth, exportHeight);
      frameCtx.drawImage(this.canvas, 0, 0, exportWidth, exportHeight);
      gif.addFrame(frameCanvas, { delay: frameDuration, transparent: true });
      
      if (i % 3 === 0) {
        const captureProgress = Math.round((i / totalFrames) * 50);
        this.updateExportProgress(captureProgress, `Capturando: ${i}/${totalFrames}`);
      }
    };
    
    // Processar frames com delay em mobile para não travar
    if (isMobile) {
      for (let i = 0; i < totalFrames; i++) {
        await renderFrame(i);
        // Pequeno delay a cada 5 frames para dar respiro ao navegador
        if (i % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
    } else {
      // Desktop: processar tudo de uma vez
      for (let i = 0; i < totalFrames; i++) {
        await renderFrame(i);
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
      this.updateExportProgress(percentage, `Renderizando: ${percentage}%`);
    });
    
    gif.render();
  }

  async exportAsWebM(options: ExportOptions): Promise<void> {
    const { fps = 30, duration = 2 } = options;
    
    if (!this.canvas.captureStream) {
      this.effectsManager.showNotification('Gravação de vídeo não suportada neste navegador.', 'error');
      return;
    }
    
    this.setExportingState(true, 'Gravando vídeo...');
    
    // Detectar mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Otimizações para mobile
    const exportFps = isMobile ? Math.min(fps, 24) : fps; // Máx 24 FPS em mobile
    const bitrate = isMobile ? 1500000 : 2500000; // Bitrate reduzido em mobile
    
    const stream = this.canvas.captureStream(exportFps);
    
    // Tentar diferentes codecs
    let mimeType = 'video/webm;codecs=vp9';
    if (isMobile && !MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8'; // Fallback para VP8 em mobile
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm'; // Fallback genérico
      }
    }
    
    console.log(`[ExportWebM] Mobile: ${isMobile}, FPS: ${exportFps}, Bitrate: ${bitrate}, Codec: ${mimeType}`);
    
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: mimeType,
      videoBitsPerSecond: bitrate
    });
    
    const chunks: Blob[] = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      this.downloadFile(url, 'token-animation.webm');
      this.effectsManager.showNotification('WebM exportado com sucesso!', 'success');
      this.setExportingState(false);
    };
    
    mediaRecorder.start();
    
    // Simular progresso baseado no tempo
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / (duration * 1000)) * 100, 99);
      this.updateExportProgress(Math.round(progress), `Gravando: ${Math.round(progress)}%`);
      
      if (elapsed >= duration * 1000) {
        clearInterval(interval);
      }
    }, 100);
    
    setTimeout(() => {
      mediaRecorder.stop();
      clearInterval(interval);
    }, duration * 1000);
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
