import { configureStore } from '@reduxjs/toolkit';
import { transcriptionsSlice } from '../redux/resourcesApi/transcriptions/transcriptionsSlice';
import { authApi } from '../redux/resourcesApi/auth/authSlice';

export const store = configureStore({
  reducer: {
    // other reducers can go here
    [transcriptionsSlice.reducerPath]: transcriptionsSlice.reducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      transcriptionsSlice.middleware,
      authApi.middleware
    ),
});

// Don't forget to export the store's type if you're using TypeScript
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
