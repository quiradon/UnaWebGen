import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { toPng } from "html-to-image";

import templateLibraryData from "@data/handout-templates.json";

import { HandoutCanvasModals } from "@/components/handoutbuilder/HandoutCanvasModals";
import { HandoutCanvasSidebar } from "@/components/handoutbuilder/HandoutCanvasSidebar";
import { HandoutCanvasTopbar } from "@/components/handoutbuilder/HandoutCanvasTopbar";
import { HandoutCanvasStage } from "@/components/handoutbuilder/canvas/HandoutCanvasStage";
import type { HandoutCanvasLayerContext } from "@/components/handoutbuilder/canvas/HandoutCanvasLayer";
import { LayerContextMenu } from "@/components/handoutbuilder/menus/LayerContextMenu";
import { LayersPanel } from "@/components/handoutbuilder/panels/LayersPanel";
import {
  DEFAULT_FONT_PRESET,
  FONT_PRESETS,
  FONT_PRESET_IDS,
  FONT_WEIGHT_OPTIONS,
  FONT_WEIGHT_VALUES,
} from "@/components/handoutbuilder/handoutCanvasOptions";
import type {
  AssetItem,
  CSSVars,
  ContextMenuState,
  FillPreset,
  FontPresetId,
  FontWeight,
  HandoutCanvasDocV1,
  Layer,
  LayerEffects,
  ShadowEffect,
  ShapeFillMode,
  ShapeImageFit,
  ShapeKind,
  ShapeLayer,
  SnapGuide,
  TextLayer,
} from "@/components/handoutbuilder/handoutCanvasTypes";
import { clamp, normalizeHexColor } from "@/components/handoutbuilder/handoutCanvasUtils";
import { ASSET_GROUPS } from "@/components/handoutbuilder/handoutCanvasAssets";
import {
  COLOR_HISTORY_KEY,
  COLOR_HISTORY_LIMIT,
  FILL_PRESET_KEY,
  PAGE_SIZE_MAX,
  PAGE_SIZE_MIN,
  SNAP_PREF_KEY,
  STORAGE_KEY,
  TEMPLATE_PREVIEW_LARGE_MAX,
  ZOOM_BUTTON_STEP,
  ZOOM_MAX,
  ZOOM_MIN,
  ZOOM_STEP,
  ZOOM_STEP_LARGE,
} from "@/components/handoutbuilder/handoutCanvasConfig";
import {
  DEFAULT_DOC,
  DEFAULT_FILL_STOP_1,
  DEFAULT_FILL_STOP_2,
  DEFAULT_SHAPE_FILL_COLOR,
  DEFAULT_SHAPE_FILL_COLOR_2,
  DEFAULT_TEXT_STROKE_COLOR,
  createDefaultEffects,
} from "@/components/handoutbuilder/handoutCanvasDefaults";
import { applyAlphaToColor } from "@/components/handoutbuilder/handoutCanvasEffects";
import { getClosestWeight, getBoldWeight, getRegularWeight } from "@/components/handoutbuilder/handoutCanvasFontUtils";
import {
  buildSvgDataUrl,
  createId,
  fileToDataUrl,
  getImageNaturalSize,
  isSvgFile,
  readFileText,
} from "@/components/handoutbuilder/handoutCanvasHelpers";
import {
  isObject,
  normalizeDocV1,
  normalizeFillPreset,
  normalizeTemplateLibrary,
  safeBoolean,
  safeNumber,
} from "@/components/handoutbuilder/handoutCanvasNormalize";
import { getPreviewSize } from "@/components/handoutbuilder/handoutCanvasTemplates";

