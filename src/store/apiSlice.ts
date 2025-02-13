import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_BASE_URL;
console.log("BASE_URL", BASE_URL);

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (builder) => ({

    getPosts: builder.query<any, void>({
      query: () => ({
          url: "/posts",
          method: 'GET',
      }),
  }),

  }),
});

export const { useGetPostsQuery } = apiSlice;
