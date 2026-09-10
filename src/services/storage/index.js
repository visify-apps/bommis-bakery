import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import {
  appConfig,
  isFirebaseConfigured,
  isFirebaseStorageEnabled,
} from '../../config/appConfig'
import { getFirebaseStorage } from '../firebase'
import {
  ALLOWED_REFERENCE_TYPES,
  MAX_REFERENCE_IMAGE_BYTES,
} from '../../data/enquiryOptions'

/**
 * Upload reference image when Storage is enabled.
 * Otherwise keep metadata only — customer can send the photo on WhatsApp (free).
 *
 * @param {File} file
 * @param {{ businessId?: string, enquiryId: string }} meta
 */
export async function uploadEnquiryReferenceImage(file, meta) {
  if (!file) return null

  if (!ALLOWED_REFERENCE_TYPES.includes(file.type)) {
    throw new Error('Reference image must be JPG, PNG, or WebP.')
  }
  if (file.size > MAX_REFERENCE_IMAGE_BYTES) {
    throw new Error('Reference image must be 5 MB or smaller.')
  }

  // Free path: no Firebase Storage — note the file so WhatsApp can follow up
  if (!isFirebaseStorageEnabled()) {
    return {
      referenceImageUrl: null,
      referenceImagePath: null,
      referenceFileName: file.name,
      referenceDeferredToWhatsApp: true,
      demo: !isFirebaseConfigured(),
    }
  }

  const businessId = meta.businessId || appConfig.defaultBusinessId
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80)
  const path = `businesses/${businessId}/enquiries/${meta.enquiryId}/reference/${Date.now()}_${safeName}`
  const storageRef = ref(getFirebaseStorage(), path)
  await uploadBytes(storageRef, file, { contentType: file.type })
  const url = await getDownloadURL(storageRef)

  return {
    referenceImageUrl: url,
    referenceImagePath: path,
    referenceFileName: file.name,
    referenceDeferredToWhatsApp: false,
    demo: false,
  }
}