function HandoutCanvasBuilder() {
  type SidebarTab =
    | "elements"
    | "assets"
    | "files"
    | "page"
    | "props"
    | "effects"
    | "export";
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("elements");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [doc, setDoc] = useState<HandoutCanvasDocV1>(DEFAULT_DOC);
  const [topbarPulse, setTopbarPulse] = useState(false);
  const [colorHistory, setColorHistory] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [manipulatingId, setManipulatingId] = useState<string | null>(null);
  const [dragOverride, setDragOverride] = useState<{ id: string; x: number; y: number } | null>(null);
  const [groupDragOffset, setGroupDragOffset] = useState<{ dx: number; dy: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [layersPanelOpen, setLayersPanelOpen] = useState(false);
  const [fillPresets, setFillPresets] = useState<FillPreset[]>([]);
  const [assetSearch, setAssetSearch] = useState("");
  const [pendingAsset, setPendingAsset] = useState<AssetItem | null>(null);
  const [collapsedAssetGroups, setCollapsedAssetGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const group of ASSET_GROUPS) {
      if (group.defaultCollapsed) initial[group.id] = true;
    }
    return initial;
  });
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [snapTolerance, setSnapTolerance] = useState(6);
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);
  const [fontWeightSupport, setFontWeightSupport] = useState<Partial<Record<FontPresetId, FontWeight[]>>>({});
  const [hasLoaded, setHasLoaded] = useState(false);
  const [apiBase, setApiBase] = useState("");

  const pageRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const topbarRef = useRef<HTMLDivElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const layersPanelRef = useRef<HTMLDivElement | null>(null);
  const jsonFileRef = useRef<HTMLInputElement | null>(null);
  const imageFileRef = useRef<HTMLInputElement | null>(null);
  const shapeImageFileRef = useRef<HTMLInputElement | null>(null);
  const textImageFileRef = useRef<HTMLInputElement | null>(null);
  const textEditorRef = useRef<HTMLTextAreaElement | null>(null);
  const editingSnapshotRef = useRef<string>("");
  const snapFrameRef = useRef<number | null>(null);
  const snapPendingRef = useRef<SnapGuide[] | null>(null);
  const snapTargetsRef = useRef<{ vertical: number[]; horizontal: number[] } | null>(null);
  const dragFrameRef = useRef<number | null>(null);
  const dragPendingRef = useRef<{ id: string; x: number; y: number } | null>(null);
  const dragAnchorRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const groupDragFrameRef = useRef<number | null>(null);
  const groupDragPendingRef = useRef<{ dx: number; dy: number } | null>(null);
  const groupDragAnchorRef = useRef<{ offsetX: number; offsetY: number } | null>(null);
  const appliedTemplateRef = useRef(false);
  const groupDragRef = useRef<{
    ids: string[];
    startBounds: { x: number; y: number; width: number; height: number };
    startLayers: Record<string, { x: number; y: number; width: number; height: number }>;
  } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setHasLoaded(true);
        return;
      }
      const parsed = JSON.parse(raw) as unknown;
      const normalized = normalizeDocV1(parsed);
      if (normalized) setDoc(normalized);
      setHasLoaded(true);
    } catch {
      setHasLoaded(true);
    }
  }, []);

  // Ler apiBase do DOM
  useEffect(() => {
    const authElement = document.querySelector('[data-handout-auth]');
    if (authElement) {
      const api = authElement.getAttribute('data-api-base');
      if (api) setApiBase(api);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(COLOR_HISTORY_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      const cleaned = parsed
        .map((item) => (typeof item === "string" ? normalizeHexColor(item) : null))
        .filter((item): item is string => Boolean(item));
      if (!cleaned.length) return;
      const seen = new Set<string>();
      const deduped = cleaned.filter((color) => {
        const key = color.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setColorHistory(deduped.slice(0, COLOR_HISTORY_LIMIT));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FILL_PRESET_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      const cleaned = parsed
        .map(normalizeFillPreset)
        .filter((item): item is FillPreset => Boolean(item));
      setFillPresets(cleaned);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      const snapRaw = localStorage.getItem(SNAP_PREF_KEY);
      if (!snapRaw) return;
      const parsed = JSON.parse(snapRaw);
      if (!isObject(parsed)) return;
      setSnapEnabled(safeBoolean(parsed.enabled, true));
      setSnapTolerance(clamp(safeNumber(parsed.tolerance, 6), 2, 30));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
    } catch {
      // ignore
    }
  }, [doc, hasLoaded]);

  useEffect(() => {
    try {
      localStorage.setItem(FILL_PRESET_KEY, JSON.stringify(fillPresets));
    } catch {
      // ignore
    }
  }, [fillPresets]);

  useEffect(() => {
    try {
      localStorage.setItem(
        SNAP_PREF_KEY,
        JSON.stringify({ enabled: snapEnabled, tolerance: snapTolerance }),
      );
    } catch {
      // ignore
    }
  }, [snapEnabled, snapTolerance]);

  useEffect(() => {
    if (typeof document === "undefined" || !("fonts" in document)) return;
    let active = true;
    const fonts = document.fonts;
    const checkWeights = () => {
      const results: Partial<Record<FontPresetId, FontWeight[]>> = {};
      for (const id of FONT_PRESET_IDS) {
        const stack = FONT_PRESETS[id].stack;
        const supported = FONT_WEIGHT_VALUES.filter((weight) =>
          fonts.check(`normal ${weight} 16px ${stack}`, "Aa"),
        );
        results[id] = supported.length ? supported : [400];
      }
      if (active) setFontWeightSupport(results);
    };

    checkWeights();
    fonts.ready.then(checkWeights).catch(() => {});

    if (typeof fonts.addEventListener === "function") {
      fonts.addEventListener("loadingdone", checkWeights);
      fonts.addEventListener("loadingerror", checkWeights);
      return () => {
        active = false;
        fonts.removeEventListener("loadingdone", checkWeights);
        fonts.removeEventListener("loadingerror", checkWeights);
      };
    }

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(COLOR_HISTORY_KEY, JSON.stringify(colorHistory));
    } catch {
      // ignore
    }
  }, [colorHistory]);

  useEffect(() => {
    if (!editingId) return;
    const raf = requestAnimationFrame(() => {
      const editor = textEditorRef.current;
      if (!editor) return;
      editor.focus();
      const len = editor.value.length;
      editor.setSelectionRange(len, len);
    });
    return () => cancelAnimationFrame(raf);
  }, [editingId]);

  useEffect(() => {
    if (!snapEnabled) clearSnapGuides();
  }, [snapEnabled]);

  useEffect(() => {
    if (!pendingAsset) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPendingAsset(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pendingAsset]);

  useEffect(() => {
    if (!contextMenu) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setContextMenu(null);
    };
    const onViewportChange = () => setContextMenu(null);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onViewportChange, true);
    window.addEventListener("resize", onViewportChange);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onViewportChange, true);
      window.removeEventListener("resize", onViewportChange);
    };
  }, [contextMenu]);

  const derivedPage = useMemo(() => {
    const width = clamp(doc.pageWidth, PAGE_SIZE_MIN, PAGE_SIZE_MAX);
    const height = clamp(doc.pageHeight, PAGE_SIZE_MIN, PAGE_SIZE_MAX);
    const paperFill = applyAlphaToColor(doc.paperColor, doc.paperOpacity);

    const vars: CSSVars = {
      "--handout-paper": paperFill,
      "--handout-font": FONT_PRESETS[DEFAULT_FONT_PRESET].stack,
    };

    return { width, height, vars };
  }, [doc.pageWidth, doc.pageHeight, doc.paperColor, doc.paperOpacity]);
  const isPaperTransparent = doc.paperOpacity <= 0;

  const templateLibrary = useMemo(() => normalizeTemplateLibrary(templateLibraryData), []);
  const templateClass = doc.template === "none" ? "" : `handout-template-${doc.template}`;

  useEffect(() => {
    if (!hasLoaded || appliedTemplateRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const templateId = params.get("template");
    if (!templateId) return;
    const templateEntry = templateLibrary.find((entry) => entry.id === templateId);
    if (!templateEntry) return;
    appliedTemplateRef.current = true;
    setDoc({
      ...templateEntry.doc,
      templateId: templateEntry.id,
    });
    clearSelection();
    setEditingId(null);
    setManipulatingId(null);
    editingSnapshotRef.current = "";
    setContextMenu(null);
    setPendingAsset(null);
    setSidebarTab("elements");

    try {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.delete("template");
      window.history.replaceState(window.history.state, "", nextUrl.toString());
    } catch {
      // ignore URL cleanup issues
    }
  }, [hasLoaded, templateLibrary]);
  const assetPreviewVars = useMemo(() => {
    if (!pendingAsset) return {};
    const size = getPreviewSize(pendingAsset.width, pendingAsset.height, TEMPLATE_PREVIEW_LARGE_MAX);
    return {
      width: `${size.width}px`,
      height: `${size.height}px`,
    } as CSSVars;
  }, [pendingAsset]);
  const filteredAssetGroups = useMemo(() => {
    const term = assetSearch.trim().toLowerCase();
    if (!term) return ASSET_GROUPS;
    return ASSET_GROUPS.map((group) => {
      const haystack = `${group.label} ${group.description}`.toLowerCase();
      if (haystack.includes(term)) {
        return group;
      }
      const filteredItems = group.items.filter((asset) => asset.name.toLowerCase().includes(term));
      return { ...group, items: filteredItems };
    }).filter((group) => group.items.length > 0);
  }, [assetSearch]);

  const selectedLayer = useMemo(
    () => doc.layers.find((l) => l.id === selectedId) ?? null,
    [doc.layers, selectedId],
  );
  const selectedLayers = useMemo(
    () => doc.layers.filter((layer) => selectedIds.includes(layer.id)),
    [doc.layers, selectedIds],
  );
  const selectionBounds = useMemo(() => {
    if (selectedLayers.length < 2) return null;
    const minX = Math.min(...selectedLayers.map((layer) => layer.x));
    const minY = Math.min(...selectedLayers.map((layer) => layer.y));
    const maxX = Math.max(...selectedLayers.map((layer) => layer.x + layer.width));
    const maxY = Math.max(...selectedLayers.map((layer) => layer.y + layer.height));
    return {
      x: minX,
      y: minY,
      width: Math.max(1, maxX - minX),
      height: Math.max(1, maxY - minY),
    };
  }, [selectedLayers]);
  const isGroupSelection = Boolean(selectionBounds);
  const isGroupLocked = isGroupSelection ? selectedLayers.some((layer) => layer.locked) : false;
  const activeGroupOffset = manipulatingId === "group" ? groupDragOffset : null;
  const textLayer = selectedLayer?.type === "text" ? selectedLayer : null;
  const textLayerWeights = useMemo(() => {
    if (!textLayer) return FONT_WEIGHT_VALUES;
    const supported = fontWeightSupport[textLayer.fontPreset];
    return supported && supported.length ? supported : FONT_WEIGHT_VALUES;
  }, [textLayer?.fontPreset, fontWeightSupport]);
  const textWeightOptions = useMemo(() => {
    const supported = new Set(textLayerWeights);
    const filtered = FONT_WEIGHT_OPTIONS.filter((option) => supported.has(option.value));
    return filtered.length ? filtered : FONT_WEIGHT_OPTIONS;
  }, [textLayerWeights]);
  const regularWeight = useMemo(() => getRegularWeight(textLayerWeights), [textLayerWeights]);
  const boldWeight = useMemo(() => getBoldWeight(textLayerWeights), [textLayerWeights]);

  useEffect(() => {
    if (!textLayer) return;
    if (textLayerWeights.includes(textLayer.fontWeight)) return;
    const nextWeight = getClosestWeight(textLayerWeights, textLayer.fontWeight);
    if (nextWeight === textLayer.fontWeight) return;
    updateLayer(textLayer.id, (p) => (p.type === "text" ? { ...p, fontWeight: nextWeight } : p));
  }, [textLayer?.id, textLayer?.fontWeight, textLayerWeights]);
  const opacityPercent = selectedLayer ? Math.round(selectedLayer.opacity * 100) : 100;
  const dropShadowOpacityPercent = selectedLayer ? Math.round(selectedLayer.effects.dropShadow.opacity * 100) : 0;
  const innerShadowOpacityPercent = selectedLayer ? Math.round(selectedLayer.effects.innerShadow.opacity * 100) : 0;
  const paperOpacityPercent = Math.round(doc.paperOpacity * 100);

  function adjustZoom(delta: number) {
    setDoc((prev) => ({ ...prev, zoom: clamp(prev.zoom + delta, ZOOM_MIN, ZOOM_MAX) }));
  }

  function recordColor(value: string) {
    const normalized = normalizeHexColor(value);
    if (!normalized) return;
    setColorHistory((prev) => {
      const next = [normalized, ...prev.filter((color) => color.toLowerCase() !== normalized.toLowerCase())];
      return next.slice(0, COLOR_HISTORY_LIMIT);
    });
  }

  function setSelection(ids: string[], primaryId: string | null) {
    setSelectedIds(ids);
    setSelectedId(primaryId);
  }

  function clearSelection() {
    setSelectedIds([]);
    setSelectedId(null);
  }

  function openContextMenu(event: React.MouseEvent, ids: string[], primaryId: string | null) {
    if (!ids.length) return;
    event.preventDefault();
    event.stopPropagation();
    const uniqueIds = Array.from(new Set(ids));
    const resolvedPrimary =
      primaryId && uniqueIds.includes(primaryId) ? primaryId : uniqueIds.length ? uniqueIds[0] : null;
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      ids: uniqueIds,
      primaryId: resolvedPrimary,
    });
  }

  function closeContextMenu() {
    setContextMenu(null);
  }

  function handleStageMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    closeContextMenu();
    const target = event.target as Node;
    if (pageRef.current && pageRef.current.contains(target)) return;
    clearSelection();
    finishTextEditing();
  }

  function handleStageContextMenu(event: React.MouseEvent<HTMLDivElement>) {
    if (editingId) return;
    const ids = selectedIds.length ? selectedIds : selectedId ? [selectedId] : [];
    if (!ids.length) return;
    const primaryId = selectedId ?? ids[0] ?? null;
    openContextMenu(event, ids, primaryId);
  }

  function requestAssetImport(asset: AssetItem) {
    setPendingAsset(asset);
  }

  function confirmAssetImport() {
    if (!pendingAsset) return;
    void addAssetToCanvas(pendingAsset);
    setPendingAsset(null);
  }

  function cancelAssetImport() {
    setPendingAsset(null);
  }

  function toggleAssetGroup(id: string) {
    setCollapsedAssetGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function selectLayerId(id: string, additive: boolean) {
    if (!additive) {
      setSelection([id], id);
      return;
    }
    setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setSelectedId(id);
  }

  function getGroupLayerIds(groupId: string | null) {
    if (!groupId) return [];
    return doc.layers.filter((layer) => layer.groupId === groupId).map((layer) => layer.id);
  }

  function selectGroupById(groupId: string | null) {
    const ids = getGroupLayerIds(groupId);
    if (!ids.length) return;
    const primary = ids.includes(selectedId ?? "") ? selectedId : ids[0];
    setSelection(ids, primary ?? ids[0]);
  }

  function selectLayerFromPointer(layer: Layer, additive: boolean) {
    const groupIds = getGroupLayerIds(layer.groupId);
    if (!additive) {
      const nextIds = groupIds.length ? groupIds : [layer.id];
      setSelection(nextIds, layer.id);
      return;
    }
    const additional = groupIds.length ? groupIds : [layer.id];
    setSelectedIds((prev) => Array.from(new Set([...prev, ...additional])));
    setSelectedId(layer.id);
  }

  function scheduleSnapGuides(guides: SnapGuide[]) {
    if (!snapEnabled) return;
    snapPendingRef.current = guides;
    if (snapFrameRef.current !== null) return;
    snapFrameRef.current = window.requestAnimationFrame(() => {
      snapFrameRef.current = null;
      if (!snapPendingRef.current) return;
      setSnapGuides(snapPendingRef.current);
      snapPendingRef.current = null;
    });
  }

  function clearSnapGuides() {
    snapPendingRef.current = null;
    setSnapGuides([]);
  }

  function prepareSnapTargets(excludeIds: string[]) {
    snapTargetsRef.current = getSnapTargets(excludeIds);
  }

  function clearSnapTargets() {
    snapTargetsRef.current = null;
  }

  function scheduleDragOverride(id: string, x: number, y: number) {
    dragPendingRef.current = { id, x, y };
    if (dragFrameRef.current !== null) return;
    dragFrameRef.current = window.requestAnimationFrame(() => {
      dragFrameRef.current = null;
      const pending = dragPendingRef.current;
      dragPendingRef.current = null;
      if (!pending) return;
      setDragOverride(pending);
    });
  }

  function clearDragOverride() {
    if (dragFrameRef.current !== null) {
      window.cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
    }
    dragPendingRef.current = null;
    dragAnchorRef.current = null;
    setDragOverride(null);
  }

  function scheduleGroupDragUpdate(dx: number, dy: number) {
    groupDragPendingRef.current = { dx, dy };
    if (groupDragFrameRef.current !== null) return;
    groupDragFrameRef.current = window.requestAnimationFrame(() => {
      groupDragFrameRef.current = null;
      const pending = groupDragPendingRef.current;
      groupDragPendingRef.current = null;
      if (!pending) return;
      setGroupDragOffset(pending);
    });
  }

  function cancelGroupDragUpdate() {
    if (groupDragFrameRef.current !== null) {
      window.cancelAnimationFrame(groupDragFrameRef.current);
      groupDragFrameRef.current = null;
    }
    groupDragPendingRef.current = null;
    groupDragAnchorRef.current = null;
    setGroupDragOffset(null);
  }

  function getPointerCanvasPosition(event: MouseEvent | TouchEvent) {
    const page = pageRef.current;
    if (!page) return null;
    const rect = page.getBoundingClientRect();
    if ("touches" in event) {
      const touch = event.touches[0] ?? event.changedTouches[0];
      if (!touch) return null;
      return {
        x: (touch.clientX - rect.left) / doc.zoom,
        y: (touch.clientY - rect.top) / doc.zoom,
      };
    }
    return {
      x: ((event as MouseEvent).clientX - rect.left) / doc.zoom,
      y: ((event as MouseEvent).clientY - rect.top) / doc.zoom,
    };
  }

  function computeSnapResultWithTargets(
    rect: { x: number; y: number; width: number; height: number },
    targets: { vertical: number[]; horizontal: number[] },
  ) {
    if (!snapEnabled) return { x: rect.x, y: rect.y, guides: [] as SnapGuide[] };
    const { vertical, horizontal } = targets;
    const candidatesX = [rect.x, rect.x + rect.width / 2, rect.x + rect.width];
    const candidatesY = [rect.y, rect.y + rect.height / 2, rect.y + rect.height];
    let snappedX = rect.x;
    let snappedY = rect.y;
    let bestXDiff = snapTolerance + 1;
    let bestYDiff = snapTolerance + 1;
    let bestXTarget = 0;
    let bestYTarget = 0;
    const guides: SnapGuide[] = [];

    candidatesX.forEach((candidate) => {
      vertical.forEach((target) => {
        const diff = target - candidate;
        if (Math.abs(diff) < Math.abs(bestXDiff) && Math.abs(diff) <= snapTolerance) {
          bestXDiff = diff;
          bestXTarget = target;
        }
      });
    });

    if (Math.abs(bestXDiff) <= snapTolerance) {
      snappedX = rect.x + bestXDiff;
      guides.push({ axis: "x", value: bestXTarget });
    }

    candidatesY.forEach((candidate) => {
      horizontal.forEach((target) => {
        const diff = target - candidate;
        if (Math.abs(diff) < Math.abs(bestYDiff) && Math.abs(diff) <= snapTolerance) {
          bestYDiff = diff;
          bestYTarget = target;
        }
      });
    });

    if (Math.abs(bestYDiff) <= snapTolerance) {
      snappedY = rect.y + bestYDiff;
      guides.push({ axis: "y", value: bestYTarget });
    }

    return { x: snappedX, y: snappedY, guides };
  }

  function getSnapTargets(excludeIds: string[]) {
    const vertical = [0, derivedPage.width / 2, derivedPage.width];
    const horizontal = [0, derivedPage.height / 2, derivedPage.height];
    doc.layers.forEach((layer) => {
      if (excludeIds.includes(layer.id) || !layer.visible) return;
      vertical.push(layer.x, layer.x + layer.width / 2, layer.x + layer.width);
      horizontal.push(layer.y, layer.y + layer.height / 2, layer.y + layer.height);
    });
    return { vertical, horizontal };
  }

  function computeSnapResult(rect: { x: number; y: number; width: number; height: number }, excludeIds: string[]) {
    if (!snapEnabled) return { x: rect.x, y: rect.y, guides: [] as SnapGuide[] };
    const { vertical, horizontal } = getSnapTargets(excludeIds);
    const candidatesX = [rect.x, rect.x + rect.width / 2, rect.x + rect.width];
    const candidatesY = [rect.y, rect.y + rect.height / 2, rect.y + rect.height];
    let snappedX = rect.x;
    let snappedY = rect.y;
    let bestXDiff = snapTolerance + 1;
    let bestYDiff = snapTolerance + 1;
    let bestXTarget = 0;
    let bestYTarget = 0;
    const guides: SnapGuide[] = [];

    candidatesX.forEach((candidate) => {
      vertical.forEach((target) => {
        const diff = target - candidate;
        if (Math.abs(diff) < Math.abs(bestXDiff) && Math.abs(diff) <= snapTolerance) {
          bestXDiff = diff;
          bestXTarget = target;
        }
      });
    });

    if (Math.abs(bestXDiff) <= snapTolerance) {
      snappedX = rect.x + bestXDiff;
      guides.push({ axis: "x", value: bestXTarget });
    }

    candidatesY.forEach((candidate) => {
      horizontal.forEach((target) => {
        const diff = target - candidate;
        if (Math.abs(diff) < Math.abs(bestYDiff) && Math.abs(diff) <= snapTolerance) {
          bestYDiff = diff;
          bestYTarget = target;
        }
      });
    });

    if (Math.abs(bestYDiff) <= snapTolerance) {
      snappedY = rect.y + bestYDiff;
      guides.push({ axis: "y", value: bestYTarget });
    }

    return { x: snappedX, y: snappedY, guides };
  }

function updateLayer(id: string, updater: (prev: Layer) => Layer) {
  setDoc((prev) => ({
    ...prev,
    layers: prev.layers.map((l) => (l.id === id ? updater(l) : l)),
  }));
}

function updateLayers(ids: string[], updater: (prev: Layer) => Layer) {
  if (!ids.length) return;
  const idSet = new Set(ids);
  setDoc((prev) => ({
    ...prev,
    layers: prev.layers.map((layer) => (idSet.has(layer.id) ? updater(layer) : layer)),
  }));
}

function updateLayerEffects(id: string, updater: (prev: LayerEffects) => LayerEffects) {
  updateLayer(id, (prev) => ({ ...prev, effects: updater(prev.effects) }));
}

function updateShadowEffect(
  id: string,
  key: "dropShadow" | "innerShadow",
  updater: (prev: ShadowEffect) => ShadowEffect,
) {
  updateLayerEffects(id, (prev) => ({ ...prev, [key]: updater(prev[key]) }));
}

  function startTextEditing(layer: TextLayer) {
    editingSnapshotRef.current = layer.text;
    setSelection([layer.id], layer.id);
    setEditingId(layer.id);
  }

  function finishTextEditing() {
    setEditingId(null);
    editingSnapshotRef.current = "";
  }

  function cancelTextEditing() {
    if (!editingId) return;
    updateLayer(editingId, (p) => (p.type === "text" ? { ...p, text: editingSnapshotRef.current } : p));
    setEditingId(null);
    editingSnapshotRef.current = "";
  }

  function moveLayerOneStep(id: string, direction: -1 | 1) {
    setDoc((prev) => {
      const idx = prev.layers.findIndex((l) => l.id === id);
      if (idx < 0) return prev;
      const nextIdx = idx + direction;
      if (nextIdx < 0 || nextIdx >= prev.layers.length) return prev;
      const layers = [...prev.layers];
      const [item] = layers.splice(idx, 1);
      layers.splice(nextIdx, 0, item);
      return { ...prev, layers };
    });
  }

  function moveLayersBy(ids: string[], dx: number, dy: number) {
    if (!ids.length) return;
    updateLayers(ids, (layer) => (layer.locked ? layer : { ...layer, x: layer.x + dx, y: layer.y + dy }));
  }

  function duplicateLayers(ids: string[]) {
    if (!ids.length) return;
    const sourceLayers = doc.layers.filter((layer) => ids.includes(layer.id));
    if (!sourceLayers.length) return;
    const duplicates = sourceLayers.map((layer) => {
      const nextId = createId(layer.type === "shape" ? "shape" : "txt");
      return {
        ...layer,
        id: nextId,
        name: `${layer.name || "Camada"} copia`,
        x: layer.x + 12,
        y: layer.y + 12,
        groupId: layer.groupId,
      };
    });
    setDoc((prev) => ({ ...prev, layers: [...prev.layers, ...duplicates] }));
    setSelection(
      duplicates.map((layer) => layer.id),
      duplicates[0]?.id ?? null,
    );
  }

  function groupSelectedLayers(ids: string[]) {
    if (ids.length < 2) return;
    const groupId = createId("group");
    updateLayers(ids, (layer) => ({ ...layer, groupId }));
  }

  function ungroupSelectedLayers(ids: string[]) {
    if (!ids.length) return;
    updateLayers(ids, (layer) => ({ ...layer, groupId: null }));
  }

  function toggleLockSelected(ids: string[]) {
    if (!ids.length) return;
    const layers = doc.layers.filter((layer) => ids.includes(layer.id));
    const shouldLock = layers.some((layer) => !layer.locked);
    updateLayers(ids, (layer) => ({ ...layer, locked: shouldLock }));
  }

  function toggleVisibilitySelected(ids: string[]) {
    if (!ids.length) return;
    const layers = doc.layers.filter((layer) => ids.includes(layer.id));
    const shouldShow = layers.some((layer) => !layer.visible);
    updateLayers(ids, (layer) => ({ ...layer, visible: shouldShow }));
  }

  function toggleFlipSelected(ids: string[], axis: "x" | "y") {
    if (!ids.length) return;
    const layers = doc.layers.filter((layer) => ids.includes(layer.id));
    const shouldFlip = layers.some((layer) => (axis === "x" ? !layer.flipX : !layer.flipY));
    updateLayers(ids, (layer) =>
      axis === "x" ? { ...layer, flipX: shouldFlip } : { ...layer, flipY: shouldFlip },
    );
  }

  function startRotation(e: React.PointerEvent, layer: Layer) {
    if (layer.locked) return;
    const pageRect = pageRef.current?.getBoundingClientRect();
    if (!pageRect) return;

    e.preventDefault();
    e.stopPropagation();
    setManipulatingId(layer.id);

    const centerX = pageRect.left + (layer.x + layer.width / 2) * doc.zoom;
    const centerY = pageRect.top + (layer.y + layer.height / 2) * doc.zoom;
    const startAngle = (Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180) / Math.PI;
    const startRotation = layer.rotation;
    const prevUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";

    const handleMove = (ev: PointerEvent) => {
      const angle = (Math.atan2(ev.clientY - centerY, ev.clientX - centerX) * 180) / Math.PI;
      const nextRotation = clamp(startRotation + (angle - startAngle), -360, 360);
      updateLayer(layer.id, (p) => ({ ...p, rotation: nextRotation }));
    };

    const handleUp = () => {
      document.body.style.userSelect = prevUserSelect;
      setManipulatingId(null);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
  }

  function deleteLayers(ids: string[]) {
    if (!ids.length) return;
    const idSet = new Set(ids);
    setDoc((prev) => {
      const remaining = prev.layers.filter((l) => !idSet.has(l.id));
      const cleaned = remaining.map((layer) =>
        layer.clipToId && idSet.has(layer.clipToId) ? { ...layer, clipToId: null } : layer,
      );
      return { ...prev, layers: cleaned };
    });
    setSelectedIds((prev) => {
      const next = prev.filter((id) => !idSet.has(id));
      setSelectedId((current) => {
        if (!current || !idSet.has(current)) return current;
        return next.length ? next[0] : null;
      });
      return next;
    });
    setEditingId((current) => (current && idSet.has(current) ? null : current));
  }

  function deleteLayer(id: string) {
    deleteLayers([id]);
  }

  function addText() {
    const id = createId("txt");
    const number = doc.layers.filter((l) => l.type === "text").length + 1;

    const layer: TextLayer = {
      id,
      type: "text",
      name: `Texto ${number}`,
      x: 72,
      y: 560,
      width: 520,
      height: 140,
      opacity: 1,
      rotation: 0,
      flipX: false,
      flipY: false,
      locked: false,
      visible: true,
      groupId: null,
      clipToId: null,
      blendMode: "normal",
      effects: createDefaultEffects(),
      text: "Novo texto",
      fontSize: 32,
      color: "#2b1b0e",
      align: "left",
      fontPreset: DEFAULT_FONT_PRESET,
      fontWeight: 800,
      italic: false,
      underline: false,
      backgroundColor: "transparent",
      padding: 0,
      fillMode: "solid",
      fillColor: "#2b1b0e",
      fillColor2: DEFAULT_SHAPE_FILL_COLOR_2,
      fillStop1: DEFAULT_FILL_STOP_1,
      fillStop2: DEFAULT_FILL_STOP_2,
      gradientAngle: 45,
      imageSrc: "",
      imageFit: "fill",
      letterSpacing: 0,
      lineHeight: 1.2,
      strokeColor: DEFAULT_TEXT_STROKE_COLOR,
      strokeWidth: 0,
    };

    setDoc((prev) => ({ ...prev, layers: [...prev.layers, layer] }));
    setSelection([id], id);
    setSidebarTab("props");
  }

  function addShape(kind: ShapeKind) {
    const id = createId("shape");
    const number = doc.layers.filter((l) => l.type === "shape").length + 1;
    const base = Math.round(Math.min(derivedPage.width, derivedPage.height) * 0.28);
    const isRect = kind === "rect";
    const width = isRect ? Math.round(base * 1.4) : base;
    const height = isRect ? Math.round(base * 0.9) : base;
    const x = Math.max(0, Math.round((derivedPage.width - width) / 2));
    const y = Math.max(0, Math.round((derivedPage.height - height) / 2));

    const layer: ShapeLayer = {
      id,
      type: "shape",
      name: `Forma ${number}`,
      x,
      y,
      width,
      height,
      opacity: 1,
      rotation: 0,
      flipX: false,
      flipY: false,
      locked: false,
      visible: true,
      groupId: null,
      clipToId: null,
      blendMode: "normal",
      effects: createDefaultEffects(),
      shape: kind,
      cornerRadius: isRect ? 12 : 0,
      fillMode: "solid",
      fillColor: DEFAULT_SHAPE_FILL_COLOR,
      fillColor2: DEFAULT_SHAPE_FILL_COLOR_2,
      fillStop1: DEFAULT_FILL_STOP_1,
      fillStop2: DEFAULT_FILL_STOP_2,
      gradientAngle: 45,
      imageSrc: "",
      imageFit: "fill",
    };

    setDoc((prev) => ({ ...prev, layers: [...prev.layers, layer] }));
    setSelection([id], id);
    setSidebarTab("props");
  }

  async function addImages(files: FileList) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;

    toast.message(`Carregando ${list.length} imagem(ns)...`);
    const created: ShapeLayer[] = [];

    for (const file of list) {
      try {
        let layer: ShapeLayer | null = null;
        if (isSvgFile(file)) {
          const svgText = await readFileText(file);
          const src = buildSvgDataUrl(svgText);
          layer = await createImageShapeLayerFromSrc(src, file.name, { imageFit: "fit" });
          if (layer) {
            layer.svgSource = svgText;
            layer.svgFill = DEFAULT_SHAPE_FILL_COLOR;
            layer.svgStroke = DEFAULT_TEXT_STROKE_COLOR;
            layer.svgFillEnabled = false;
            layer.svgStrokeEnabled = false;
          }
        } else {
          const src = await fileToDataUrl(file);
          layer = await createImageShapeLayerFromSrc(src, file.name);
        }
        if (layer) created.push(layer);
      } catch (error) {
        console.error(error);
        toast.error(`Falha ao carregar: ${file.name}`);
      }
    }

    if (!created.length) return;
    setDoc((prev) => ({ ...prev, layers: [...prev.layers, ...created] }));
    setSelection([created[created.length - 1].id], created[created.length - 1].id);
    setLayersPanelOpen(true);
    toast.success("Imagem(ns) adicionada(s).");
  }

  async function addImageFromUrl(url: string) {
    try {
      toast.message("Carregando imagem...");
      const layer = await createImageShapeLayerFromSrc(url, "Imagem do usuário");
      if (layer) {
        setDoc((prev) => ({ ...prev, layers: [...prev.layers, layer] }));
        setSelection([layer.id], layer.id);
        setSidebarTab("props");
        toast.success("Imagem adicionada!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar imagem.");
    }
  }

  async function addSvg(files: FileList) {
    const list = Array.from(files).filter(
      (file) => file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg"),
    );
    if (!list.length) {
      toast.error("Selecione arquivos SVG.");
      return;
    }

    toast.message(`Carregando ${list.length} SVG(s)...`);
    const created: ShapeLayer[] = [];

    for (const file of list) {
      try {
        const svgText = await readFileText(file);
        const src = buildSvgDataUrl(svgText);
        const layer = await createImageShapeLayerFromSrc(src, file.name, { imageFit: "fit" });
        if (layer) {
          layer.svgSource = svgText;
          layer.svgFill = DEFAULT_SHAPE_FILL_COLOR;
          layer.svgStroke = DEFAULT_TEXT_STROKE_COLOR;
          layer.svgFillEnabled = false;
          layer.svgStrokeEnabled = false;
          created.push(layer);
        }
      } catch (error) {
        console.error(error);
        toast.error(`Falha ao carregar: ${file.name}`);
      }
    }

    if (!created.length) return;
    setDoc((prev) => ({ ...prev, layers: [...prev.layers, ...created] }));
    setSelection([created[created.length - 1].id], created[created.length - 1].id);
    setLayersPanelOpen(true);
    toast.success("SVG(s) adicionados.");
  }

  async function createImageShapeLayerFromSrc(
    src: string,
    name: string,
    options?: {
      fillMode?: ShapeFillMode;
      imageFit?: ShapeImageFit;
      size?: { width: number; height: number };
    },
  ) {
    const natural = options?.size ?? (await getImageNaturalSize(src));
    const maxW = derivedPage.width * 0.85;
    const maxH = derivedPage.height * 0.6;
    const scale = Math.min(maxW / natural.width, maxH / natural.height, 1);
    const width = Math.max(64, Math.round(natural.width * scale));
    const height = Math.max(64, Math.round(natural.height * scale));
    const x = Math.max(0, Math.round((derivedPage.width - width) / 2));
    const y = Math.max(0, Math.round((derivedPage.height - height) / 2));

    const layer: ShapeLayer = {
      id: createId("shape"),
      type: "shape",
      name,
      x,
      y,
      width,
      height,
      opacity: 1,
      rotation: 0,
      flipX: false,
      flipY: false,
      locked: false,
      visible: true,
      groupId: null,
      clipToId: null,
      blendMode: "normal",
      effects: createDefaultEffects(),
      shape: "rect",
      cornerRadius: 0,
      fillMode: options?.fillMode ?? "image",
      fillColor: DEFAULT_SHAPE_FILL_COLOR,
      fillColor2: DEFAULT_SHAPE_FILL_COLOR_2,
      fillStop1: DEFAULT_FILL_STOP_1,
      fillStop2: DEFAULT_FILL_STOP_2,
      gradientAngle: 45,
      imageSrc: src,
      imageFit: options?.imageFit ?? "fill",
      imageWidth: natural.width,
      imageHeight: natural.height,
    };
    return layer;
  }

  async function addAssetToCanvas(asset: AssetItem) {
    try {
      const layer = await createImageShapeLayerFromSrc(asset.src, asset.name, {
        fillMode: "image",
        imageFit: "fill",
        size: { width: asset.width, height: asset.height },
      });
      if (!layer) return;
      setDoc((prev) => ({ ...prev, layers: [...prev.layers, layer] }));
      setSelection([layer.id], layer.id);
      setLayersPanelOpen(true);
    } catch (error) {
      console.error(error);
      toast.error("Falha ao inserir asset.");
    }
  }

  async function setShapeFillImage(layerId: string, file: File) {
    try {
      let src = "";
      let svgText: string | null = null;
      if (isSvgFile(file)) {
        svgText = await readFileText(file);
        src = buildSvgDataUrl(svgText);
      } else {
        src = await fileToDataUrl(file);
      }
      const natural = await getImageNaturalSize(src);
      updateLayer(layerId, (p) =>
        p.type === "shape"
          ? {
              ...p,
              imageSrc: src,
              fillMode: "image",
              imageWidth: natural.width,
              imageHeight: natural.height,
              imageFit: svgText ? "fit" : p.imageFit,
              svgSource: svgText,
              svgFill: svgText ? DEFAULT_SHAPE_FILL_COLOR : undefined,
              svgStroke: svgText ? DEFAULT_TEXT_STROKE_COLOR : undefined,
              svgFillEnabled: svgText ? false : undefined,
              svgStrokeEnabled: svgText ? false : undefined,
            }
          : p,
      );
      toast.success("Imagem aplicada.");
    } catch (error) {
      console.error(error);
      toast.error("Falha ao carregar imagem.");
    }
  }

  async function setTextFillImage(layerId: string, file: File) {
    try {
      const src = await fileToDataUrl(file);
      const natural = await getImageNaturalSize(src);
      updateLayer(layerId, (p) =>
        p.type === "text"
          ? {
              ...p,
              imageSrc: src,
              fillMode: "image",
              imageWidth: natural.width,
              imageHeight: natural.height,
            }
          : p,
      );
      toast.success("Imagem aplicada.");
    } catch (error) {
      console.error(error);
      toast.error("Falha ao carregar imagem.");
    }
  }

  function buildFillPreset(layer: TextLayer | ShapeLayer): FillPreset {
    return {
      id: createId("preset"),
      label: layer.name || "Preset",
      mode: layer.fillMode,
      color1: layer.fillColor || DEFAULT_SHAPE_FILL_COLOR,
      color2: layer.fillColor2 || DEFAULT_SHAPE_FILL_COLOR_2,
      stop1: layer.fillStop1 ?? DEFAULT_FILL_STOP_1,
      stop2: layer.fillStop2 ?? DEFAULT_FILL_STOP_2,
      angle: layer.gradientAngle ?? 45,
      imageSrc: layer.imageSrc || "",
      imageFit: layer.imageFit || "fill",
    };
  }

  function saveFillPreset(layer: TextLayer | ShapeLayer) {
    const preset = buildFillPreset(layer);
    setFillPresets((prev) => [preset, ...prev]);
    toast.success("Preset salvo.");
  }

  function applyFillPreset(layerId: string, preset: FillPreset) {
    updateLayer(layerId, (layer) => {
      if (layer.type !== "shape" && layer.type !== "text") return layer;
      const fillMode = preset.mode === "image" && !preset.imageSrc ? "solid" : preset.mode;
      if (layer.type === "text") {
        return {
          ...layer,
          fillMode,
          fillColor: preset.color1,
          fillColor2: preset.color2,
          fillStop1: preset.stop1,
          fillStop2: preset.stop2,
          gradientAngle: preset.angle,
          imageSrc: preset.imageSrc,
          imageFit: preset.imageFit,
          color: preset.color1,
        };
      }
      return {
        ...layer,
        fillMode,
        fillColor: preset.color1,
        fillColor2: preset.color2,
        fillStop1: preset.stop1,
        fillStop2: preset.stop2,
        gradientAngle: preset.angle,
        imageSrc: preset.imageSrc,
        imageFit: preset.imageFit,
      };
    });
  }

  function removeFillPreset(id: string) {
    setFillPresets((prev) => prev.filter((preset) => preset.id !== id));
  }

  function getPresetPreviewStyle(preset: FillPreset): React.CSSProperties {
    if (preset.mode === "solid") {
      return { background: preset.color1 };
    }
    if (preset.mode === "linear") {
      return {
        backgroundImage: `linear-gradient(${preset.angle}deg, ${preset.color1} ${preset.stop1}%, ${preset.color2} ${preset.stop2}%)`,
      };
    }
    if (preset.mode === "radial") {
      return {
        backgroundImage: `radial-gradient(circle at center, ${preset.color1} ${preset.stop1}%, ${preset.color2} ${preset.stop2}%)`,
      };
      }
      if (preset.imageSrc) {
        const backgroundSize =
          preset.imageFit === "fill" || preset.imageFit === "crop"
            ? "cover"
            : preset.imageFit === "fit"
              ? "contain"
              : "auto";
        return {
          backgroundImage: `url(${preset.imageSrc})`,
          backgroundSize,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        };
      }
    return { background: preset.color1 };
  }

  function resetAll() {
    setDoc(DEFAULT_DOC);
    clearSelection();
    setEditingId(null);
    editingSnapshotRef.current = "";
    setColorHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(COLOR_HISTORY_KEY);
    } catch {
      // ignore
    }
    toast.message("Resetado.");
  }

  async function exportPng() {
    const node = pageRef.current;
    if (!node) return;

    const prevSelected = selectedId;
    const prevSelectedIds = selectedIds;
    clearSelection();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    node.dataset.exporting = "true";
    try {
      toast.message("Gerando PNG…");
      const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "handout.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("PNG exportado.");
    } catch (error) {
      console.error(error);
      toast.error("Falha ao exportar PNG.");
    } finally {
      delete node.dataset.exporting;
      setSelection(prevSelectedIds, prevSelected);
    }
  }

  function exportJson() {
    try {
      const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
      downloadBlob(blob, "handout.json");
      toast.success("JSON exportado.");
    } catch {
      toast.error("Falha ao exportar JSON.");
    }
  }

  async function importJsonFile(file: File) {
    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw) as unknown;
      const normalized = normalizeDocV1(parsed);
      if (!normalized) {
        toast.error("Arquivo inválido.");
        return;
      }
      setDoc(normalized);
      clearSelection();
      toast.success("Importado.");
    } catch (error) {
      console.error(error);
      toast.error("Falha ao importar.");
    }
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || target?.isContentEditable) return;

      const isModifier = e.ctrlKey || e.metaKey;
      if (isModifier) {
        const isZoomInKey = e.key === "=" || e.key === "+" || e.code === "NumpadAdd";
        const isZoomOutKey = e.key === "-" || e.key === "_" || e.code === "NumpadSubtract";
        const isZoomResetKey = e.key === "0" || e.code === "Numpad0";

        if (isZoomInKey) {
          e.preventDefault();
          adjustZoom(ZOOM_BUTTON_STEP);
          return;
        }
        if (isZoomOutKey) {
          e.preventDefault();
          adjustZoom(-ZOOM_BUTTON_STEP);
          return;
        }
        if (isZoomResetKey) {
          e.preventDefault();
          setDoc((p) => ({ ...p, zoom: clamp(1, ZOOM_MIN, ZOOM_MAX) }));
          return;
        }
      }

      const activeIds = selectedIds.length ? selectedIds : selectedId ? [selectedId] : [];
      if (!activeIds.length) return;

      if (isModifier && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateLayers(activeIds);
        return;
      }
      if (isModifier && e.key.toLowerCase() === "g") {
        e.preventDefault();
        if (e.shiftKey) {
          ungroupSelectedLayers(activeIds);
        } else {
          groupSelectedLayers(activeIds);
        }
        return;
      }
      if (isModifier && e.key.toLowerCase() === "l") {
        e.preventDefault();
        toggleLockSelected(activeIds);
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteLayers(activeIds);
        return;
      }

      const step = e.shiftKey ? 10 : 1;
      if (e.key === "ArrowUp") {
        e.preventDefault();
        moveLayersBy(activeIds, 0, -step);
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        moveLayersBy(activeIds, 0, step);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        moveLayersBy(activeIds, -step, 0);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        moveLayersBy(activeIds, step, 0);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId, selectedIds, doc.layers]);

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      const direction = Math.sign(e.deltaY);
      if (direction === 0) return;
      e.preventDefault();
      const step = e.shiftKey ? ZOOM_STEP_LARGE : ZOOM_STEP;
      adjustZoom(-direction * step);
    };

    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const topbar = topbarRef.current;
    const preview = previewRef.current;
    if (!topbar || !preview) return;

    const updateOffset = () => {
      const height = Math.ceil(topbar.getBoundingClientRect().height);
      preview.style.setProperty("--handout-topbar-offset", `${height}px`);
    };

    updateOffset();

    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateOffset) : null;
    observer?.observe(topbar);
    window.addEventListener("resize", updateOffset);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateOffset);
    };
  }, []);

  useEffect(() => {
    setTopbarPulse(true);
    const timeout = window.setTimeout(() => setTopbarPulse(false), 260);
    return () => window.clearTimeout(timeout);
  }, [selectedLayer?.id, selectedLayer?.type]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (sidebarCollapsed || pendingAsset) return;
      const target = event.target as Node | null;
      if (!target) return;
      if (sidebarRef.current?.contains(target)) return;
      if (topbarRef.current?.contains(target)) return;
      if (layersPanelRef.current?.contains(target)) return;
      const portalRoot = document.getElementById("handout-builder-portal-root");
      if (portalRoot?.contains(target)) return;
      setSidebarCollapsed(true);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [sidebarCollapsed, pendingAsset]);

  const openPropsTab = () => setSidebarTab("props");

  const layerContext: HandoutCanvasLayerContext = {
    zoom: doc.zoom,
    pageWidth: derivedPage.width,
    pageHeight: derivedPage.height,
    layers: doc.layers,
    selectedIds,
    selectedId,
    editingId,
    manipulatingId,
    isGroupSelection,
    activeGroupOffset,
    dragOverride,
    snapEnabled,
    snapTargetsRef,
    dragAnchorRef,
    textEditorRef,
    updateLayer,
    setSelection,
    selectLayerFromPointer,
    openContextMenu,
    closeContextMenu,
    finishTextEditing,
    cancelTextEditing,
    startTextEditing,
    openPropsTab,
    startRotation,
    getPointerCanvasPosition,
    prepareSnapTargets,
    clearSnapGuides,
    clearSnapTargets,
    scheduleDragOverride,
    clearDragOverride,
    computeSnapResult,
    computeSnapResultWithTargets,
    getSnapTargets,
    scheduleSnapGuides,
    setManipulatingId,
  };

  return (
    <div className="handout-builder-app">
      <div className="handout-builder-layout">
        <section ref={previewRef} className="handout-builder-preview">
          <HandoutCanvasTopbar
            topbarRef={topbarRef}
            topbarPulse={topbarPulse}
            doc={doc}
            selectedLayer={selectedLayer}
            textLayer={textLayer}
            colorHistory={colorHistory}
            opacityPercent={opacityPercent}
            paperOpacityPercent={paperOpacityPercent}
            textWeightOptions={textWeightOptions}
            regularWeight={regularWeight}
            boldWeight={boldWeight}
            updateLayer={updateLayer}
            setDoc={setDoc}
            recordColor={recordColor}
          />
          <div className={`handout-canvas-shell ${sidebarCollapsed ? "is-collapsed" : ""}`}>
            <HandoutCanvasSidebar
              sidebarRef={sidebarRef}
              sidebarTab={sidebarTab}
              setSidebarTab={setSidebarTab}
              sidebarCollapsed={sidebarCollapsed}
              setSidebarCollapsed={setSidebarCollapsed}
              elementsProps={{ addText, addShape, addSvg }}
              assetsProps={{
                assetSearch,
                setAssetSearch,
                imageFileRef,
                addImages,
                filteredAssetGroups,
                collapsedAssetGroups,
                toggleAssetGroup,
                requestAssetImport,
              }}
              filesProps={{
                apiBase,
                onInsertImage: addImageFromUrl,
              }}
              pageProps={{
                doc,
                setDoc,
                recordColor,
                colorHistory,
                snapEnabled,
                setSnapEnabled,
                snapTolerance,
                setSnapTolerance,
              }}
              propsProps={{
                selectedLayer,
                selectedIds,
                docLayers: doc.layers,
                groupSelectedLayers,
                ungroupSelectedLayers,
                selectGroupById,
                updateLayer,
                recordColor,
                colorHistory,
                shapeImageFileRef,
                textImageFileRef,
                setShapeFillImage,
                setTextFillImage,
              }}
              effectsProps={{
                selectedLayer,
                updateShadowEffect,
                updateLayerEffects,
                recordColor,
                colorHistory,
                dropShadowOpacityPercent,
                innerShadowOpacityPercent,
              }}
              exportProps={{ exportPng, exportJson, importJsonFile, resetAll, jsonFileRef }}
            />
            <HandoutCanvasStage
              stageRef={stageRef}
              pageRef={pageRef}
              doc={doc}
              derivedPage={derivedPage}
              templateClass={templateClass}
              isPaperTransparent={isPaperTransparent}
              snapGuides={snapGuides}
              layerContext={layerContext}
              selectionBounds={selectionBounds}
              selectedLayers={selectedLayers}
              selectedIds={selectedIds}
              isGroupLocked={isGroupLocked}
              activeGroupOffset={activeGroupOffset}
              snapEnabled={snapEnabled}
              handleStageMouseDown={handleStageMouseDown}
              handleStageContextMenu={handleStageContextMenu}
              addImages={addImages}
              clearSelection={clearSelection}
              finishTextEditing={finishTextEditing}
              groupDragRef={groupDragRef}
              groupDragAnchorRef={groupDragAnchorRef}
              scheduleGroupDragUpdate={scheduleGroupDragUpdate}
              cancelGroupDragUpdate={cancelGroupDragUpdate}
              setDoc={setDoc}
            />
          </div>
          <LayersPanel
            open={layersPanelOpen}
            layers={doc.layers}
            selectedIds={selectedIds}
            panelRef={layersPanelRef}
            onToggleOpen={() => setLayersPanelOpen((prev) => !prev)}
            onClose={() => setLayersPanelOpen(false)}
            onSelectLayer={(layer, shiftKey) => {
              selectLayerFromPointer(layer, shiftKey);
              setSidebarTab("props");
            }}
            onMoveLayer={moveLayerOneStep}
            onToggleVisible={(id) => updateLayer(id, (prev) => ({ ...prev, visible: !prev.visible }))}
            onToggleLocked={(id) => updateLayer(id, (prev) => ({ ...prev, locked: !prev.locked }))}
            onDeleteLayer={deleteLayer}
          />
          <LayerContextMenu
            contextMenu={contextMenu}
            layers={doc.layers}
            onClose={closeContextMenu}
            onDuplicate={duplicateLayers}
            onDelete={deleteLayers}
            onMoveLayer={moveLayerOneStep}
            onToggleFlip={toggleFlipSelected}
          />
          <HandoutCanvasModals
            pendingAsset={pendingAsset}
            assetPreviewVars={assetPreviewVars}
            confirmAssetImport={confirmAssetImport}
            cancelAssetImport={cancelAssetImport}
          />
        </section>
      </div>
    </div>
  );
}

export default HandoutCanvasBuilder;

