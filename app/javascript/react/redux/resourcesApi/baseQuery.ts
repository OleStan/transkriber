import ReactOnRails from 'react-on-rails';
import { fetchBaseQuery, FetchArgs, BaseQueryFn } from '@reduxjs/toolkit/query/react';

const token = ReactOnRails.authenticityToken();

// Custom base query function
export const baseQuery: BaseQueryFn<string | FetchArgs, unknown, unknown> = async (
  args,
  api,
  extraOptions
) => {
  const baseUrl = 'http://localhost:3000/ajax/';
  let adjustedArgs = args;

  if (typeof args === 'string') {
    adjustedArgs = { url: args, method: 'GET' };
  }

  if (token && (adjustedArgs as FetchArgs).method !== 'GET') {
    adjustedArgs = {
      ...(adjustedArgs as FetchArgs),
      headers: {
        ...((adjustedArgs as FetchArgs).headers || {}),
        'X-CSRF-Token': token,
      },
    };
  }

  return fetchBaseQuery({ baseUrl })(adjustedArgs, api, extraOptions);
};
