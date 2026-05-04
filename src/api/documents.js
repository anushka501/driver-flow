import { request } from './config'

function withoutEmptyValues(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== '' && value !== undefined && value !== null),
  )
}

export function createDocument({ entityId, type, file, status = 'PENDING_VERIFICATION', reviewedBy = 'admin' }) {
  const fileName = file?.name || ''
  const extension = fileName.includes('.')
    ? fileName.split('.').pop()
    : ''

  return request('/documents', {
    method: 'POST',
    body: JSON.stringify({
      entityId,
      extension,
      type,
      status,
      meta: withoutEmptyValues({
        filename: fileName,
        label: type,
        date: new Date().toISOString(),
      }),
      reviewMeta: withoutEmptyValues({
        reviewedBy,
      }),
    }),
  })
}

export async function uploadDocumentFile(preSignedUrl, file) {
  const res = await fetch(preSignedUrl, {
    method: 'PUT',
    body: file,
    headers: file?.type ? { 'Content-Type': file.type } : undefined,
  })

  if (!res.ok) {
    throw new Error(`Upload failed with status ${res.status}`)
  }
}

export async function createAndUploadDocument({ entityId, type, file, reviewedBy = 'admin' }) {
  const result = await createDocument({ entityId, type, file, reviewedBy })

  if (!result?.documentId || !result?.preSignedUrl) {
    throw new Error('Document API did not return documentId and preSignedUrl.')
  }

  await uploadDocumentFile(result.preSignedUrl, file)

  return result
}

export function reviewDocument(docId, status, reviewedBy = 'admin', reason = '') {
  return request(`/documents/review/${docId}`, {
    method: 'POST',
    body: JSON.stringify(withoutEmptyValues({
      status,
      reviewedBy,
      reason,
    })),
  })
}
