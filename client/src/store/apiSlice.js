import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// In development, Vite proxy forwards /api → localhost:5000
// In production, use the full Render backend URL via env variable
const baseUrl = import.meta.env.VITE_API_URL || '/api'

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token
      if (token) headers.set('authorization', 'Bearer ' + token)
      return headers
    },
  }),
  endpoints: () => ({}),
})

export default apiSlice
