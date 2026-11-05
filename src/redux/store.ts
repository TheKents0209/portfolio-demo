import { configureStore } from '@reduxjs/toolkit';
import pricesReducer from './slices/stockSlice';

export const store = configureStore({
  reducer: { pricesReducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
