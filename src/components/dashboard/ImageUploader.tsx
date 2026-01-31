import React, { useState, useCallback, useRef, useEffect } from 'react'
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Button } from '@/components/ui/button'
import { Upload, X, RotateCw, Crop as CropIcon } from 'lucide-react'
import { toast } from 'sonner'

/**
 * ImageUploader - Componente padrão de upload de imagens com crop e conversão WebP
 * 
 * Este é o componente PADRÃO para uploads no projeto. Use este componente para garantir
 * consistência em toda a aplicação.
 * 
 * COMO USAR:
 * 
 * 1. Em páginas Astro, use o wrapper UploadImageModal.astro:
 *    ```astro
 *    import UploadImageModal from "@/components/Modal/UploadImageModal.astro"
 *    <UploadImageModal modalId="uploadImageModal" apiBase={apiBase} />
 *    ```
 * 
 * 2. Em componentes React, use este componente diretamente com Dialog:
 *    ```tsx
 *    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
 *    import ImageUploader from "@/components/dashboard/ImageUploader"
 *    
 *    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
 *      <DialogContent className="sm:max-w-[800px]">
 *        <DialogHeader>
 *          <DialogTitle>Enviar Nova Imagem</DialogTitle>
 *          <DialogDescription>Escolha uma imagem para enviar.</DialogDescription>
 *        </DialogHeader>
 *        <ImageUploader 
 *          apiBase={apiBase} 
 *          onSuccess={() => { setModalOpen(false); refetch(); }}
 *          onCancel={() => setModalOpen(false)}
 *        />
 *      </DialogContent>
 *    </Dialog>
 *    ```
 * 
 * OTIMIZAÇÕES:
 * - Converte imagens para WebP no cliente antes do upload (reduz ~60-80% do tamanho)
 * - Qualidade 90% mantém excelente qualidade visual com ótima compressão
 * - Fallback automático para PNG em navegadores antigos (raro, WebP suportado desde 2010)
 * - Reduz drasticamente o uso de banda e acelera uploads
 */
interface ImageUploaderProps {
  apiBase: string
  onCancel?: () => void
  onSuccess?: () => void
  /** Proporção fixa do crop (ex: 1 para quadrado, 16/9 para widescreen). Se não definido, é livre. */
  aspect?: number
  /** Se true, o crop será circular (radial). Funciona melhor com aspect={1} */
  circular?: boolean
}

