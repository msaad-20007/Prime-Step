import { apiSlice } from './apiSlice'

const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: () => '/users',
    }),
    deleteUser: builder.mutation({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
    }),
  }),
})

export const { useGetAllUsersQuery, useDeleteUserMutation } = usersApi
