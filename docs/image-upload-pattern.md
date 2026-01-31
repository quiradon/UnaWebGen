# Padrão de Upload de Imagens

Este documento descreve o padrão padronizado para upload de imagens no projeto Arkanus.

## Componente Padrão

O componente **`ImageUploader`** (`front/src/components/dashboard/ImageUploader.tsx`) é o componente padrão para todos os uploads de imagem no projeto.

### Características

- ✅ **Conversão WebP automática**: Converte imagens para WebP no cliente antes do upload (reduz ~60-80% do tamanho)
- ✅ **Crop de imagem**: Interface completa de recorte com rotação
- ✅ **Qualidade otimizada**: WebP com 90% de qualidade mantém excelente qualidade visual
- ✅ **Fallback PNG**: Em navegadores muito antigos (pré-2010), usa PNG como fallback
- ✅ **Proporções flexíveis**: Suporta crop livre ou proporções fixas (1:1, 16:9, etc)
- ✅ **Crop circular**: Opção para recorte circular (ideal para avatares)

## Como Usar

### Em Páginas Astro

Use o wrapper `UploadImageModal.astro`:

```astro
---
import UploadImageModal from "@/components/Modal/UploadImageModal.astro"

const apiBase = import.meta.env.PUBLIC_API_BASE
---

<button data-bs-toggle="modal" data-bs-target="#uploadImageModal">
  Upload
</button>

<UploadImageModal modalId="uploadImageModal" apiBase={apiBase} />
```

### Em Componentes React

Use o `ImageUploader` diretamente com `Dialog` do shadcn/ui:

```tsx
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import ImageUploader from "@/components/dashboard/ImageUploader"
import { Button } from "@/components/ui/button"

export function MyComponent({ apiBase }: { apiBase: string }) {
  const [modalOpen, setModalOpen] = useState(false)

  const handleSuccess = () => {
    setModalOpen(false)
    // Recarregar dados, mostrar toast, etc
  }

  return (
    <>
      <Button onClick={() => setModalOpen(true)}>
        Upload
      </Button>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Enviar Nova Imagem</DialogTitle>
            <DialogDescription>
              Escolha uma imagem para enviar.
            </DialogDescription>
          </DialogHeader>
          <ImageUploader 
            apiBase={apiBase}
            onSuccess={handleSuccess}
            onCancel={() => setModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
```

## Props do ImageUploader

```typescript
interface ImageUploaderProps {
  apiBase: string       // URL base da API (ex: "https://api.arkanus.app")
  onCancel?: () => void // Callback ao cancelar upload
  onSuccess?: () => void // Callback ao completar upload com sucesso
  aspect?: number       // Proporção fixa (ex: 1 para 1:1, 16/9 para widescreen)
  circular?: boolean    // Se true, crop será circular (melhor com aspect={1})
}
```

## Endpoint da API

Todos os uploads devem usar o endpoint `/upload`:

```
POST {apiBase}/upload
Content-Type: multipart/form-data

Body:
  file: <blob> (webp)
```

### Resposta

```json
{
  "success": true,
  "file": {
    "id": 123,
    "url": "https://cdn.arkanus.app/uploads/users/uuid.webp",
    "size": 45678,
    "type": 1
  }
}
```

## Exemplos de Uso no Projeto

### Dashboard - Upload Geral
`front/src/components/dashboard/UserFilesUpload.tsx`

```tsx
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
```

### Handout Builder - Upload no Editor
`front/src/components/handoutbuilder/panels/HandoutFilesPanel.tsx`

```tsx
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
      onSuccess={() => {
        setUploadModalOpen(false)
        loadFiles() // Recarrega galeria
      }}
      onCancel={() => setUploadModalOpen(false)}
    />
  </DialogContent>
</Dialog>
```

## Backend

O serviço de upload no backend está em:
- `api/src/services/file-upload.ts`

O upload:
1. Recebe o arquivo WebP do cliente
2. Processa com Sharp (resize se necessário)
3. Envia para Cloudflare R2
4. Salva metadados no PostgreSQL com URL completo da CDN

## Benefícios do Padrão

1. **Consistência**: Mesma interface em todo o projeto
2. **Performance**: Redução significativa no tamanho dos arquivos
3. **UX**: Interface familiar e intuitiva para usuários
4. **Manutenibilidade**: Apenas um componente para manter
5. **Otimização**: Conversão no cliente reduz carga no servidor

## Migração de Código Antigo

Se você encontrar código usando `ImageUploadModal` (React) antigo:

### Antes ❌
```tsx
import ImageUploadModal from "@/components/ImageUploadModal"

<ImageUploadModal
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  onConfirm={handleUpload}
  title="Enviar Nova Imagem"
/>
```

### Depois ✅
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import ImageUploader from "@/components/dashboard/ImageUploader"

<Dialog open={modalOpen} onOpenChange={setModalOpen}>
  <DialogContent className="sm:max-w-[800px]">
    <DialogHeader>
      <DialogTitle>Enviar Nova Imagem</DialogTitle>
      <DialogDescription>Escolha uma imagem para enviar.</DialogDescription>
    </DialogHeader>
    <ImageUploader 
      apiBase={apiBase} 
      onSuccess={() => setModalOpen(false)}
      onCancel={() => setModalOpen(false)}
    />
  </DialogContent>
</Dialog>
```

## Notas Técnicas

- **WebP**: Formato moderno com suporte em todos os navegadores modernos (desde 2010)
- **Sharp**: Biblioteca de processamento de imagem no backend (Node.js)
- **React Crop**: Biblioteca usada para interface de crop no frontend
- **Cloudflare R2**: Storage S3-compatible usado para arquivos
- **CDN**: Arquivos servidos via `https://cdn.arkanus.app/`

---

Última atualização: 2024