export default function ImageUploader({ apiBase, onCancel, onSuccess, aspect, circular }: ImageUploaderProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [rotation, setRotation] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [supportsWebP, setSupportsWebP] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  // Se circular está ativo, força aspect 1:1
  const effectiveAspect = circular ? 1 : aspect

  // Verificar suporte WebP no navegador
  useEffect(() => {
    const checkWebPSupport = () => {
      const elem = document.createElement('canvas')
      if (elem.getContext && elem.getContext('2d')) {
        // Era suportado desde 2010, mas vamos verificar
        return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0
      }
      return false
    }
    
    const hasSupport = checkWebPSupport()
    setSupportsWebP(hasSupport)
    if (!hasSupport) {
      console.warn('WebP não é suportado neste navegador, usando PNG como fallback')
    }
  }, [])

  // Quando a imagem carrega, inicializa o crop
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    
    if (effectiveAspect) {
      // Com aspect ratio definido, centraliza o crop
      const initialCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          effectiveAspect,
          width,
          height
        ),
        width,
        height
      )
      setCrop(initialCrop)
    } else {
      // Sem aspect ratio, inicia com 100% da imagem
      const initialCrop: Crop = {
        unit: '%',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      }
      setCrop(initialCrop)
    }
  }, [effectiveAspect])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setOriginalFile(file)
      
      // Carrega a imagem para edição
      const imageDataUrl = await readFile(file)
      setImageSrc(imageDataUrl)
      // Reset state
      setRotation(0)
      setCrop(undefined)
      setCompletedCrop(undefined)
    }
  }

  const handleConfirm = async () => {
    if (!imageSrc || !imgRef.current || !completedCrop) return

    try {
      setLoading(true)
      setIsUploading(true)
      
      const blob = await getCroppedImageBlob(
        imgRef.current,
        completedCrop,
        rotation,
        circular
      )

      if (blob) {
         await uploadFile(blob);
      }
    } catch (e) {
      console.error(e)
      toast.error("Erro ao preparar imagem.");
    } finally {
      setLoading(false)
      setIsUploading(false)
    }
  }

  // Função para gerar o blob da imagem recortada
  async function getCroppedImageBlob(
    image: HTMLImageElement,
    crop: PixelCrop,
    rotation: number = 0,
    isCircular: boolean = false
  ): Promise<Blob | null> {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    const pixelCrop = {
      x: crop.x * scaleX,
      y: crop.y * scaleY,
      width: crop.width * scaleX,
      height: crop.height * scaleY,
    }

    // Se tiver rotação, precisamos de um canvas temporário
    if (rotation !== 0) {
      const rotRad = (rotation * Math.PI) / 180
      
      // Calcular tamanho do canvas rotacionado
      const sin = Math.abs(Math.sin(rotRad))
      const cos = Math.abs(Math.cos(rotRad))
      const rotatedWidth = image.naturalWidth * cos + image.naturalHeight * sin
      const rotatedHeight = image.naturalWidth * sin + image.naturalHeight * cos
      
      // Canvas temporário para rotação
      const rotateCanvas = document.createElement('canvas')
      rotateCanvas.width = rotatedWidth
      rotateCanvas.height = rotatedHeight
      const rotateCtx = rotateCanvas.getContext('2d')
      if (!rotateCtx) return null
      
      rotateCtx.translate(rotatedWidth / 2, rotatedHeight / 2)
      rotateCtx.rotate(rotRad)
      rotateCtx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2)
      rotateCtx.drawImage(image, 0, 0)
      
      // Ajustar coordenadas do crop para o canvas rotacionado
      const offsetX = (rotatedWidth - image.naturalWidth) / 2
      const offsetY = (rotatedHeight - image.naturalHeight) / 2
      
      canvas.width = pixelCrop.width
      canvas.height = pixelCrop.height
      
      // Se circular, aplicar máscara
      if (isCircular) {
        ctx.beginPath()
        ctx.arc(
          pixelCrop.width / 2,
          pixelCrop.height / 2,
          Math.min(pixelCrop.width, pixelCrop.height) / 2,
          0,
          Math.PI * 2
        )
        ctx.closePath()
        ctx.clip()
      }
      
      ctx.drawImage(
        rotateCanvas,
        pixelCrop.x + offsetX,
        pixelCrop.y + offsetY,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      )
    } else {
      canvas.width = pixelCrop.width
      canvas.height = pixelCrop.height
      
      // Se circular, aplicar máscara
      if (isCircular) {
        ctx.beginPath()
        ctx.arc(
          pixelCrop.width / 2,
          pixelCrop.height / 2,
          Math.min(pixelCrop.width, pixelCrop.height) / 2,
          0,
          Math.PI * 2
        )
        ctx.closePath()
        ctx.clip()
      }
      
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      )
    }

    return new Promise((resolve) => {
      // Converte para WebP com qualidade 0.9 (90%) para reduzir tamanho
      // Fallback para PNG se WebP não for suportado
      const format = supportsWebP ? 'image/webp' : 'image/png'
      const quality = supportsWebP ? 0.9 : 1
      canvas.toBlob((blob) => resolve(blob), format, quality)
    })
  }

  const uploadFile = async (fileOrBlob: Blob | File) => {
    const formData = new FormData();
    const extension = supportsWebP ? '.webp' : '.png'
    const fileName = fileOrBlob instanceof File ? fileOrBlob.name.replace(/\.[^.]+$/, extension) : `upload${extension}`;
    formData.append('file', fileOrBlob, fileName);

    setIsUploading(true);
    try {
      const response = await fetch(`${apiBase}/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        // Exibir mensagem de erro específica da API
        const errorMessage = data.error || 'Falha no upload';
        toast.error(errorMessage);
        return;
      }

      if (data.success) {
        console.log('Upload realizado:', data);
        toast.success('Arquivo enviado com sucesso!');
        if (onSuccess) onSuccess();
        // Also emit event for global listeners
        window.dispatchEvent(new CustomEvent('fileUploaded'));
        
        // Reset state 
        setImageSrc(null);
        setOriginalFile(null);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error(data.error || 'Erro desconhecido no upload');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao enviar arquivo.');
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
      setImageSrc(null);
      setOriginalFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
  }

  return (
    <div className="flex flex-col gap-6 py-4 system-editor">
      {!imageSrc ? (
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 bg-muted/5 hover:bg-muted/10 transition-colors relative">
            <div className="p-4 rounded-full bg-primary/10 text-primary">
              <CropIcon className="w-8 h-8" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-white">
                Clique para selecionar e recortar
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG, GIF até 10MB</p>
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="flex items-center gap-2 text-white">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Enviando...</span>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              title="Selecionar imagem"
              disabled={isUploading}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-center rounded-md overflow-auto bg-black/20 border border-border p-4 max-h-[450px]">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={effectiveAspect}
              circularCrop={circular}
              className="max-w-full"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Imagem para recortar"
                onLoad={onImageLoad}
                style={{
                  maxHeight: '400px',
                  transform: `rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease',
                }}
              />
            </ReactCrop>
          </div>

          <div className="space-y-4 px-2">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                 <label className="text-sm font-medium flex items-center gap-2 text-white">
                   <RotateCw className="w-4 h-4" /> Rotação
                 </label>
                 <span className="text-xs text-muted-foreground">{rotation}°</span>
              </div>
               <input
                type="range"
                value={rotation}
                min={0}
                max={360}
                step={1}
                aria-label="Rotação"
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              {circular 
                ? "Arraste para posicionar o recorte circular"
                : effectiveAspect 
                  ? "Arraste para posicionar. Proporção fixa."
                  : "Arraste os cantos ou bordas da seleção para ajustar a área de recorte"
              }
            </p>
          </div>
          
           <div className="flex justify-between items-center pt-4 border-t border-border">
              <Button variant="ghost" size="sm" onClick={clearImage} className="text-white hover:text-white/80">
                <X className="w-4 h-4 mr-2" />
                Escolher outra
              </Button>
              <div className="flex gap-2">
                 {onCancel && (
                    <Button variant="secondary" onClick={onCancel} disabled={loading || isUploading}>
                        Cancelar
                    </Button>
                 )}
                 {!onCancel && (
                    <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">
                        Cancelar
                    </button>
                 )}
                 <Button onClick={handleConfirm} disabled={loading || isUploading}>
                    {isUploading ? "Enviando..." : "Confirmar e Enviar"}
                 </Button>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(reader.result as string), false)
    reader.readAsDataURL(file)
  })
}
