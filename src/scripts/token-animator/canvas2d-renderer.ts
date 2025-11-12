import type { BreathingEffect } from './types';

// Canvas 2D Renderer - Breathing effect sem WebGL
export class Canvas2DRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private userImage: HTMLImageElement | null = null;
  private animationRunning: boolean = false;
  private animationFrame: number | null = null;
  private startTime: number = 0;
  private pausedTime: number = 0;
  private isPaused: boolean = false;
  
  // Cache para otimização
  private imageData: ImageData | null = null;
  private tempCanvas: HTMLCanvasElement | null = null;
  private tempCtx: CanvasRenderingContext2D | null = null;

  constructor(canvasElement: HTMLCanvasElement) {
    this.canvas = canvasElement;
    const ctx = this.canvas.getContext('2d', { 
      willReadFrequently: true,
      alpha: true
    });
    if (!ctx) throw new Error('Não foi possível obter contexto 2D do canvas');
    this.ctx = ctx;
    
    this.setupCanvasEvents();
  }

  private setupCanvasEvents(): void {
    this.canvas.addEventListener('click', (e: MouseEvent) => {
      if ((window as any).effectsManager && (window as any).effectsManager.settingPointForEffectId !== null) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const effect = (window as any).effectsManager.getActiveEffects().find(
          (ef: BreathingEffect) => ef.id === (window as any).effectsManager.settingPointForEffectId
        );

        if (effect) {
          if (!effect.marker) effect.marker = { x: 0.5, y: 0.5 };
          effect.marker.x = x;
          effect.marker.y = y;
          (window as any).effectsManager.settingPointForEffectId = null;
          (window as any).effectsManager.updateCursor();
          (window as any).effectsManager.renderEffectsUI();
          (window as any).effectsManager.showNotification('Ponto definido!', 'success');
        }
      }
    });
  }

  loadImage(imageSource: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        console.log('[Canvas2DRenderer] Imagem carregada:', img.width, 'x', img.height);
        
        // Parar animação anterior se existir
        this.stopAnimation();
        
        this.userImage = img;
        
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        console.log('[Canvas2DRenderer] Canvas dimensionado:', this.canvas.width, 'x', this.canvas.height);
        
        this.fitCanvasToContainer(img);

        this.tempCanvas = document.createElement('canvas');
        this.tempCanvas.width = img.width;
        this.tempCanvas.height = img.height;
        const tempCtx = this.tempCanvas.getContext('2d', { 
          willReadFrequently: true,
          alpha: true
        });
        if (!tempCtx) {
          reject(new Error('Não foi possível criar contexto temporário'));
          return;
        }
        this.tempCtx = tempCtx;

        this.tempCtx.drawImage(img, 0, 0);
        this.imageData = this.tempCtx.getImageData(0, 0, img.width, img.height);

        this.ctx.drawImage(img, 0, 0);
        this.startAnimation();
        resolve();
      };

      img.onerror = () => {
        reject(new Error('Erro ao carregar imagem'));
      };

      img.src = imageSource;
    });
  }

  private fitCanvasToContainer(img: HTMLImageElement): void {
    const container = this.canvas.parentElement?.parentElement;
    if (!container) return;

    const containerWidth = container.clientWidth - 40;
    const containerHeight = (window.innerHeight * 0.7) - 40;

    const scaleX = containerWidth / img.width;
    const scaleY = containerHeight / img.height;
    const scale = Math.min(scaleX, scaleY, 1);

    this.canvas.style.width = `${Math.floor(img.width * scale)}px`;
    this.canvas.style.height = `${Math.floor(img.height * scale)}px`;
    this.canvas.style.maxWidth = '100%';
    this.canvas.style.maxHeight = '70vh';
    this.canvas.style.objectFit = 'contain';
  }

  startAnimation(): void {
    if (!this.animationRunning) {
      this.animationRunning = true;
      this.startTime = performance.now() - this.pausedTime;
      this.animate();
    }
  }

  pauseAnimation(): void {
    this.isPaused = true;
    this.pausedTime = performance.now() - this.startTime;
  }

  resumeAnimation(): void {
    this.isPaused = false;
    this.startTime = performance.now() - this.pausedTime;
  }

  stopAnimation(): void {
    this.animationRunning = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  private animate = (): void => {
    if (!this.animationRunning || !this.userImage) {
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
      }
      return;
    }

    const now = performance.now();
    let time = (now - this.startTime) / 1000;

    if (this.isPaused) {
      time = this.pausedTime / 1000;
    }

    this.render(time);

    if (this.animationRunning) {
      this.animationFrame = requestAnimationFrame(this.animate);
    }
  };

  render(time: number, forceRenderEffects: boolean = false): void {
    if (!this.userImage || !this.imageData) return;

    const width = this.canvas.width;
    const height = this.canvas.height;

    const effectsManager = (window as any).effectsManager;
    const effects: BreathingEffect[] = effectsManager?.getActiveEffects() || [];
    
    const visibleEffects = forceRenderEffects 
      ? effects 
      : effects.filter(e => e.showPreview !== false);
    
    const effectTime = (forceRenderEffects || effectsManager?.animationEnabled) ? time : 0;

    this.ctx.clearRect(0, 0, width, height);

    if (visibleEffects.length === 0) {
      this.ctx.drawImage(this.userImage, 0, 0);
      return;
    }

    const outputData = this.ctx.createImageData(width, height);
    const srcData = this.imageData.data;
    const dstData = outputData.data;

    this.applyMultipleBreathingEffects(srcData, dstData, width, height, visibleEffects, effectTime);
    this.ctx.putImageData(outputData, 0, 0);
  }

  private applyMultipleBreathingEffects(
    srcData: Uint8ClampedArray,
    dstData: Uint8ClampedArray,
    width: number,
    height: number,
    effects: BreathingEffect[],
    time: number
  ): void {
    const invWidth = 1.0 / width;
    const invHeight = 1.0 / height;
    const aspectRatio = width / height;
    const aspectCorrectionX = width > height ? aspectRatio : 1.0;
    const aspectCorrectionY = width > height ? 1.0 : 1.0 / aspectRatio;
    
    // Pre-calcular ciclos de respiração para cada efeito
    const breathCycles = effects.map(effect => {
      const speed = effect.speed || 1.5;
      const phase = effect.phase || 0.0;
      return (-Math.cos(time * speed + phase) * 0.5 + 0.5);
    });
    
    // Pre-calcular parâmetros dos efeitos (evitar lookups repetidos)
    const effectParams = effects.map(effect => ({
      marker: effect.marker || { x: 0.5, y: 0.5 },
      strength: (effect.strength || 0.03) * width, // Pre-multiplicar
      strengthY: (effect.strength || 0.03) * height,
      radius: effect.radius || 0.4,
      radiusSq: (effect.radius || 0.4) ** 2, // Pre-calcular quadrado
      softness: Math.max(0.001, effect.softness || 0.4),
      breathCycle: breathCycles[effects.indexOf(effect)]
    }));
    
    for (let y = 0; y < height; y++) {
      const ny = y * invHeight;
      const rowOffset = y * width;
      
      for (let x = 0; x < width; x++) {
        const nx = x * invWidth;
        const dstIdx = (rowOffset + x) * 4;
        
        let totalDisplacementX = 0;
        let totalDisplacementY = 0;
        let hasDisplacement = false;
        
        // Loop otimizado: early exit se fora do raio
        for (let i = 0; i < effectParams.length; i++) {
          const params = effectParams[i];
          
          const dx = (nx - params.marker.x) * aspectCorrectionX;
          const dy = (ny - params.marker.y) * aspectCorrectionY;
          const distanceSq = dx * dx + dy * dy;
          
          // Early exit: fora do raio (usando distância ao quadrado - mais rápido)
          if (distanceSq >= params.radiusSq || distanceSq < 0.000001) continue;
          
          const distance = Math.sqrt(distanceSq);
          const t = (params.radius - distance) / params.radius;
          const bulgeFalloff = t * t * (3 - 2 * t);
          
          const radiusSoftness = params.radius * params.softness;
          const centerDist = distance / radiusSoftness;
          const centerT = Math.min(1, centerDist);
          const centerSoftness = centerT * centerT * (3 - 2 * centerT);
          
          const displacementAmount = centerSoftness * bulgeFalloff * params.breathCycle;
          
          const invDistance = 1.0 / distance;
          const dirX = dx * invDistance;
          const dirY = dy * invDistance;
          
          totalDisplacementX += dirX * displacementAmount * params.strength;
          totalDisplacementY += dirY * displacementAmount * params.strengthY;
          hasDisplacement = true;
        }
        
        // Cópia direta se não há deslocamento (mais rápido que verificar === 0)
        if (!hasDisplacement) {
          const srcIdx = (rowOffset + x) * 4;
          dstData[dstIdx] = srcData[srcIdx];
          dstData[dstIdx + 1] = srcData[srcIdx + 1];
          dstData[dstIdx + 2] = srcData[srcIdx + 2];
          dstData[dstIdx + 3] = srcData[srcIdx + 3];
          continue;
        }
        
        const srcXFloat = x - totalDisplacementX;
        const srcYFloat = y - totalDisplacementY;
        
        const x0 = Math.floor(srcXFloat);
        const y0 = Math.floor(srcYFloat);
        const x1 = x0 + 1;
        const y1 = y0 + 1;
        const fx = srcXFloat - x0;
        const fy = srcYFloat - y0;
        
        // Interpolação bilinear (apenas se dentro dos limites)
        if (x0 >= 0 && x1 < width && y0 >= 0 && y1 < height) {
          const idx00 = (y0 * width + x0) * 4;
          const idx10 = (y0 * width + x1) * 4;
          const idx01 = (y1 * width + x0) * 4;
          const idx11 = (y1 * width + x1) * 4;
          
          const fx1 = 1 - fx;
          const fy1 = 1 - fy;
          
          // Otimização: calcular uma vez e reusar
          for (let c = 0; c < 4; c++) {
            const top = srcData[idx00 + c] * fx1 + srcData[idx10 + c] * fx;
            const bottom = srcData[idx01 + c] * fx1 + srcData[idx11 + c] * fx;
            dstData[dstIdx + c] = top * fy1 + bottom * fy;
          }
        } else {
          // Fallback: copiar pixel original
          const srcIdx = (rowOffset + x) * 4;
          dstData[dstIdx] = srcData[srcIdx];
          dstData[dstIdx + 1] = srcData[srcIdx + 1];
          dstData[dstIdx + 2] = srcData[srcIdx + 2];
          dstData[dstIdx + 3] = srcData[srcIdx + 3];
        }
      }
    }
  }

  reset(): void {
    this.stopAnimation();
    this.userImage = null;
    this.imageData = null;
    this.tempCanvas = null;
    this.tempCtx = null;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.startTime = 0;
    this.pausedTime = 0;
    this.isPaused = false;
  }

  dispose(): void {
    this.stopAnimation();
    this.userImage = null;
    this.imageData = null;
    this.tempCanvas = null;
    this.tempCtx = null;
  }

  get hasImage(): boolean {
    return this.userImage !== null;
  }

  get image(): HTMLImageElement | null {
    return this.userImage;
  }
}
