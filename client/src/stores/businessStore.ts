import { create } from 'zustand';
import api from '../utils/api';

export interface Business {
  id: number;
  name: string;
  slogan: string;
  logo_url: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  created_at: string;
  updated_at: string;
}

interface BusinessData {
  name: string;
  slogan?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
}

interface BusinessState {
  business: Business | null;
  publicBusiness: Business | null;
  isLoading: boolean;
  error: string | null;
  fetchBusiness: () => Promise<void>;
  updateBusiness: (data: BusinessData | FormData) => Promise<void>;
  fetchPublicBusiness: () => Promise<Business | null>;
  loadCachedPublicBusiness: () => Business | null;
}

const CACHE_KEY = 'menuchat_public_business';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Helper function to load cached data
const loadCachedData = () => {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid (within 5 minutes)
    if (now - timestamp < CACHE_DURATION) {
      return data;
    }
    
    // Cache expired, remove it
    sessionStorage.removeItem(CACHE_KEY);
    return null;
  } catch (error) {
    console.warn('Failed to load cached business data:', error);
    sessionStorage.removeItem(CACHE_KEY);
    return null;
  }
};

export const useBusinessStore = create<BusinessState>((set, get) => ({
  business: null,
  publicBusiness: loadCachedData(), // Initialize with cached data if available
  isLoading: false,
  error: null,

  fetchBusiness: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/api/businesses/current');
      if (response.status === 200) {
        set({
          business: response.data,
          isLoading: false,
        });
        return;
      }
      throw new Error('Error al obtener configuración del negocio');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al obtener configuración del negocio';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateBusiness: async (data: BusinessData | FormData) => {
    set({ isLoading: true, error: null });
    try {
      const currentBusiness = get().business;
      if (!currentBusiness) {
        throw new Error('No business found');
      }

      const headers = data instanceof FormData 
        ? { "Content-Type": "multipart/form-data" }
        : {};

      const response = await api.put(`/api/businesses/${currentBusiness.id}`, data, { headers });
      if (response.status === 200) {
        const businessData = response.data;
        
        // Update store state
        set({
          business: businessData,
          publicBusiness: businessData, // Update public business too
          isLoading: false,
        });
        
        // Update sessionStorage cache
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({
            data: businessData,
            timestamp: Date.now()
          }));
        } catch (error) {
          console.warn('Failed to cache business data in sessionStorage:', error);
        }
        return;
      }
      throw new Error('Error al actualizar configuración del negocio');
    } catch (error: any) {
      const message = error.response?.data?.errors?.join(', ') || 
                     error.response?.data?.message || 
                     'Error al actualizar configuración del negocio';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  fetchPublicBusiness: async () => {
    try {
      // Check if we have cached data first
      const cachedBusiness = get().loadCachedPublicBusiness();
      if (cachedBusiness) {
        set({ publicBusiness: cachedBusiness });
        return cachedBusiness;
      }

      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/public/business`);
      if (!response.ok) {
        throw new Error('Error al obtener información del negocio');
      }
      const data = await response.json();
      const businessData = data.business;
      
      // Update the store with the fetched public business data
      set({ publicBusiness: businessData });
      
      // Cache the data in sessionStorage
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          data: businessData,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.warn('Failed to cache business data in sessionStorage:', error);
      }
      
      return businessData;
    } catch (error) {
      console.error('Error fetching public business:', error);
      return null;
    }
  },

  loadCachedPublicBusiness: () => {
    return loadCachedData();
  },
}));