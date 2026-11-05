import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type Prices = Record<string, number>;

const initialState: Prices = {};

export const pricesSlice = createSlice({
  name: 'stock',
  initialState,
  reducers: {
    snapshotReceived: (_state, action: PayloadAction<Prices>) => {
      return action.payload;
    },
    ticksReceived: (state, action: PayloadAction<Prices>) => ({ ...state, ...action.payload }),
  },
});

export const { snapshotReceived, ticksReceived } = pricesSlice.actions;

const pricesReducer = pricesSlice.reducer;
export default pricesReducer;
