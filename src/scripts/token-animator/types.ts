// Tipos compartilhados do Token Animator

export interface Marker {
  x: number;
  y: number;
}

export interface BreathingEffect {
  id: number;
  type: 'breathing';
  strength: number;
  radius: number;
  softness: number;
  speed: number;
  phase: number;
  marker: Marker;
  showPreview: boolean;
  expanded: boolean;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface EffectsManagerElements {
  activeEffectsList: HTMLElement | null;
  noEffectsText: HTMLElement | null;
  canvas: HTMLCanvasElement | null;
  animationToggle: HTMLElement | null;
  animationToggleText: HTMLElement | null;
  effectCount?: HTMLElement | null;
}

export interface ExportOptions {
  fps?: number;
  duration?: number;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  ext?: string; // 'webm' | 'webp'
  filename?: string;
}
