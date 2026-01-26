import React, { useState, useCallback, useRef } from 'react'
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop, convertToPixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Upload, X, ZoomIn, RotateCw } from 'lucide-react'
import { getCroppedImgBlobFromImage } from '@/lib/image-utils'

interface ImageUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (file: Blob) => void
  /**
   * Aspect ratio of the crop area (width / height). Default: 1
   */
  aspect?: number
  /**
   * If true, the crop area will be circular. Default: false
   */
  circular?: boolean
  /**
   * Fixed resolution for the output image. If provided, the image will be resized to these dimensions.
   */
  fixedResolution?: { width: number; height: number }
  /**
   * Title of the modal. Default: "Carregar Imagem"
   */
  title?: string
  /**
   * Description or helper text.
   */
  description?: string
}

export default function ImageUploadModal({
  isOpen,
  onClose,
  onConfirm,
  aspect = 1,
  circular = false,
  fixedResolution,
  title = "Carregar Imagem",
  description = "Ajuste a imagem conforme necessário."
}: ImageUploadModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [loading, setLoading] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Calculate the aspect ratio:
  // 1. If fixedResolution is provided, use its ratio (width / height).
  // 2. Otherwise, use the aspect prop (defaults to 1).
  const effectiveAspect = fixedResolution
    ? fixedResolution.width / fixedResolution.height
    : aspect

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget

    if (effectiveAspect) {
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
      setCompletedCrop(convertToPixelCrop(initialCrop, width, height))
    } else {
      const initialCrop: Crop = {
        unit: '%',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      }
      setCrop(initialCrop)
      setCompletedCrop(convertToPixelCrop(initialCrop, width, height))
    }
  }, [effectiveAspect])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const imageDataUrl = await readFile(file)
      setImageSrc(imageDataUrl)
      // Reset state
      setZoom(1)
      setRotation(0)
      setCrop(undefined)
      setCompletedCrop(undefined)
    }
  }

  const handleConfirm = async () => {
    if (!imageSrc || !imgRef.current || !completedCrop?.width || !completedCrop?.height) return

    try {
      setLoading(true)
      const blob = await getCroppedImgBlobFromImage(imgRef.current, completedCrop, {
        rotation,
        scale: zoom,
        outputWidth: fixedResolution?.width,
        outputHeight: fixedResolution?.height,
        fileType: "image/png",
        circular,
      })

      if (blob) {
        onConfirm(blob)
        handleClose()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setImageSrc(null) // Reset on close
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {!imageSrc ? (
            <div className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 bg-muted/5 hover:bg-muted/10 transition-colors">
               <div className="p-4 rounded-full bg-primary/10 text-primary">
                 <Upload className="w-8 h-8" />
               </div>
               <div className="text-center space-y-1">
                 <p className="text-sm font-medium">Clique para selecionar uma imagem</p>
                 <p className="text-xs text-muted-foreground">PNG, JPG, GIF até 10MB</p>
               </div>
               <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                title="Selecionar imagem"
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative w-full h-[400px] rounded-md overflow-hidden bg-black/5 border border-border flex items-center justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(nextCrop) => setCrop(nextCrop)}
                  onComplete={(nextCrop) => setCompletedCrop(nextCrop)}
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
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </ReactCrop>
              </div>

              <div className="space-y-4 px-2">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                     <label className="text-sm font-medium flex items-center gap-2">
                       <ZoomIn className="w-4 h-4" /> Zoom
                     </label>
                     <span className="text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-label="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                     <label className="text-sm font-medium flex items-center gap-2">
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
              </div>
              
               <div className="flex justify-start">
                  <Button variant="outline" size="sm" onClick={() => setImageSrc(null)}>
                    <X className="w-4 h-4 mr-2" />
                    Escolher outra imagem
                  </Button>
               </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-end gap-2">
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!imageSrc || loading}>
            {loading ? "Processando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(reader.result as string), false)
    reader.readAsDataURL(file)
  })
}
