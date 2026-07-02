import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

/** Apaga todas as fotos de um carro no Cloudinary (pasta inteira, incluindo órfãs não rastreadas no banco). */
export async function deleteCarPhotosFolder(carId: string) {
  const folder = `vmf-autostore/${carId}`
  try {
    await cloudinary.api.delete_resources_by_prefix(folder)
  } catch {
    // segue mesmo se a pasta já estiver vazia/não existir
  }
  try {
    await cloudinary.api.delete_folder(folder)
  } catch {
    // idem
  }
}
