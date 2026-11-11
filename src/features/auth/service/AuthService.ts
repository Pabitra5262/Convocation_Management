import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react";
import type { AxiosRequestConfig, AxiosError } from "axios";
import apiClient from "@/services/api/apiClient";
import { endpoints } from "@/services/api/endpoints";
import type { LoginRequest, LoginResponse, CaptchaResponse } from "../types";

const axiosBaseQuery =
    (): BaseQueryFn<
        {
            url: string;
            method: AxiosRequestConfig["method"];
            data?: AxiosRequestConfig["data"];
            params?: AxiosRequestConfig["params"];
        },
        unknown,
        unknown
    > =>
        async ({ url, method, data, params }) => {
            try {
                const result = await apiClient.request({
                    url,
                    method,
                    data,
                    params,
                });
                return { data: result.data };
            } catch (axiosError) {
                const err = axiosError as AxiosError;
                return {
                    error: {
                        status: err.response?.status,
                        data: err.response?.data || err.message,
                    },
                };
            }
        };

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: axiosBaseQuery(),
    tagTypes: ["User", "Menu"],
    endpoints: (builder) => ({
        getCaptcha: builder.query<CaptchaResponse, void>({
            query: () => ({ url: endpoints.authtype.getCaptcha, method: "GET" }),
        }),
        login: builder.mutation<LoginResponse, LoginRequest | string>({
            query: (credentials) => ({
                url: endpoints.authtype.login,
                method: "POST",
                data: credentials,
            }),
            invalidatesTags: ["User", "Menu"],
        }),
        logout: builder.mutation<any, void>({
            query: () => ({
                url: endpoints.authtype.logout,
                method: "POST",
            }),
        }),
        getUserProfile: builder.query<any, void>({
            query: () => ({ url: endpoints.authtype.userProfile, method: "GET" }),
            providesTags: ["User"],
            keepUnusedDataFor: 300,
        }),
        getMenuList: builder.query<any, void>({
            query: () => ({ url: endpoints.authtype.getMenuList, method: "GET" }),
            providesTags: ["Menu"],
            keepUnusedDataFor: 300,
        }),
    }),
});

export const {
    useGetCaptchaQuery,
    useLoginMutation,
    useLogoutMutation,
    useGetUserProfileQuery,
    useGetMenuListQuery,
} = authApi;
