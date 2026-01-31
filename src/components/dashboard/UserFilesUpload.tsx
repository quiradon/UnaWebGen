import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import ImageUploader from '@/components/dashboard/ImageUploader';
import { PortalContainerProvider } from '@/components/ui/portal-context';

interface UserFilesUploadProps {
  apiBase: string;
}

export default function UserFilesUpload({ apiBase }: UserFilesUploadProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  const handleSuccess = () => {
    // Dispatch event for Astro component to catch
    window.dispatchEvent(new CustomEvent('fileUploaded'));
    setModalOpen(false);
  };

  return (
    <div className="system-editor" ref={setContainer}>
      <PortalContainerProvider container={container}>
        <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Imagem
        </Button>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Enviar Nova Imagem</DialogTitle>
              <DialogDescription>
                Escolha uma imagem para enviar para sua galeria.
              </DialogDescription>
            </DialogHeader>
            <ImageUploader 
              apiBase={apiBase} 
              onSuccess={handleSuccess}
              onCancel={() => setModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </PortalContainerProvider>
    </div>
  );
}
