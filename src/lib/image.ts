import imageCompression from 'browser-image-compression'

export async function resizeImage(file: File): Promise<string> {
  const compressed = await imageCompression(file, {
    maxWidthOrHeight: 1280,
    initialQuality: 0.7,
    useWebWorker: true,
  })
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(compressed)
  })
}
