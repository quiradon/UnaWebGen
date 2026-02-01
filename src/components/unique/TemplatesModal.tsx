import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Globe, User, Search, Link, Crown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { RPGSystem } from "@/components/sistemaeditor/editor";
import config from "@/config";
import { getSession } from "@/scripts/session-manager";

interface SystemSummary {
  id: string;
  name: string;
  description: string;
  is_custom: boolean;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSystem: (system: RPGSystem) => void;
}

export function TemplatesModal({ isOpen, onClose, onSelectSystem }: TemplatesModalProps) {
  const [systems, setSystems] = useState<SystemSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSystems();
      fetchCurrentUser();
      setSearchTerm("");
    }
  }, [isOpen]);

  const filteredSystems = systems.filter(sys => 
    sys.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (sys.description && sys.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const fetchCurrentUser = async () => {
    try {
      const session = await getSession(config.api_url);
      if (session.authenticated && session.user?.id) {
        setCurrentUserId(session.user.id);
      }
    } catch (error) {
      console.error("Erro ao buscar sessão:", error);
    }
  };

  const fetchSystems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.api_url}/rpg/systems/`);
      if (!response.ok) throw new Error("Falha ao buscar sistemas");
      const data = await response.json();
      setSystems(data.systems_list || []);
    } catch (error) {
      toast.error("Erro ao carregar lista de sistemas");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSystem = async (id: string, authorId: string | null) => {
    setLoadingId(id);
    try {
      const response = await fetch(`${config.api_url}/rpg/systems/${id}`);
      if (!response.ok) throw new Error("Falha ao buscar detalhes do sistema");
      const data = await response.json();
      
      console.log("API Response:", data);

      if (data.system_data && data.system_data.sistema) {
        // Adicionar ID e author_id do sistema aos dados para poder salvar depois
        // Usar authorId passado da lista (que já sabemos estar correto)
        const systemWithId = {
          ...data.system_data.sistema,
          __systemId: id,
          __authorId: authorId
        };
        console.log("System with metadata:", { __systemId: id, __authorId: authorId });
        onSelectSystem(systemWithId);
        toast.success("Sistema carregado com sucesso!");
        onClose();
      } else {
        console.error("Estrutura inválida:", data);
        throw new Error("Dados do sistema inválidos: propriedade 'sistema' não encontrada");
      }
    } catch (error) {
      toast.error("Erro ao carregar sistema");
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Sistemas Implementados</DialogTitle>
          <DialogDescription>
            Escolha um dos sistemas pré-configurados para usar como base.
          </DialogDescription>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar sistema por nome ou descrição..." 
              className="pl-9" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 min-h-0 pr-4">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 pb-4">
              {filteredSystems.map((sys) => (
                <Card key={sys.id} className="cursor-pointer hover:border-primary transition-colors flex flex-col" onClick={() => handleSelectSystem(sys.id, sys.author_id)}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-lg">{sys.name}</CardTitle>
                      <div className="flex gap-1 shrink-0">
                        {currentUserId && sys.author_id === currentUserId && (
                          <Badge variant="default" className="bg-amber-600 hover:bg-amber-700">
                            <Crown className="h-3 w-3 mr-1"/>
                            Meu Sistema
                          </Badge>
                        )}
                        {sys.is_custom ? (
                          <Badge variant="secondary"><User className="h-3 w-3 mr-1"/> Custom</Badge>
                        ) : (
                          <Badge><Globe className="h-3 w-3 mr-1"/> Oficial</Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2 min-h-[2.5em]">
                      {sys.description || "Sem descrição"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto pt-0 flex gap-2">
                    <div className="flex gap-2 flex-1">
                      <Button 
                        className="flex-1" 
                        variant="outline" 
                        disabled={loadingId === sys.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectSystem(sys.id, sys.author_id);
                        }}
                      >
                        {loadingId === sys.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Carregar Template
                      </Button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Copiar Link de Remix"
                      onClick={(e) => {
                        e.stopPropagation();
                        const url = `${window.location.origin}${window.location.pathname}?remix=${sys.id}`;
                        navigator.clipboard.writeText(url);
                        toast.success("Link de remix copiado!");
                      }}
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              
              {filteredSystems.length === 0 && !loading && (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  {searchTerm ? "Nenhum sistema encontrado para a busca." : "Nenhum sistema disponível."}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

