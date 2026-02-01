import { useState, useEffect } from "react";
import { Upload, Image as ImageIcon, Trash2, Loader2, Eye } from "lucide-react";
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

// Componente separado para cada card de arquivo
function FileCard({ 
  file, 
  onInsert, 
  onPreview, 
  onDelete, 
  formatSize 
}: { 
  file: UserFile; 
  onInsert: (url: string) => void;
  onPreview: (file: UserFile) => void;
  onDelete: (id: number, path: string) => void;
  formatSize: (bytes: number) => string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative aspect-square overflow-hidden rounded border-2 border-white/10 bg-black/40"
      style={{ cursor: 'pointer' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onInsert(file.url)}
    >
      {/* Imagem */}
      <img
        src={file.url}
        alt="Arquivo do usuário"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          padding: '4px'
        }}
      />
      
      {/* Overlay e botões */}
      {isHovered && (
        <>
          {/* Overlay escuro */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)'
          }} />
          
          {/* Botões centralizados */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(file);
              }}
              title="Visualizar"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(59, 130, 246, 0.9)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(file.id, file.path);
              }}
              title="Excluir"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.9)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              </svg>
            </button>
          </div>
          
          {/* Info de tamanho */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '4px 8px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)'
          }}>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
              {formatSize(file.size)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

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
      const response = await fetch(`${apiBase}/rpg/files?limit=100`, {
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
    loadFiles();
  };

  const handlePreview = (file: UserFile) => {
    // Configura o modal de preview
    const modal = document.getElementById('file_preview_modal');
    if (modal) {
      const previewImage = document.getElementById('preview-image') as HTMLImageElement;
      const imagePreview = document.getElementById('image-preview');
      const audioPreview = document.getElementById('audio-preview');
      const unsupportedPreview = document.getElementById('unsupported-preview');
      const modalTitle = document.getElementById('file-preview-title');
      
      // Esconde todos os previews
      if (imagePreview) imagePreview.style.display = 'none';
      if (audioPreview) audioPreview.style.display = 'none';
      if (unsupportedPreview) unsupportedPreview.style.display = 'none';
      
      // Configura preview de imagem
      if (imagePreview && previewImage) {
        previewImage.src = file.url;
        previewImage.alt = `Arquivo ${file.id}`;
        imagePreview.style.display = 'block';
      }
      
      // Atualiza título do modal
      if (modalTitle) {
        const fileName = file.url.split('/').pop()?.split('?')[0] || `Arquivo ${file.id}`;
        modalTitle.textContent = fileName;
      }
      
      // Tenta abrir o modal usando Bootstrap de forma mais segura
      const bootstrap = (window as any).bootstrap;
      if (bootstrap?.Modal) {
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
      } else {
        // Fallback: define atributos e dispara evento de clique
        modal.setAttribute('data-bs-toggle', 'modal');
        modal.style.display = 'block';
        modal.classList.add('show');
        document.body.classList.add('modal-open');
        
        // Adiciona backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        backdrop.id = 'file-preview-backdrop';
        document.body.appendChild(backdrop);
        
        // Event listener para fechar o modal
        const closeModal = () => {
          modal.style.display = 'none';
          modal.classList.remove('show');
          document.body.classList.remove('modal-open');
          const existingBackdrop = document.getElementById('file-preview-backdrop');
          if (existingBackdrop) {
            existingBackdrop.remove();
          }
        };
        
        // Fechar ao clicar no backdrop ou botão close
        backdrop.addEventListener('click', closeModal);
        const closeBtn = modal.querySelector('.btn-close');
        if (closeBtn) {
          closeBtn.addEventListener('click', closeModal, { once: true });
        }
      }
    }
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
      
      <div className="grid gap-1.5">
        <Label htmlFor="file-search" className="text-xs">Buscar</Label>
        <Input
          id="file-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar arquivos..."
          className="h-8 text-sm"
        />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => setUploadModalOpen(true)}
        className="w-full gap-2 h-8 text-sm"
      >
        <Upload className="h-3.5 w-3.5" />
        Fazer Upload
      </Button>

      <div className="text-xs text-muted-foreground px-1">
        Clique em uma imagem para adicioná-la ao canvas.
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : filteredFiles.length > 0 ? (
        <ScrollArea className="flex-1" style={{ height: 'calc(100vh - 320px)' }}>
          <div className="grid grid-cols-3 gap-1.5 pr-1 pb-2">
            {filteredFiles.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onInsert={onInsertImage}
                onPreview={handlePreview}
                onDelete={handleDelete}
                formatSize={formatSize}
              />
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
