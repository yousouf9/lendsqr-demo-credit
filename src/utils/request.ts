import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

interface AxiosResult<T = any> {
  response?: AxiosResponse<T>;
  error?: {
    message: string;
    status?: number;
    data?: any;
  };
}

async function handleRequest<T>(
  promise: Promise<AxiosResponse<T>>
): Promise<AxiosResult<T>> {
  try {
    const response = await promise;
    return { response };
  } catch (err: any) {
    return {
      error: {
        message: err?.message || "An unknown error occurred",
        status: err?.response?.status,
        data: err?.response?.data,
      },
    };
  }
}

export const httpClient = {
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return handleRequest<T>(axios.post(url, data, config));
  },
  get<T = any>(url: string, config?: AxiosRequestConfig) {
    return handleRequest<T>(axios.get(url, config));
  },
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return handleRequest<T>(axios.put(url, data, config));
  },
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return handleRequest<T>(axios.patch(url, data, config));
  },
  delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return handleRequest<T>(axios.delete(url, config));
  },
};
