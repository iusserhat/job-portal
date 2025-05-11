import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from "axios";

import { HttpMethod } from "@/enums";
import { IService } from "@/interfaces";
import StorageService from "./storage.service";

/**
 * HTTP service for making API requests.
 */
export default class HttpService {
  private http: AxiosInstance;
  // Backend URL'ini doğrudan tanımlayalım, Netlify'da çevresel değişken olarak ayarlanmış olacak
  private baseURL: string = import.meta.env.VITE_API_URL as string || "https://job-portal-gfus.onrender.com";

  constructor() {
    // API URL'in sonunda / varsa kaldıralım
    if (this.baseURL.endsWith('/')) {
      this.baseURL = this.baseURL.slice(0, -1);
    }
    
    console.log("API URL kullanılıyor:", this.baseURL);
    
    this.http = axios.create({
      baseURL: this.baseURL,
      withCredentials: false, // CORS sorunları için false olarak ayarlandı
      headers: this.setupHeaders(),
    });

    // Response ve request interceptors ekle
    this.injectRequestInterceptor();
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
        // URL'nin başında / varsa kaldır
        const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
        console.log(`Gerçek GET isteği: ${this.baseURL}/${cleanUrl}`, config);
        return this.http.get<T>(cleanUrl, config)
          .then(response => {
            console.log(`GET ${cleanUrl} yanıtı:`, response.status, response.statusText);
            return response.data;
          })
          .catch(error => {
            console.error(`GET ${cleanUrl} hatası:`, error.response || error.message);
            throw error;
          });
      },
      post: <T, U>(url: string, data: U, config: any = {}) => {
        // URL'nin başında / varsa kaldır
        const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
        console.log(`Gerçek POST isteği: ${this.baseURL}/${cleanUrl}`, data);
        
        // Bu endpointe özel debug kontrolü
        if (url.includes("auth/login") || url.includes("api/v1/auth/login")) {
          console.log("AUTH LOGIN İSTEĞİ:", {
            url: `${this.baseURL}/${cleanUrl}`,
            data: data,
            headers: this.setupHeaders()
          });
        }
        
        // Aynısını register için de yapalım
        if (url.includes("auth/signup") || url.includes("api/v1/auth/signup")) {
          console.log("AUTH SIGNUP İSTEĞİ:", {
            url: `${this.baseURL}/${cleanUrl}`,
            data: data,
            headers: this.setupHeaders()
          });
        }
        
        return this.http.post<T>(cleanUrl, data, config)
          .then(response => {
            console.log(`POST ${cleanUrl} yanıtı:`, response.status, response.statusText);
            return response.data;
          })
          .catch(error => {
            console.error(`POST ${cleanUrl} hatası:`, {
              status: error.response?.status,
              statusText: error.response?.statusText,
              data: error.response?.data,
              message: error.message
            });
            throw error;
          });
      },
      put: <T, U>(url: string, data: U, config: any = {}) => {
        // URL'nin başında / varsa kaldır
        const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
        console.log(`Gerçek PUT isteği: ${this.baseURL}/${cleanUrl}`, data);
        return this.http.put<T>(cleanUrl, data, config)
          .then(response => {
            console.log(`PUT ${cleanUrl} yanıtı:`, response.status, response.statusText);
            return response.data;
          })
          .catch(error => {
            console.error(`PUT ${cleanUrl} hatası:`, error.response || error.message);
            throw error;
          });
      },
      delete: <T>(url: string, config: any = {}) => {
        // URL'nin başında / varsa kaldır
        const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
        console.log(`Gerçek DELETE isteği: ${this.baseURL}/${cleanUrl}`, config);
        return this.http.delete<T>(cleanUrl, config)
          .then(response => {
            console.log(`DELETE ${cleanUrl} yanıtı:`, response.status, response.statusText);
            return response.data;
          })
          .catch(error => {
            console.error(`DELETE ${cleanUrl} hatası:`, error.response || error.message);
            throw error;
          });
      }
    };
  }

  // Setup headers
  private setupHeaders(hasAttachment = false) {
    return {
      "Content-Type": hasAttachment
        ? "multipart/form-data"
        : "application/json",
      "Accept": "application/json",
      "Origin": window.location.origin,
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
        console.log("HTTP İstek gönderiliyor:", config.url, config.method, config.data);
        return config;
      },
      (error) => {
        console.error("HTTP İstek hatası:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.http.interceptors.response.use(
      (response) => {
        // Do something with response data
        console.log("HTTP Yanıt alındı:", response.status, response.statusText);
        return response;
      },
      (error) => {
        // Implement a global error handler
        console.error("HTTP Yanıt hatası:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
        return Promise.reject(error);
      }
    );
  }

  // Normalize errors
  private normalizeError(error: any) {
    // Implement a global error handler
    console.error("HTTP Hata normalize ediliyor:", error);
    return Promise.reject(error);
  }
}
