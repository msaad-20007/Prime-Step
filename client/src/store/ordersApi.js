import { apiSlice } from './apiSlice'

const ordersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
    }),
    getMyOrders: builder.query({
      query: () => '/orders/mine',
    }),
    getAllOrders: builder.query({
      query: () => '/orders',
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/orders/${id}`, method: 'PUT', body }),
    }),
    deleteOrder: builder.mutation({
      query: (id) => ({ url: `/orders/${id}`, method: 'DELETE' }),
    }),
  }),
})

export const {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
} = ordersApi
