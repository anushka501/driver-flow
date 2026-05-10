import { request } from './config'

function toE164(phone) {
  const digits = phone.replace(/[\s\-().]/g, '')
  if (digits.startsWith('+')) return digits
  if (digits.length === 10) return `+91${digits}`
  if (digits.startsWith('91') && digits.length === 12) return `+${digits}`
  return `+${digits}`
}

export function createUser(data) {
  return request('/users', {
    method: 'POST',
    body: {                          // ← plain object, NOT JSON.stringify
      givenName:  (data.firstName || '').trim(),
      familyName: (data.lastName  || '').trim(),
      gender:     data.gender || 'NA',
      phone:      toE164(data.phone || ''),
      profile:    'DRIVER',
      autoVerify: data.autoVerify ?? true,
    },
    
  }).then(result => {
    console.log('POST /users response:', JSON.stringify(result, null, 2))
    return result
  })
}