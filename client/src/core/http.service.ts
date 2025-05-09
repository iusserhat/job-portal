import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from "axios";

import { HttpMethod } from "@/enums";
import { IService } from "@/interfaces";
import StorageService from "./storage.service";

/**
 * HTTP service for making API requests.
 */
export default class HttpService {
  private http: AxiosInstance;
  private baseURL: string = import.meta.env.VITE_API_URL as string;

  constructor() {
    this.http = axios.create({
      baseURL: this.baseURL,
      withCredentials: false,
      headers: this.setupHeaders(),
    });
  }

  // Get authorization token from cookies
  private get getAuthorization() {
    const accessToken = StorageService.getItem("access_token") || "";
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  }

  /**
   * Returns a basic service object that works with localStorage for mock data.
   * In a real application, this would be an actual HTTP client like Axios.
   */
  public service() {
    // Gerçek HTTP istekleri için Axios kullan
    return {
      get: <T>(url: string, config: any = {}) => {
        console.log(`Gerçek GET isteği: ${this.baseURL}/${url}`, config);
        return this.http.get<T>(`${url}`, config).then(response => response.data);
      },
      post: <T, U>(url: string, data: U, config: any = {}) => {
        console.log(`Gerçek POST isteği: ${this.baseURL}/${url}`, data);
        return this.http.post<T>(`${url}`, data, config).then(response => response.data);
      },
      put: <T, U>(url: string, data: U, config: any = {}) => {
        console.log(`Gerçek PUT isteği: ${this.baseURL}/${url}`, data);
        return this.http.put<T>(`${url}`, data, config).then(response => response.data);
      },
      delete: <T>(url: string, config: any = {}) => {
        console.log(`Gerçek DELETE isteği: ${this.baseURL}/${url}`, config);
        return this.http.delete<T>(`${url}`, config).then(response => response.data);
      }
    };
  }

  // Setup headers
  private setupHeaders(hasAttachment = false) {
    return {
      "Content-Type": hasAttachment
        ? "multipart/form-data"
        : "application/json",
      ...this.getAuthorization,
    };
  }

  // Handle HTTP requests
  private async request<T>(
    method: HttpMethod,
    url: string,
    options: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.http.request<T>({
        method,
        url,
        ...options,
      });

      return response.data;
    } catch (error) {
      return this.normalizeError(error);
    }
  }

  // Perform GET request
  public async get<T>(
    url: string,
    params?: IService.IParams,
    hasAttachment = false
  ): Promise<T> {
    return this.request<T>(HttpMethod.GET, url, {
      params,
      headers: this.setupHeaders(hasAttachment),
      signal: params?.signal,
    });
  }

  // Perform POST request
  public async post<T, P>(
    url: string,
    payload?: P,
    params?: IService.IParams,
    hasAttachment = false
  ): Promise<T> {
    return this.request<T>(HttpMethod.POST, url, {
      data: payload,
      params,
      headers: this.setupHeaders(hasAttachment),
      signal: params?.signal,
    });
  }

  // Perform PUT request
  public async put<T, P>(
    url: string,
    payload: P,
    params?: IService.IParams,
    hasAttachment = false
  ): Promise<T> {
    return this.request<T>(HttpMethod.PUT, url, {
      data: payload,
      params,
      headers: this.setupHeaders(hasAttachment),
      signal: params?.signal,
    });
  }

  // Perform DELETE request
  public async delete<T>(
    url: string,
    params?: IService.IParams,
    hasAttachment = false
  ): Promise<T> {
    return this.request<T>(HttpMethod.DELETE, url, {
      params,
      headers: this.setupHeaders(hasAttachment),
      signal: params?.signal,
    });
  }

  // Inject request interceptors for request and response
  private injectRequestInterceptor() {
    // Request interceptor
    this.http.interceptors.request.use(
      (config) => {
        // Perform an action before sending the request
        // TODO: implement an NProgress loader
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.http.interceptors.response.use(
      (response) => {
        // Do something with response data
        return response;
      },
      (error) => {
        // Implement a global error handler
        return Promise.reject(error);
      }
    );
  }

  // Normalize errors
  private normalizeError(error: any) {
    // Implement a global error handler
    return Promise.reject(error);
  }
}
