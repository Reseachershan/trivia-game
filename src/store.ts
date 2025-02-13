import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./store/apiSlice";
import counterReducer from "./store/counterSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
});
