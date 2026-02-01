import { useRef } from "react";
import { 
  Circle, 
  Square, 
  Star, 
  Triangle, 
  Type, 
  Upload, 
  ChevronDown, 
  ChevronRight, 
  Lock
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ShapeKind, AssetGroup, AssetItem } from "@/components/handoutbuilder/handoutCanvasTypes";

type HandoutElementsAssetsPanelProps = {
  // Props para elementos
  addText: () => void;
  addShape: (kind: ShapeKind) => void;
  addSvg: (files: FileList) => void;
  // Props para assets
  assetSearch: string;
  setAssetSearch: (value: string) => void;
  filteredAssetGroups: AssetGroup[];
  collapsedAssetGroups: Record<string, boolean>;
  toggleAssetGroup: (id: string) => void;
  requestAssetImport: (asset: AssetItem) => void;
};

export function HandoutElementsAssetsPanel(props: HandoutElementsAssetsPanelProps) {
  const {
    // Elementos
    addText,
    addShape,
    addSvg,
    // Assets
    assetSearch,
    setAssetSearch,
    filteredAssetGroups,
    collapsedAssetGroups,
    toggleAssetGroup,
    requestAssetImport,
  } = props;

  const svgFileRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="space-y-6">
      {/* Seção de Elementos */}
      <div className="handout-panel-section">
        <div className="handout-panel-title">Elementos</div>
        
        <div className="handout-panel-card">
          <div className="handout-panel-subtitle">Texto</div>
          <Button type="button" onClick={addText} className="w-full gap-2">
            <Type className="h-4 w-4" />
            Adicionar texto
          </Button>
          <div className="handout-panel-hint">
            Crie caixas de texto e ajuste fonte/tamanho na barra superior.
          </div>
        </div>

        <div className="handout-panel-card">
          <div className="handout-panel-subtitle">Formas</div>
          <div className="handout-shape-grid">
            <Button type="button" variant="outline" className="handout-shape-button" onClick={() => addShape("rect")}>
              <Square className="h-4 w-4" />
              Retângulo
            </Button>
            <Button type="button" variant="outline" className="handout-shape-button" onClick={() => addShape("ellipse")}>
              <Circle className="h-4 w-4" />
              Círculo
            </Button>
            <Button type="button" variant="outline" className="handout-shape-button" onClick={() => addShape("triangle")}>
              <Triangle className="h-4 w-4" />
              Triângulo
            </Button>
            <Button type="button" variant="outline" className="handout-shape-button" onClick={() => addShape("diamond")}>
              <Square className="h-4 w-4 rotate-45" />
              Diamante
            </Button>
            <Button type="button" variant="outline" className="handout-shape-button" onClick={() => addShape("hexagon")}>
              <Square className="h-4 w-4" />
              Hexágono
            </Button>
            <Button type="button" variant="outline" className="handout-shape-button" onClick={() => addShape("star")}>
              <Star className="h-4 w-4" />
              Estrela
            </Button>
          </div>
          <div className="handout-panel-hint">Escolha uma forma e personalize o preenchimento nas propriedades.</div>
        </div>

        <div className="handout-panel-card">
          <div className="handout-panel-subtitle">SVG</div>
          <Button type="button" variant="outline" onClick={() => svgFileRef.current?.click()} className="w-full gap-2">
            <Upload className="h-4 w-4" />
            Enviar SVG
          </Button>
          <input
            ref={svgFileRef}
            type="file"
            accept=".svg,image/svg+xml"
            multiple
            className="hidden"
            onChange={(event) => {
              const files = event.target.files;
              if (files?.length) addSvg(files);
              event.currentTarget.value = "";
            }}
          />
          <div className="handout-panel-hint">Envie um SVG para inserir como elemento.</div>
        </div>
      </div>

      {/* Seção de Assets */}
      <div className="handout-panel-section">
        <div className="handout-panel-title">Assets</div>
        
        <div className="handout-panel-card">
          <div className="handout-panel-subtitle">Buscar Assets</div>
          <Input
            type="text"
            placeholder="Buscar assets..."
            value={assetSearch}
            onChange={(e) => setAssetSearch(e.target.value)}
            className="w-full"
          />
        </div>

        {filteredAssetGroups.length > 0 ? (
          <div className="handout-asset-catalog">
            {filteredAssetGroups.map((group) => {
              const isCollapsed = assetSearch.trim() ? false : Boolean(collapsedAssetGroups[group.id]);
              const hasPremium = group.items.some((asset) => asset.premium);
              return (
                <div key={group.id} className="handout-asset-group">
                  <button
                    type="button"
                    className="handout-asset-group-header"
                    onClick={() => toggleAssetGroup(group.id)}
                    aria-expanded={!isCollapsed}
                  >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    <div className="handout-asset-group-meta">
                      <span className="handout-asset-group-name">{group.label}</span>
                      <span className="handout-asset-group-desc">{group.description}</span>
                    </div>
                    <span
                      className={`handout-asset-group-pill ${group.kind === "folder" ? "is-folder" : "is-group"}`}
                    >
                      {group.kind === "folder" ? "Pasta" : "Grupo"}
                    </span>
                    {hasPremium && (
                      <span className="handout-asset-group-premium">
                        <Lock className="h-3 w-3" />
                        Premium
                      </span>
                    )}
                    <span className="handout-asset-group-count">{group.items.length}</span>
                  </button>
                  {!isCollapsed && (
                    <div className="handout-asset-grid">
                      {group.items.map((asset) => (
                        <div key={asset.id} className="handout-asset-card">
                          <div className="handout-asset-preview-wrap">
                            <button
                              type="button"
                              className="handout-asset-preview"
                              onClick={() => requestAssetImport(asset)}
                              title="Importar asset"
                            >
                              <img src={asset.src} alt={asset.name} />
                            </button>
                            {asset.premium && (
                              <span className="handout-asset-badge">
                                <Lock className="h-3 w-3" />
                                Premium
                              </span>
                            )}
                          </div>
                          <div className="handout-asset-meta">
                            <span className="handout-asset-name" title={asset.name}>
                              {asset.name}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="handout-panel-hint">
            {assetSearch ? "Nenhum asset encontrado." : "Catálogo vazio no momento."}
          </div>
        )}
      </div>
    </div>
  );
}