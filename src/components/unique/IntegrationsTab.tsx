import React, { useState } from "react";
import { Plus, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import DiceNotationModal from "./DiceNotationModal";

// Types - importados do editor principal
type Locale = 
  | "id" | "da" | "de" | "en-GB" | "en-US" | "es-ES" | "es-419" | "fr" | "hr" | "it" 
  | "lt" | "hu" | "nl" | "no" | "pl" | "pt-BR" | "ro" | "fi" | "sv-SE" | "vi" | "tr" 
  | "cs" | "el" | "bg" | "ru" | "uk" | "hi" | "th" | "zh-CN" | "ja" | "zh-TW" | "ko" 
  | string;
type Localization<T = string> = { default: T } & Partial<Record<Locale, T>>;
type LabelString = string & { __brand_label100?: true };
type LabelLocalization = { default: LabelString } & Partial<Record<Locale, LabelString>>;

interface BaseStat {
  id: number;
  name: LabelLocalization;
  edit_page?: number[];
  emoji?: string;
}

type Stats = BaseStat & (
  | { type: "numeric"; min?: number; max?: number }
  | { type: "enum"; options: number | any[] }
  | { type: "boolean" }
  | { type: "string"; minLength?: number; maxLength?: number }
  | { type: "calculated"; formula: string }
);

interface SchemaOption {
  value: string;
  label: LabelLocalization; // Modificado: transformado em LabelLocalization para suportar i18n
}

interface SchemaEval {
  name: LabelLocalization; // Modificado: transformado em LabelLocalization para suportar i18n
  type: "eval";
  options: SchemaOption[];
}

interface NexusSchemas {
  id: number;
  name: LabelLocalization;
  description: Localization<string>;
  fields?: {
    [key: number]: SchemaEval;
  };
  AutorizedModifierList: any[];
  authorized_status_ids: number[];
}

interface Integrations {
  iniciative?: {
    dice_notation: string;
  };
  atributes_roll?: string;
  schemas: NexusSchemas[];
}

interface IntegrationsTabProps {
  integrations?: Integrations;
  stats: Stats[];
  onUpdateIntegrations: (integrations: Integrations) => void;
  // Componentes auxiliares para localização
  LabelLocalizationEditor: React.ComponentType<{
    label: string;
    value: LabelLocalization;
    onChange: (v: LabelLocalization) => void;
  }>;
  CompactTextLocalizationEditor: React.ComponentType<{
    label: string;
    value: Localization<string>;
    onChange: (v: Localization<string>) => void;
    placeholder?: string;
  }>;
}

const IntegrationsTab: React.FC<IntegrationsTabProps> = ({
  integrations,
  stats,
  onUpdateIntegrations,
  LabelLocalizationEditor,
  CompactTextLocalizationEditor,
}) => {
  const [newFieldKey, setNewFieldKey] = useState<number>(1);
  const [showIniciativeEditor, setShowIniciativeEditor] = useState(false);
  const [tempIniciative, setTempIniciative] = useState<string>("");
  const [showAtributesRollEditor, setShowAtributesRollEditor] = useState(false);
  const [tempAtributesRoll, setTempAtributesRoll] = useState<string>("");
  const [expandedSchemas, setExpandedSchemas] = useState<Set<number>>(new Set());

  const toggleSchema = (schemaId: number) => {
    const newExpanded = new Set(expandedSchemas);
    if (newExpanded.has(schemaId)) {
      newExpanded.delete(schemaId);
    } else {
      newExpanded.add(schemaId);
    }
    setExpandedSchemas(newExpanded);
  };

  const currentIntegrations: Integrations = integrations || {
    schemas: [],
  };

  const updateIntegrations = (updates: Partial<Integrations>) => {
    onUpdateIntegrations({ ...currentIntegrations, ...updates });
  };

  const addSchema = () => {
    const newId = currentIntegrations.schemas.length; // ID incremental automático
    const newSchema: NexusSchemas = {
      id: newId,
      name: { default: `Schema ${newId}` as LabelString },
      description: { default: "Descrição do schema" },
      fields: {},
      AutorizedModifierList: [],
      authorized_status_ids: []
    };
    updateIntegrations({
      schemas: [...currentIntegrations.schemas, newSchema],
    });
  };

  const updateSchema = (index: number, updates: Partial<NexusSchemas>) => {
    const schemas = [...currentIntegrations.schemas];
    schemas[index] = { ...schemas[index], ...updates };
    updateIntegrations({ schemas });
  };

  const removeSchema = (index: number) => {
    const schemas = currentIntegrations.schemas.filter((_, i) => i !== index);
    updateIntegrations({ schemas });
  };

  const addField = (schemaIndex: number) => {
    const schema = currentIntegrations.schemas[schemaIndex];
    const newField: SchemaEval = {
      name: { default: "novo_campo" as LabelString }, // Modificado para usar LabelLocalization
      type: "eval",
      options: [],
    };
    
    const fields = { ...schema.fields };
    fields[newFieldKey] = newField;
    
    updateSchema(schemaIndex, { fields });
    setNewFieldKey(newFieldKey + 1);
  };

  const updateField = (schemaIndex: number, fieldKey: number, updates: Partial<SchemaEval>) => {
    const schema = currentIntegrations.schemas[schemaIndex];
    const fields = { ...schema.fields };
    fields[fieldKey] = { ...fields[fieldKey], ...updates };
    updateSchema(schemaIndex, { fields });
  };

  const removeField = (schemaIndex: number, fieldKey: number) => {
    const schema = currentIntegrations.schemas[schemaIndex];
    const fields = { ...schema.fields };
    delete fields[fieldKey];
    updateSchema(schemaIndex, { fields });
  };

  const addOption = (schemaIndex: number, fieldKey: number) => {
    const schema = currentIntegrations.schemas[schemaIndex];
    const field = schema.fields?.[fieldKey];
    if (field) {
      const newOption: SchemaOption = {
        value: "",
        label: { default: "Nova Opção" as LabelString }, // Modificado para usar LabelLocalization
      };
      updateField(schemaIndex, fieldKey, {
        options: [...field.options, newOption],
      });
    }
  };

  const updateOption = (schemaIndex: number, fieldKey: number, optionIndex: number, updates: Partial<SchemaOption>) => {
    const schema = currentIntegrations.schemas[schemaIndex];
    const field = schema.fields?.[fieldKey];
    if (field) {
      const options = [...field.options];
      options[optionIndex] = { ...options[optionIndex], ...updates };
      updateField(schemaIndex, fieldKey, { options });
    }
  };

  const removeOption = (schemaIndex: number, fieldKey: number, optionIndex: number) => {
    const schema = currentIntegrations.schemas[schemaIndex];
    const field = schema.fields?.[fieldKey];
    if (field) {
      const options = field.options.filter((_, i) => i !== optionIndex);
      updateField(schemaIndex, fieldKey, { options });
    }
  };

  const addAuthorizedStatusId = (schemaIndex: number, statusId: number) => {
    const schema = currentIntegrations.schemas[schemaIndex];
    if (!schema.authorized_status_ids.includes(statusId)) {
      updateSchema(schemaIndex, {
        authorized_status_ids: [...schema.authorized_status_ids, statusId],
      });
    }
  };

  const removeAuthorizedStatusId = (schemaIndex: number, statusId: number) => {
    const schema = currentIntegrations.schemas[schemaIndex];
    updateSchema(schemaIndex, {
      authorized_status_ids: schema.authorized_status_ids.filter(id => id !== statusId),
    });
  };

  const openIniciativeEditor = () => {
    setTempIniciative(currentIntegrations.iniciative?.dice_notation || "");
    setShowIniciativeEditor(true);
  };

  const confirmIniciative = (notation: string) => {
    updateIntegrations({ iniciative: { dice_notation: notation } });
    setShowIniciativeEditor(false);
    setTempIniciative("");
  };

  const openAtributesRollEditor = () => {
    setTempAtributesRoll(currentIntegrations.atributes_roll || "");
    setShowAtributesRollEditor(true);
  };

  const confirmAtributesRoll = (notation: string) => {
    updateIntegrations({ atributes_roll: notation });
    setShowAtributesRollEditor(false);
    setTempAtributesRoll("");
  };

  // Função auxiliar para converter antigo formato (string) para novo formato (LabelLocalization)
  const ensureLabelLocalization = (value: string | LabelLocalization): LabelLocalization => {
    if (typeof value === 'string') {
      return { default: value as LabelString };
    }
    return value;
  };

  return (
    <div className="grid gap-6">
      {/* Configurações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Integração</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label>Notação de Iniciativa</Label>
            <div className="flex gap-2">
              <Textarea
                value={currentIntegrations.iniciative?.dice_notation || ""}
                onChange={(e) =>
                  updateIntegrations({
                    iniciative: { dice_notation: e.target.value },
                  })
                }
                placeholder="Ex: 1d20 + <stat:1:value>"
                rows={2}
                className="flex-1 font-mono text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={openIniciativeEditor}
                title="Abrir Editor de Dice Notation"
                className="h-auto"
              >
                🎲 Editor
              </Button>
            </div>
            {currentIntegrations.iniciative?.dice_notation && (
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                <strong>Configurado:</strong> {currentIntegrations.iniciative.dice_notation}
              </div>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label>Atributos de Rolagem</Label>
            <div className="flex gap-2">
              <Textarea
                value={currentIntegrations.atributes_roll || ""}
                onChange={(e) =>
                  updateIntegrations({
                    atributes_roll: e.target.value,
                  })
                }
                placeholder="Ex: 1d20 + <stat:3:value>"
                rows={2}
                className="flex-1 font-mono text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={openAtributesRollEditor}
                title="Abrir Editor de Dice Notation"
                className="h-auto"
              >
                🎲 Editor
              </Button>
            </div>
            {currentIntegrations.atributes_roll && (
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                <strong>Configurado:</strong> {currentIntegrations.atributes_roll}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schemas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Nexus Schemas</CardTitle>
          <Button onClick={addSchema} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Schema
          </Button>
        </CardHeader>
        <CardContent>
          {currentIntegrations.schemas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <div className="text-2xl mb-2">🔗</div>
              <p className="text-sm">Nenhum schema configurado.</p>
              <p className="text-xs">Adicione schemas para configurar integrações.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {currentIntegrations.schemas.map((schema, schemaIndex) => (
                <Collapsible 
                  key={schema.id} 
                  open={expandedSchemas.has(schema.id)} 
                  onOpenChange={() => toggleSchema(schema.id)}
                >
                  <Card className="border-dashed">
                    <div className="flex items-center justify-between hover:bg-accent/50 transition-colors pr-4">
                      <CollapsibleTrigger className="flex-1 text-left">
                        <CardHeader className="py-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Schema {schema.id}</Badge>
                            <span className="font-medium">{schema.name.default}</span>
                            <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${expandedSchemas.has(schema.id) ? 'rotate-90' : ''}`} />
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeSchema(schemaIndex)}
                        title="Remover schema"
                        className="hover:bg-red-500/10 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CollapsibleContent>
                      <CardContent className="grid gap-4">
                    <LabelLocalizationEditor
                      label="Nome do Schema"
                      value={schema.name}
                      onChange={(v) => updateSchema(schemaIndex, { name: v })}
                    />
                    
                    <CompactTextLocalizationEditor
                      label="Descrição"
                      value={schema.description}
                      onChange={(v) => updateSchema(schemaIndex, { description: v })}
                      placeholder="Descrição do schema"
                    />

                    {/* Authorized Status IDs (Stats) */}
                    <div className="grid gap-2">
                      <Label>Stats Autorizados</Label>
                      <div className="border rounded-md p-3 bg-muted/20">
                        <div className="grid gap-2 max-h-32 overflow-y-auto">
                          {stats.map((stat) => (
                            <label key={stat.id} className="flex items-center space-x-2 text-sm">
                              <Checkbox
                                checked={schema.authorized_status_ids.includes(stat.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    addAuthorizedStatusId(schemaIndex, stat.id);
                                  } else {
                                    removeAuthorizedStatusId(schemaIndex, stat.id);
                                  }
                                }}
                              />
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {stat.type}
                                </Badge>
                                <span>
                                  {stat.emoji && `${stat.emoji} `}
                                  {stat.name?.default || `Stat ${stat.id}`}
                                </span>
                                <code className="text-xs bg-muted px-1 rounded">
                                  ID: {stat.id}
                                </code>
                              </div>
                            </label>
                          ))}
                        </div>
                        {stats.length === 0 && (
                          <p className="text-muted-foreground text-xs text-center py-2">
                            Nenhum stat disponível no sistema
                          </p>
                        )}
                        {schema.authorized_status_ids.length > 0 && (
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-xs text-muted-foreground mb-1">
                              Selecionados: {schema.authorized_status_ids.length} stats
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {schema.authorized_status_ids.map((id) => {
                                const stat = stats.find(s => s.id === id);
                                return (
                                  <Badge key={id} variant="secondary" className="text-xs">
                                    {stat?.name?.default || `ID ${id}`}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Fields */}
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label>Campos do Schema</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addField(schemaIndex)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Campo
                        </Button>
                      </div>
                      
                      {schema.fields && Object.keys(schema.fields).length > 0 ? (
                        <div className="grid gap-3">
                          {Object.entries(schema.fields).map(([fieldKey, field]) => (
                            <Card key={fieldKey} className="border-muted">
                              <CardHeader className="py-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      Campo {fieldKey}
                                    </Badge>
                                    <code className="text-xs bg-muted px-2 py-1 rounded">
                                      {typeof field.name === 'string' 
                                        ? field.name 
                                        : field.name.default}
                                    </code>
                                  </div>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => removeField(schemaIndex, Number(fieldKey))}
                                    className="h-6 w-6"
                                    title="Remover campo"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="py-2 grid gap-3">
                                {/* Título do campo com suporte i18n */}
                                <div className="grid gap-2">
                                  <Label className="text-xs">Nome do Campo</Label>
                                  <LabelLocalizationEditor
                                    label="Título"
                                    value={ensureLabelLocalization(field.name)}
                                    onChange={(v) =>
                                      updateField(schemaIndex, Number(fieldKey), {
                                        name: v,
                                      })
                                    }
                                  />
                                </div>

                                {/* Options */}
                                <div className="grid gap-2">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-xs">Opções</Label>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => addOption(schemaIndex, Number(fieldKey))}
                                      className="h-6 text-xs"
                                    >
                                      + Opção
                                    </Button>
                                  </div>
                                  
                                  {field.options.map((option, optionIndex) => (
                                    <div key={optionIndex} className="grid gap-2">
                                      <div className="flex items-center gap-2">
                                        <Input
                                          value={option.value}
                                          onChange={(e) =>
                                            updateOption(schemaIndex, Number(fieldKey), optionIndex, {
                                              value: e.target.value,
                                            })
                                          }
                                          placeholder="Valor"
                                          className="text-xs flex-1"
                                          maxLength={100}
                                          showCharCount={true}
                                        />
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          onClick={() =>
                                            removeOption(schemaIndex, Number(fieldKey), optionIndex)
                                          }
                                          className="h-6 w-6"
                                          title="Remover opção"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                      {/* Editor de rótulo com suporte i18n para opções */}
                                      <LabelLocalizationEditor
                                        label={`Label da opção "${option.value}"`}
                                        value={ensureLabelLocalization(option.label)}
                                        onChange={(v) =>
                                          updateOption(schemaIndex, Number(fieldKey), optionIndex, {
                                            label: v,
                                          })
                                        }
                                      />
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground border border-dashed rounded">
                          <p className="text-xs">Nenhum campo configurado</p>
                        </div>
                      )}
                    </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs para editores de dice notation */}
      <DiceNotationModal
        isOpen={showIniciativeEditor}
        onClose={() => setShowIniciativeEditor(false)}
        value={tempIniciative}
        onChange={setTempIniciative}
        onConfirm={confirmIniciative}
      />

      <DiceNotationModal
        isOpen={showAtributesRollEditor}
        onClose={() => setShowAtributesRollEditor(false)}
        value={tempAtributesRoll}
        onChange={setTempAtributesRoll}
        onConfirm={confirmAtributesRoll}
      />
    </div>
  );
};

export default IntegrationsTab;