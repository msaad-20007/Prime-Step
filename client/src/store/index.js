import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import cartReducer from './cartSlice'
import { apiSlice } from './apiSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
})

export default store

/**
 * @typedef {ReturnType<typeof store.getState>} RootState
 * @typedef {typeof store.dispatch} AppDispatch
 */
