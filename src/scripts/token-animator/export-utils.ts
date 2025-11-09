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
    
    // Limitar dimensões máximas para 512x512 mantendo aspect ratio
    const maxSize = 512;
    let exportWidth = this.canvas.width;
    let exportHeight = this.canvas.height;
    
    if (exportWidth > maxSize || exportHeight > maxSize) {
      const scale = Math.min(maxSize / exportWidth, maxSize / exportHeight);
      exportWidth = Math.floor(exportWidth * scale);
      exportHeight = Math.floor(exportHeight * scale);
    }
    
    const gif = new (window as any).GIF({
      workers: 2,
      quality: quality,
      width: exportWidth,
      height: exportHeight,
      workerScript: '/js/libs/gif.worker.js',
      transparent: 0x000000, // Habilitar transparência
      background: 0x000000  // Fundo transparente
    });
    
    const activeEffects = this.effectsManager.getActiveEffects();
    
    if (activeEffects.length === 0) {
      this.effectsManager.showNotification('Adicione pelo menos um efeito!', 'warning');
      this.setExportingState(false);
      return;
    }
    
    // Calcular a duração de um ciclo completo de respiração baseado no efeito mais lento
    const minSpeed = Math.min(...activeEffects.map((e: any) => e.speed || 1.5));
    const breathingPeriod = (2 * Math.PI) / minSpeed; // período completo em segundos
    
    // Usar a duração do ciclo completo para loop perfeito
    const exportDuration = breathingPeriod;
    const totalFrames = Math.round(fps * exportDuration);
    const frameDuration = 1000 / fps; // delay entre frames em ms
    
    console.log(`[ExportGIF] Exportando ${totalFrames} frames a ${fps} FPS`);
    console.log(`[ExportGIF] Duração: ${exportDuration.toFixed(2)}s (1 ciclo completo), Delay: ${frameDuration.toFixed(2)}ms`);
    console.log(`[ExportGIF] Dimensões: ${exportWidth}x${exportHeight} (max 512p)`);
    console.log(`[ExportGIF] Transparência habilitada`);
    
    // Renderizar frames sequencialmente ao longo do tempo para loop perfeito
    for (let i = 0; i < totalFrames; i++) {
      // Calcular o tempo exato dentro do ciclo de respiração (0 a breathingPeriod)
      const frameTime = (i / totalFrames) * breathingPeriod;
      
      // Renderizar o frame no tempo específico
      this.renderer.render(frameTime, true);
      
      // Copiar o frame para o GIF mantendo transparência e redimensionando
      const frameCanvas = document.createElement('canvas');
      frameCanvas.width = exportWidth;
      frameCanvas.height = exportHeight;
      const frameCtx = frameCanvas.getContext('2d', { alpha: true });
      
      if (frameCtx) {
        // Não desenhar fundo, manter transparência
        frameCtx.clearRect(0, 0, frameCanvas.width, frameCanvas.height);
        // Desenhar com redimensionamento
        frameCtx.drawImage(this.canvas, 0, 0, exportWidth, exportHeight);
        gif.addFrame(frameCanvas, { delay: frameDuration, transparent: true });
      }
      
      // Atualizar progresso durante a captura de frames
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
    const { fps = 30, duration = 2 } = options;
    
    if (!this.canvas.captureStream) {
      this.effectsManager.showNotification('Gravação de vídeo não suportada neste navegador.', 'error');
      return;
    }
    
    this.setExportingState(true, 'Preparando exportação WebM...');
    
    // Calcular a duração baseada no ciclo de respiração como no GIF
    const activeEffects = this.effectsManager.getActiveEffects();
    
    if (activeEffects.length === 0) {
      this.effectsManager.showNotification('Adicione pelo menos um efeito!', 'warning');
      this.setExportingState(false);
      return;
    }
    
    const minSpeed = Math.min(...activeEffects.map((e: any) => e.speed || 1.5));
    const breathingPeriod = (2 * Math.PI) / minSpeed;
    const exportDuration = breathingPeriod;
    
    // Limitar dimensões máximas para 2K (2560x1440) mantendo aspect ratio
    const maxWidth = 2560;
    const maxHeight = 1440;
    let exportWidth = this.canvas.width;
    let exportHeight = this.canvas.height;
    
    if (exportWidth > maxWidth || exportHeight > maxHeight) {
      const scale = Math.min(maxWidth / exportWidth, maxHeight / exportHeight);
      exportWidth = Math.floor(exportWidth * scale);
      exportHeight = Math.floor(exportHeight * scale);
    }
    
    console.log(`[ExportWebM] Duração: ${exportDuration.toFixed(2)}s (1 ciclo completo) a ${fps} FPS`);
    console.log(`[ExportWebM] Dimensões: ${exportWidth}x${exportHeight} (max 2K)`);
    
    // Criar canvas de exportação com tamanho ajustado
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = exportWidth;
    exportCanvas.height = exportHeight;
    const exportCtx = exportCanvas.getContext('2d', { alpha: true });
    
    if (!exportCtx) {
      this.effectsManager.showNotification('Erro ao criar contexto de exportação.', 'error');
      this.setExportingState(false);
      return;
    }
    
    const stream = exportCanvas.captureStream(fps);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 5000000
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
    
    // Renderizar frames manualmente para garantir loop perfeito
    const totalFrames = Math.round(fps * exportDuration);
    let currentFrame = 0;
    
    const renderFrame = () => {
      if (currentFrame >= totalFrames) {
        mediaRecorder.stop();
        return;
      }
      
      // Calcular o tempo exato dentro do ciclo de respiração (0 a breathingPeriod)
      const frameTime = (currentFrame / totalFrames) * breathingPeriod;
      
      // Renderizar no canvas original
      this.renderer.render(frameTime, true);
      
      // Copiar para canvas de exportação com redimensionamento
      exportCtx.clearRect(0, 0, exportWidth, exportHeight);
      exportCtx.drawImage(this.canvas, 0, 0, exportWidth, exportHeight);
      
      // Atualizar progresso
      const progress = Math.round((currentFrame / totalFrames) * 100);
      this.updateExportProgress(progress, `Gravando: ${currentFrame}/${totalFrames} frames`);
      
      currentFrame++;
      
      // Próximo frame no intervalo correto
      setTimeout(renderFrame, 1000 / fps);
    };
    
    // Iniciar renderização
    renderFrame();
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