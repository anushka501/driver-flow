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
    body:({
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
    body: (({
      status,
      reviewedBy,
      reason,
    })),
  })
}

// GET /documents?entityId=<driverId> — fetch all doc records for a driver
// Tries multiple path shapes to handle API variation
export async function getDocuments(entityId) {
  return request(`/documents?entityId=${encodeURIComponent(entityId)}`)
}

// Normalize any shape the documents API returns into a { [TYPE]: docObject } map
export function normalizeDocuments(data) {
  let list = []

  if (Array.isArray(data)) {
    list = data
  } else if (data && typeof data === 'object') {
    const key = ['documents', 'items', 'Items', 'results', 'data', 'content']
      .find(k => Array.isArray(data[k]))
    if (key) {
      list = data[key]
    } else {
      // Already a { TYPE: docObj } map — return as-is
      return data
    }
  }

  // Convert array to map keyed by type
  const map = {}
  list.forEach(doc => {
    const type = doc?.type || doc?.documentType || ''
    if (type) map[type] = doc
  })
  return map
}
