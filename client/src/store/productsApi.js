import { apiSlice } from './apiSlice'

const productsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ page, limit } = {}) => ({
        url: '/products',
        params: { page, limit },
      }),
    }),
    getProductById: builder.query({
      query: (id) => `/products/${id}`,
    }),
    createProduct: builder.mutation({
      query: (body) => ({ url: '/products', method: 'POST', body }),
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/products/${id}`, method: 'PUT', body }),
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi
