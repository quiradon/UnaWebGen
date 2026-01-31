import { useState, useEffect } from "react";
import { Upload, Image as ImageIcon, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import ImageUploader from "@/components/dashboard/ImageUploader";
import { toast } from "sonner";

type UserFile = {
  id: number;
  size: number;
  type: number;
  path: string;
  url: string;
};

type FilesResponse = {
  success: boolean;
  files: UserFile[];
  pagination: {
    page: number;
    limit: number;
    total_files: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  total_size: number;
};

type HandoutFilesPanelProps = {
  apiBase: string;
  onInsertImage: (url: string) => void;
};

export function HandoutFilesPanel({ apiBase, onInsertImage }: HandoutFilesPanelProps) {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const loadFiles = async () => {
    if (!apiBase) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/rpg/files?limit=50`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar arquivos');
      }

      const data: FilesResponse = await response.json();
      if (data.success) {
        setFiles(data.files);
      }
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
      toast.error('Erro ao carregar seus arquivos.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    setUploadModalOpen(false);
    loadFiles(); // Recarrega a lista
  };

  const handleDelete = async (fileId: number, path: string) => {
    if (!confirm('Tem certeza que deseja excluir este arquivo?')) return;

    try {
      const response = await fetch(`${apiBase}/rpg/files/${fileId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Falha ao deletar arquivo');
      }

      toast.success('Arquivo excluído!');
      loadFiles();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao excluir arquivo.');
    }
  };

  useEffect(() => {
    loadFiles();
  }, [apiBase]);

  // Escuta evento de upload global
  useEffect(() => {
    const handleFileUploaded = () => loadFiles();
    window.addEventListener('fileUploaded', handleFileUploaded);
    return () => window.removeEventListener('fileUploaded', handleFileUploaded);
  }, []);

  const filteredFiles = files.filter(file =>
    file.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="handout-panel-section">
      <div className="handout-panel-title">Meus Arquivos</div>
      
      <div className="grid gap-2">
        <Label htmlFor="file-search">Buscar</Label>
        <Input
          id="file-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar arquivos..."
        />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => setUploadModalOpen(true)}
        className="w-full gap-2"
      >
        <Upload className="h-4 w-4" />
        Fazer Upload
      </Button>

      <div className="handout-panel-hint">
        Clique em uma imagem para adicioná-la ao canvas.
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredFiles.length > 0 ? (
        <ScrollArea className="h-[400px]">
          <div className="grid grid-cols-2 gap-2">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted/20 hover:border-primary transition-colors"
              >
                <button
                  type="button"
                  onClick={() => onInsertImage(file.url)}
                  className="absolute inset-0 flex items-center justify-center p-2"
                  title="Adicionar ao canvas"
                >
                  <img
                    src={file.url}
                    alt="Arquivo do usuário"
                    className="max-w-full max-h-full object-contain"
                  />
                </button>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs text-white truncate">
                      {formatSize(file.size)}
                    </span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-white hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file.id, file.path);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="handout-panel-hint">
          {searchTerm ? "Nenhum arquivo encontrado." : "Você ainda não tem arquivos. Faça upload acima."}
        </div>
      )}

      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Enviar Nova Imagem</DialogTitle>
            <DialogDescription>
              Escolha uma imagem para enviar para sua galeria.
            </DialogDescription>
          </DialogHeader>
          <ImageUploader 
            apiBase={apiBase} 
            onSuccess={handleUploadSuccess}
            onCancel={() => setUploadModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
