import { apiSlice } from './apiSlice'

const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendOtp: builder.mutation({
      query: (body) => ({ url: '/auth/send-otp', method: 'POST', body }),
    }),
    verifyOtp: builder.mutation({
      query: (body) => ({ url: '/auth/verify-otp', method: 'POST', body }),
    }),
    login: builder.mutation({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    getMe: builder.query({
      query: () => '/auth/me',
    }),
  }),
})

export const {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useLoginMutation,
  useGetMeQuery,
} = authApi
