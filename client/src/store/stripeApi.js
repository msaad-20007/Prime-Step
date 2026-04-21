import { apiSlice } from './apiSlice'

const stripeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPaymentIntent: builder.mutation({
      query: (body) => ({ url: '/stripe/create-payment-intent', method: 'POST', body }),
    }),
  }),
})

export const { useCreatePaymentIntentMutation } = stripeApi
