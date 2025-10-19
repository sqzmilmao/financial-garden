const DEFAULT_API_BASE_URL = 'https://zaman-0c8v.onrender.com'

const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL
const normalizedBaseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`

export const API_BASE_URL = normalizedBaseUrl

export const buildApiUrl = (path: string) => {
  if (typeof path !== 'string' || path.length === 0) {
    return API_BASE_URL
  }

  // Allow already absolute URLs to pass through unchanged.
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  return new URL(path, API_BASE_URL).toString()
}

export const apiFetch = (path: string, init?: RequestInit) => fetch(buildApiUrl(path), init)

