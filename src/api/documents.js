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

// GET /documents?entityId=<driverId> — fetch all doc records for a driver
// Tries multiple path shapes to handle API variation
export async function getDocuments(entityId) {
  const paths = [
    `/documents?entityId=${encodeURIComponent(entityId)}`,
    `/documents/entity/${encodeURIComponent(entityId)}`,
    `/documents/${encodeURIComponent(entityId)}`,
  ]

  let lastError
  for (const path of paths) {
    try {
      const data = await request(path)
      if (data !== null && data !== undefined) return data
    } catch (err) {
      lastError = err
      console.warn('getDocuments failed:', path, err.message)
    }
  }

  throw lastError
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
