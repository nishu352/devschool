const rawApiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

export const API_BASE_URL = rawApiBase.replace(/\/api\/?$/, '')
