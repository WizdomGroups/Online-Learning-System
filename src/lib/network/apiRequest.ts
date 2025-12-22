// apiRequest.ts
import axiosClient from "./axiosClient";

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface APIRequestOptions {
  method?: Method;
  url: string;
  params?: object;
  data?: object;
  headers?: Record<string, string>;
  responseType?:
    | "arraybuffer"
    | "blob"
    | "document"
    | "json"
    | "text"
    | "stream";
}

export const apiRequest = async <T = any>({
  method = "GET",
  url,
  params,
  data,
  headers = {},
  responseType,
}: APIRequestOptions): Promise<T> => {
  const response = await axiosClient.request<T>({
    method,
    url,
    params,
    data,
    headers,
    responseType,
  });
  return response.data;
};
