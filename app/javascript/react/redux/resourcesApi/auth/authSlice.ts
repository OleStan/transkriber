import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { toCamelCase } from '../../../redux/utils';
import ReactOnRails from 'react-on-rails';

// Define types for auth requests and responses
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  password_confirmation: string;
  first_name: string;
  last_name: string;
  account_attributes?: {
    name: string;
  };
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  account_id: number;
  provider?: string;
  uid?: string;
  avatar?: string;
}

export interface AuthResponse {
  status: number;
  message: string;
  user?: User;
}

// Create a custom auth baseQuery that handles CSRF tokens
const authBaseQuery = fetchBaseQuery({
  baseUrl: '/',
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('CSRF-TOKEN='))
      ?.split('=')[1];
    
    if (token) {
      headers.set('X-CSRF-Token', token);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  }
});

// Create the auth API slice
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: authBaseQuery,
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'api/session',
        method: 'POST',
        body: { user: credentials }
      }),
      transformResponse: (response: AuthResponse) => toCamelCase(response),
      invalidatesTags: ['Auth']
    }),
    
    logout: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: 'api/session',
        method: 'DELETE'
      }),
      transformResponse: (response: AuthResponse) => toCamelCase(response),
      invalidatesTags: ['Auth']
    }),
    
    signup: builder.mutation<AuthResponse, SignupRequest>({
      query: (userData) => ({
        url: 'users',
        method: 'POST',
        body: { user: userData }
      }),
      transformResponse: (response: AuthResponse) => toCamelCase(response),
      invalidatesTags: ['Auth']
    }),
    
    getCurrentUser: builder.query<AuthResponse, void>({
      query: () => 'api/session',
      transformResponse: (response: AuthResponse) => toCamelCase(response),
      providesTags: ['Auth']
    }),

    updateProfile: builder.mutation<{ first_name: string; last_name: string }, { first_name: string; last_name: string }>({
      query: (body) => ({
        url: 'ajax/user/update_profile',
        method: 'PATCH',
        body,
      }),
      transformResponse: (r: { first_name: string; last_name: string }) => toCamelCase(r),
      invalidatesTags: ['Auth'],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useLoginMutation,
  useLogoutMutation,
  useSignupMutation,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
} = authApi;
