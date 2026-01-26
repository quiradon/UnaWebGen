import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import ImageUploadModal from '@/components/ImageUploadModal';
import { toast } from 'sonner';
import { PortalContainerProvider } from '@/components/ui/portal-context';

interface UserFilesUploadProps {
  apiBase: string;
}

export default function UserFilesUpload({ apiBase }: UserFilesUploadProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  const handleUpload = async (blob: Blob) => {
    setIsUploading(true);
    const formData = new FormData();
    // Ensure filename has extension
    formData.append('file', blob, 'upload.png');

    try {
      const response = await fetch(`${apiBase}/rpg/files`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Falha no upload');
      }

      toast.success('Arquivo enviado com sucesso!');
      // Dispatch event for Astro component to catch
      window.dispatchEvent(new CustomEvent('fileUploaded'));
      setModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao enviar arquivo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="system-editor" ref={setContainer}>
      <PortalContainerProvider container={container}>
        <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Imagem
        </Button>
        <ImageUploadModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={handleUpload}
          title="Enviar Nova Imagem"
          description="Escolha uma imagem para enviar para sua galeria."
          // Default behavior: free crop, no fixed resolution
        />
      </PortalContainerProvider>
    </div>
  );
}
