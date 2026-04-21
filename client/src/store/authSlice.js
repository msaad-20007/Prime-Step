import { createSlice } from '@reduxjs/toolkit'

// Rehydrate both token AND user from localStorage on page load
const storedToken = localStorage.getItem('token')
const storedUser = (() => {
  try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
})()

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser ?? null,
    token: storedToken ?? null,
  },
  reducers: {
    setCredentials(state, { payload: { user, token } }) {
      state.user = user
      state.token = token
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    },
    logout(state) {
      state.user = null
      state.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
