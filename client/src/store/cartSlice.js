import { createSlice } from '@reduxjs/toolkit'

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: {
    addToCart(state, { payload: item }) {
      const existing = state.items.find(
        (i) => i._id === item._id && i.size === item.size
      )
      if (existing) {
        existing.qty += item.qty ?? 1
      } else {
        state.items.push({ ...item, qty: item.qty ?? 1 })
      }
    },
    removeFromCart(state, { payload: { _id, size } }) {
      state.items = state.items.filter(
        (i) => !(i._id === _id && i.size === size)
      )
    },
    clearCart(state) {
      state.items = []
    },
    updateQty(state, { payload: { _id, size, qty } }) {
      if (qty <= 0) {
        state.items = state.items.filter(
          (i) => !(i._id === _id && i.size === size)
        )
      } else {
        const item = state.items.find(
          (i) => i._id === _id && i.size === size
        )
        if (item) item.qty = qty
      }
    },
  },
})

export const { addToCart, removeFromCart, clearCart, updateQty } = cartSlice.actions
export default cartSlice.reducer
