import type { BreathingEffect, EffectsManagerElements, NotificationType } from './types';

export class EffectsManager {
  private activeEffects: BreathingEffect[] = [];
  settingPointForEffectId: number | null = null;
  private MAX_EFFECTS: number = 5;
  private effectIdCounter: number = 1;
  animationEnabled: boolean = true;
  private elements: EffectsManagerElements;
  private signal?: AbortSignal;

  private handleWindowKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') {
      this.cancelCurrentAction();
    } else if (e.key === ' ' && !(e.target as HTMLElement).matches('input, textarea')) {
      e.preventDefault();
      this.toggleAnimation();
    }
  };

  private handleAnimationToggleClick = (): void => {
    this.toggleAnimation();
  };

  constructor(options?: { signal?: AbortSignal }) {
    this.signal = options?.signal;
    this.elements = {
      activeEffectsList: document.getElementById('active-effects-list'),
      noEffectsText: document.getElementById('no-effects-text'),
      canvas: document.getElementById('canvas') as HTMLCanvasElement | null,
      animationToggle: document.getElementById('animationToggle'),
      animationToggleText: document.getElementById('animationStatus'),
      effectCount: document.getElementById('effectCount')
    };
    
    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    const options = this.signal ? { signal: this.signal } : undefined;

    if (this.elements.animationToggle) {
      this.elements.animationToggle.addEventListener('click', this.handleAnimationToggleClick, options);
    }
    
    window.addEventListener('keydown', this.handleWindowKeydown, options);
  }

  destroy(): void {
    try {
      this.elements.animationToggle?.removeEventListener('click', this.handleAnimationToggleClick);
    } catch {
      // ignore
    }
    try {
      window.removeEventListener('keydown', this.handleWindowKeydown);
    } catch {
      // ignore
    }
  }

  private createEffect(type: string): BreathingEffect | null {
    if (type === 'breathing') {
      return {
        id: this.effectIdCounter++,
        type,
        strength: 0.08,
        radius: 0.4,
        softness: 0.4,
        speed: 1.5,
        phase: 0.0,
        marker: { x: 0.5, y: 0.5 },
        showPreview: true,
        expanded: true
      };
    }
    return null;
  }

  addEffect(type: string): void {
    if (this.activeEffects.length >= this.MAX_EFFECTS) {
      this.showNotification('Limite de efeitos atingido.', 'warning');
      return;
    }

    const newEffect = this.createEffect(type);
    if (newEffect) {
      this.activeEffects.push(newEffect);
      this.renderEffectsUI();
      this.showNotification('Efeito de Respiração adicionado!', 'success');
    }
  }

  removeEffect(id: number): void {
    const index = this.activeEffects.findIndex(e => e.id === id);
    if (index !== -1) {
      this.activeEffects.splice(index, 1);
      this.renderEffectsUI();
      this.showNotification('Efeito removido!', 'info');
    }
  }

  updateEffect(id: number, property: keyof BreathingEffect, value: string | number): void {
    const effect = this.activeEffects.find(e => e.id === id);
    if (!effect) return;
    
    (effect as any)[property] = parseFloat(value as string);
    this.updateEffectLabel(id, property as string, value);
  }

  private updateEffectLabel(effectId: number, property: string, value: string | number): void {
    const effect = this.activeEffects.find(e => e.id === effectId);
    if (!effect) return;
    
    let labelText = '';
    const numValue = parseFloat(value as string);
    
    switch (property) {
      case 'strength':
        labelText = `Intensidade: ${Math.round(numValue * 5000)/10}`;
        break;
      case 'radius':
        labelText = `Raio: ${Math.round(numValue * 100)}%`;
        break;
      case 'softness':
        labelText = `Suavidade: ${Math.round(numValue * 100)}%`;
        break;
      case 'speed':
        labelText = `Velocidade: ${numValue.toFixed(1)}`;
        break;
      default:
        return;
    }
    
    const label = document.querySelector(`label[data-effect-id="${effectId}"][data-property="${property}"]`);
    if (label) {
      label.textContent = labelText;
    }
  }

  startSettingPoint(id: number): void {
    this.settingPointForEffectId = id;
    this.updateCursor();
    this.renderEffectsUI();
  }

  private cancelCurrentAction(): void {
    if (this.settingPointForEffectId !== null) {
      this.settingPointForEffectId = null;
      this.updateCursor();
      this.renderEffectsUI();
    }
  }

  updateCursor(): void {
    const canvas = this.elements.canvas;
    if (!canvas) return;
    
    if (this.settingPointForEffectId !== null) {
      canvas.style.cursor = 'crosshair';
    } else {
      canvas.style.cursor = 'default';
    }
  }

  private toggleAnimation(): void {
    this.animationEnabled = !this.animationEnabled;
    
    const playIcon = this.elements.animationToggle?.querySelector('.play-icon');
    const pauseIcon = this.elements.animationToggle?.querySelector('.pause-icon');
    
    if (playIcon && pauseIcon) {
      if (this.animationEnabled) {
        playIcon.classList.add('d-none');
        pauseIcon.classList.remove('d-none');
      } else {
        playIcon.classList.remove('d-none');
        pauseIcon.classList.add('d-none');
      }
    }
    
    if (this.elements.animationToggleText) {
      this.elements.animationToggleText.textContent = this.animationEnabled ? 'Reproduzindo' : 'Pausado';
      this.elements.animationToggleText.className = this.animationEnabled ? 'status-playing' : 'status-paused';
    }
    
    const renderer = (window as any).canvas2dRenderer;
    if (renderer) {
      if (this.animationEnabled) {
        renderer.resumeAnimation();
      } else {
        renderer.pauseAnimation();
      }
    }
  }

  toggleEffectVisibility(effectId: number, checked: boolean): void {
    const effect = this.activeEffects.find(e => e.id === effectId);
    if (effect) effect.showPreview = checked;
  }

  renderEffectsUI(): void {
    if (!this.elements.activeEffectsList || !this.elements.noEffectsText) return;

    if (this.elements.effectCount) {
      const count = this.activeEffects.length;
      this.elements.effectCount.textContent = `${count} efeito${count !== 1 ? 's' : ''}`;
    }

    this.elements.noEffectsText.classList.toggle('hidden', this.activeEffects.length > 0);    let html = '';
    if (this.activeEffects.length > 0) {
      html += '<div class="accordion" id="effectsAccordion">';
    }
    
    this.activeEffects.forEach((effect) => {
      const collapseId = `collapse-${effect.id}`;
      const isExpanded = effect.expanded !== false;
      
      html += `
        <div class="accordion-item mb-2">
          <h2 class="accordion-header">
            <button class="accordion-button ${isExpanded ? '' : 'collapsed'}" type="button" 
                    data-bs-toggle="collapse" data-bs-target="#${collapseId}"
                    onclick="effectsManager.toggleEffectExpanded(${effect.id}, !${isExpanded})">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/></svg>
              <strong>Respiração #${effect.id}</strong>
            </button>
          </h2>
          <div id="${collapseId}" class="accordion-collapse collapse ${isExpanded ? 'show' : ''}">
            <div class="accordion-body">
              ${this.renderBreathingControls(effect)}
            </div>
          </div>
        </div>
      `;
    });
    
    if (this.activeEffects.length > 0) {
      html += '</div>';
    }
    
    this.elements.activeEffectsList.innerHTML = html;
  }

  private renderBreathingControls(effect: BreathingEffect): string {
    return `
      <div class="d-flex gap-2 mb-2">
        <button class="btn ${this.settingPointForEffectId === effect.id ? 'btn-primary' : 'btn-outline-secondary'} btn-sm flex-fill" 
                onclick="effectsManager.startSettingPoint(${effect.id})">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          ${this.settingPointForEffectId === effect.id ? 'Definindo...' : 'Definir Ponto'}
        </button>
        <button class="btn btn-outline-danger btn-sm" 
                onclick="effectsManager.removeEffect(${effect.id})">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      </div>
      <div class="mb-3">
        <label class="form-label small d-flex justify-content-between align-items-center" data-effect-id="${effect.id}" data-property="strength">
          <span>Intensidade</span>
          <span class="text-white fw-semibold">${Math.round((effect.strength || 0) * 5000)/10}</span>
        </label>
        <input type="range" class="form-range" 
               min="0.01" max="0.3" step="0.01" 
               value="${effect.strength || 0}" 
               oninput="effectsManager.updateEffect(${effect.id}, 'strength', this.value)">
      </div>
      <div class="mb-3">
        <label class="form-label small d-flex justify-content-between align-items-center" data-effect-id="${effect.id}" data-property="radius">
          <span>Raio</span>
          <span class="text-white fw-semibold">${Math.round((effect.radius || 0) * 100)}%</span>
        </label>
        <input type="range" class="form-range" 
               min="0.1" max="1.0" step="0.01" 
               value="${effect.radius || 0}" 
               oninput="effectsManager.updateEffect(${effect.id}, 'radius', this.value)">
      </div>
      <div class="mb-3">
        <label class="form-label small d-flex justify-content-between align-items-center" data-effect-id="${effect.id}" data-property="softness">
          <span>Suavidade</span>
          <span class="text-white fw-semibold">${Math.round((effect.softness || 0) * 100)}%</span>
        </label>
        <input type="range" class="form-range" 
               min="0.1" max="1.0" step="0.01" 
               value="${effect.softness || 0}" 
               oninput="effectsManager.updateEffect(${effect.id}, 'softness', this.value)">
      </div>
      <div class="mb-3">
        <label class="form-label small d-flex justify-content-between align-items-center" data-effect-id="${effect.id}" data-property="speed">
          <span>Velocidade</span>
          <span class="text-white fw-semibold">${(effect.speed || 0).toFixed(1)}</span>
        </label>
        <input type="range" class="form-range" 
               min="0.5" max="5.0" step="0.1" 
               value="${effect.speed || 0}" 
               oninput="effectsManager.updateEffect(${effect.id}, 'speed', this.value)">
      </div>
    `;
  }

  toggleEffectExpanded(effectId: number, isExpanded: boolean): void {
    const effect = this.activeEffects.find(e => e.id === effectId);
    if (effect) {
      effect.expanded = isExpanded;
    }
  }

  getActiveEffects(): BreathingEffect[] {
    return this.activeEffects;
  }

  reset(): void {
    this.activeEffects = [];
    this.settingPointForEffectId = null;
    this.effectIdCounter = 1;
    this.renderEffectsUI();
  }

  showNotification(message: string, type: NotificationType = 'info'): void {
    const toastContainer = this.getToastContainer();
    const toast = this.createToast(message, type);
    
    toastContainer.appendChild(toast);
    
    if (typeof (window as any).bootstrap !== 'undefined') {
      const bsToast = new (window as any).bootstrap.Toast(toast, {
        autohide: true,
        delay: 3000
      });
      bsToast.show();
    }
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3500);
  }

  private getToastContainer(): HTMLElement {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container position-fixed top-0 end-0 p-3';
      container.style.zIndex = '1055';
      document.body.appendChild(container);
    }
    return container;
  }

  private createToast(message: string, type: NotificationType): HTMLElement {
    const toast = document.createElement('div');
    toast.className = 'toast align-items-center border-0';
    toast.setAttribute('role', 'alert');
    
    let bgClass = 'bg-primary';
    switch (type) {
      case 'success':
        bgClass = 'bg-success';
        break;
      case 'warning':
        bgClass = 'bg-warning';
        break;
      case 'error':
        bgClass = 'bg-danger';
        break;
    }
    
    toast.className += ` ${bgClass} text-white`;
    
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.parentElement.parentElement.remove()"></button>
      </div>
    `;
    
    return toast;
  }
}
