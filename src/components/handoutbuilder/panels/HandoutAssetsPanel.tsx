import { ChevronDown, ChevronRight, Lock, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AssetGroup, AssetItem } from "@/components/handoutbuilder/handoutCanvasTypes";

type HandoutAssetsPanelProps = {
  assetSearch: string;
  setAssetSearch: (value: string) => void;
  imageFileRef: React.RefObject<HTMLInputElement>;
  addImages: (files: FileList) => void | Promise<void>;
  filteredAssetGroups: AssetGroup[];
  collapsedAssetGroups: Record<string, boolean>;
  toggleAssetGroup: (id: string) => void;
  requestAssetImport: (asset: AssetItem) => void;
};

export function HandoutAssetsPanel(props: HandoutAssetsPanelProps) {
  const {
    assetSearch,
    setAssetSearch,
    imageFileRef,
    addImages,
    filteredAssetGroups,
    collapsedAssetGroups,
    toggleAssetGroup,
    requestAssetImport,
  } = props;

  return (
    <div className="handout-panel-section">
      <div className="handout-panel-title">Assets</div>

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
          {assetSearch ? "Nenhum asset encontrado." : "Catalogo vazio no momento."}
        </div>
      )}
    </div>
  );
}
