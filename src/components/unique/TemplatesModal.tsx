import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Globe, User, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { RPGSystem } from "@/components/sistemaeditor/editor";

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

  useEffect(() => {
    if (isOpen) {
      fetchSystems();
      setSearchTerm("");
    }
  }, [isOpen]);

  const filteredSystems = systems.filter(sys => 
    sys.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (sys.description && sys.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const fetchSystems = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://api-rpg.arkanus.app/rpg/systems/");
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

  const handleSelectSystem = async (id: string) => {
    setLoadingId(id);
    try {
      const response = await fetch(`https://api-rpg.arkanus.app/rpg/systems/${id}`);
      if (!response.ok) throw new Error("Falha ao buscar detalhes do sistema");
      const data = await response.json();
      
      console.log("API Response:", data);

      if (data.system_data && data.system_data.sistema) {
        onSelectSystem(data.system_data.sistema);
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
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Sistemas Implementados</DialogTitle>
          <DialogDescription>
            Escolha um dos sistemas pré-configurados para usar como base.
          </DialogDescription>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar sistema por nome ou descrição..." 
              className="pl-8" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4 h-[60vh]">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 pb-4">
              {filteredSystems.map((sys) => (
                <Card key={sys.id} className="cursor-pointer hover:border-primary transition-colors flex flex-col" onClick={() => handleSelectSystem(sys.id)}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-lg">{sys.name}</CardTitle>
                      {sys.is_custom ? (
                        <Badge variant="secondary" className="shrink-0"><User className="h-3 w-3 mr-1"/> Custom</Badge>
                      ) : (
                        <Badge className="shrink-0"><Globe className="h-3 w-3 mr-1"/> Oficial</Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2 min-h-[2.5em]">
                      {sys.description || "Sem descrição"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto pt-0">
                    <Button 
                      className="w-full mt-2" 
                      variant="outline" 
                      disabled={loadingId === sys.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectSystem(sys.id);
                      }}
                    >
                      {loadingId === sys.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Carregar Template
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
