export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous') // needed to avoid CORS issues on CodeSandbox
    image.src = url
  })

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation)

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  }
}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0,
  flip = { horizontal: false, vertical: false },
  outputWidth?: number,
  outputHeight?: number,
  fileType: string = 'image/jpeg' 
): Promise<string> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return ''
  }

  const rotRad = getRadianAngle(rotation)

  // calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  )

  // set canvas size to match the bounding box
  canvas.width = bBoxWidth
  canvas.height = bBoxHeight

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
  ctx.rotate(rotRad)
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
  ctx.translate(-image.width / 2, -image.height / 2)

  // draw rotated image
  ctx.drawImage(image, 0, 0)

  // croppedAreaPixels values are bounding box relative
  // extract the cropped image using these values
  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  )

  // set canvas size to final desired crop size - this will clear existing context
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  // paste generated rotate image at the top left corner
  ctx.putImageData(data, 0, 0)

  // Resize if output dimensions are provided
  if (outputWidth && outputHeight && (outputWidth !== pixelCrop.width || outputHeight !== pixelCrop.height)) {
     const resizeCanvas = document.createElement('canvas');
     resizeCanvas.width = outputWidth;
     resizeCanvas.height = outputHeight;
     const resizeCtx = resizeCanvas.getContext('2d');
     if (!resizeCtx) return '';
     
     // Use better quality for resizing if possible (browser dependent)
     resizeCtx.imageSmoothingEnabled = true;
     resizeCtx.imageSmoothingQuality = 'high';
     
     resizeCtx.drawImage(canvas, 0, 0, pixelCrop.width, pixelCrop.height, 0, 0, outputWidth, outputHeight);
     
     return resizeCanvas.toDataURL(fileType)
  }

  // As Base64 string
  return canvas.toDataURL(fileType)
}

export async function getCroppedImgBlob(
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number },
    rotation = 0,
    flip = { horizontal: false, vertical: false },
    outputWidth?: number,
    outputHeight?: number,
     fileType: string = 'image/jpeg' 
  ): Promise<Blob | null> {
    const base64 = await getCroppedImg(imageSrc, pixelCrop, rotation, flip, outputWidth, outputHeight, fileType);
    const res = await fetch(base64);
    return await res.blob();
  }

export async function getCroppedImgBlobFromImage(
  image: HTMLImageElement,
  crop: { x: number; y: number; width: number; height: number },
  options: {
    rotation?: number
    scale?: number
    outputWidth?: number
    outputHeight?: number
    fileType?: string
    circular?: boolean
  } = {}
): Promise<Blob | null> {
  const {
    rotation = 0,
    scale = 1,
    outputWidth,
    outputHeight,
    fileType = 'image/jpeg',
    circular = false,
  } = options

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return null
  }

  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height
  const cropX = crop.x * scaleX
  const cropY = crop.y * scaleY
  const cropWidth = crop.width * scaleX
  const cropHeight = crop.height * scaleY

  if (cropWidth <= 0 || cropHeight <= 0) {
    return null
  }

  canvas.width = Math.max(1, Math.floor(cropWidth))
  canvas.height = Math.max(1, Math.floor(cropHeight))
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  const rotRad = getRadianAngle(rotation)
  const centerX = image.naturalWidth / 2
  const centerY = image.naturalHeight / 2

  ctx.save()
  ctx.translate(-cropX, -cropY)
  ctx.translate(centerX, centerY)
  ctx.rotate(rotRad)
  ctx.scale(scale, scale)
  ctx.translate(-centerX, -centerY)
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight
  )
  ctx.restore()

  let outputCanvas = canvas

  if (
    outputWidth &&
    outputHeight &&
    (outputWidth !== canvas.width || outputHeight !== canvas.height)
  ) {
    const resizeCanvas = document.createElement('canvas')
    resizeCanvas.width = outputWidth
    resizeCanvas.height = outputHeight
    const resizeCtx = resizeCanvas.getContext('2d')
    if (!resizeCtx) {
      return null
    }

    resizeCtx.imageSmoothingEnabled = true
    resizeCtx.imageSmoothingQuality = 'high'
    resizeCtx.drawImage(
      canvas,
      0,
      0,
      canvas.width,
      canvas.height,
      0,
      0,
      outputWidth,
      outputHeight
    )

    outputCanvas = resizeCanvas
  }

  if (circular) {
    const maskCtx = outputCanvas.getContext('2d')
    if (!maskCtx) {
      return null
    }
    maskCtx.save()
    maskCtx.globalCompositeOperation = 'destination-in'
    maskCtx.beginPath()
    maskCtx.arc(
      outputCanvas.width / 2,
      outputCanvas.height / 2,
      Math.min(outputCanvas.width, outputCanvas.height) / 2,
      0,
      Math.PI * 2
    )
    maskCtx.closePath()
    maskCtx.fill()
    maskCtx.restore()
  }

  return new Promise((resolve) => {
    outputCanvas.toBlob((blob) => resolve(blob), fileType, 1)
  })
}
