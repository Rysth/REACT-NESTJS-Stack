import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Toast } from 'toastify-react-native';
import type { User, SignUpForm, SignInForm } from '../types/auth';
import api, { saveToken, clearToken } from '../utils/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isLoadingUserInfo: boolean;
  error: string | null;
  register: (data: SignUpForm) => Promise<void>;
  login: (data: SignInForm) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
  fetchUserInfo: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string, passwordConfirm: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isLoadingUserInfo: false,
      error: null,

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/create-account', {
        email: data.email,
        password: data.password,
        "password-confirm": data.passwordConfirmation,
        fullname: data.fullName,
        username: data.username,
      });
      set({ user: null, isLoading: false });
      Toast.success('Cuenta creada exitosamente', 'top');
    } catch (error: any) {
      let errorMessage = 'Error al registrar la cuenta';

      if (error.response?.status === 422) {
        const responseText = error.response?.data || '';

        if (typeof responseText === 'string') {
          if (responseText.includes('Ya existe una cuenta con este correo electrónico')) {
            errorMessage = 'Ya existe una cuenta con este correo electrónico';
          } else if (responseText.includes('Este nombre de usuario ya está en uso')) {
            errorMessage = 'Este nombre de usuario ya está en uso';
          } else if (responseText.includes('Las contraseñas no coinciden')) {
            errorMessage = 'Las contraseñas no coinciden';
          } else if (responseText.includes('La contraseña debe tener al menos')) {
            errorMessage = 'La contraseña debe tener al menos 8 caracteres';
          }
        }
      } else if (error.response?.status >= 500) {
        errorMessage = 'Error del servidor. Intenta nuevamente en unos momentos';
      } else if (!error.response) {
        errorMessage = 'Sin conexión. Verifica tu conexión a internet';
      }

      set({ error: errorMessage, isLoading: false });
      Toast.error(errorMessage, 'top');
      throw new Error(errorMessage);
    }
  },

  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/login', {
        email: data.email,
        password: data.password,
      }, { withCredentials: true });

      await get().fetchUserInfo();
      set({ isLoading: false });
      Toast.success('Sesión iniciada correctamente', 'top');
    } catch (error: any) {
      let errorMessage = 'Error al iniciar sesión';

      if (error.response?.status === 401) {
        errorMessage = 'Credenciales incorrectas. Verifica que tu correo electrónico y contraseña sean correctos';
      } else if (error.response?.status === 403) {
        errorMessage = 'Tu cuenta no está verificada. Revisa tu correo electrónico y activa tu cuenta.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Error del servidor. Intenta nuevamente en unos momentos';
      } else if (!error.response) {
        errorMessage = 'Sin conexión. Verifica tu conexión a internet';
      }

      set({ error: errorMessage, isLoading: false });
      Toast.error(errorMessage, 'top');
      throw new Error(errorMessage);
    }
  },

  fetchUserInfo: async () => {
    set({ isLoadingUserInfo: true });
    try {
      const response = await api.get('/me', { withCredentials: true });
      set({ user: response.data.user, isLoadingUserInfo: false });
    } catch (error: any) {
      console.error('Failed to fetch user info:', error);
      set({ user: null, isLoadingUserInfo: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.post('/logout', {}, { withCredentials: true });
      await clearToken();
      set({ user: null, isLoading: false, error: null });
      Toast.success('Sesión cerrada correctamente', 'top');
    } catch (error: any) {
      console.error('Logout error:', error);
      // Even if logout fails on server, clear local state
      await clearToken();
      set({ user: null, isLoading: false, error: null });
      Toast.error('Error al cerrar sesión', 'top');
      throw error;
    }
  },

  clearSession: () => {
    set({ user: null, isLoading: false, error: null });
    clearToken();
  },

  resendConfirmation: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/verify-account-resend', { email }, { withCredentials: true });
      set({ isLoading: false });
      Toast.success('Correo de confirmación enviado', 'top');
    } catch (error: any) {
      let errorMessage = 'Error al enviar el correo de confirmación';

      if (error.response?.status === 401) {
        errorMessage = 'Esta cuenta ya está verificada o no existe.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Se ha enviado un correo recientemente. Por favor, espera antes de solicitar otro.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Error del servidor. Intenta nuevamente en unos momentos';
      } else if (!error.response) {
        errorMessage = 'Sin conexión. Verifica tu conexión a internet';
      }

      set({ error: errorMessage, isLoading: false });
      Toast.error(errorMessage, 'top');
      throw new Error(errorMessage);
    }
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/reset-password-request', { email }, { withCredentials: true });
      set({ isLoading: false });
      Toast.success('Si tu correo existe, recibirás instrucciones para restablecer tu contraseña', 'top');
    } catch (error: any) {
      let errorMessage = 'Error al solicitar restablecimiento de contraseña';

      if (error.response?.status >= 500) {
        errorMessage = 'Error del servidor. Intenta nuevamente en unos momentos';
      } else if (!error.response) {
        errorMessage = 'Sin conexión. Verifica tu conexión a internet';
      }

      set({ error: errorMessage, isLoading: false });
      Toast.error(errorMessage, 'top');
      throw new Error(errorMessage);
    }
  },

  resetPassword: async (token: string, password: string, passwordConfirm: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/reset-password', {
        key: token,
        password,
        'password-confirm': passwordConfirm,
      }, { withCredentials: true });
      set({ isLoading: false });
      Toast.success('Contraseña restablecida exitosamente', 'top');
    } catch (error: any) {
      let errorMessage = 'Error al restablecer la contraseña';

      if (error.response?.status === 401) {
        errorMessage = 'El enlace es inválido o ha expirado';
      } else if (error.response?.status === 422) {
        errorMessage = 'Las contraseñas no coinciden o no cumplen los requisitos';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Error del servidor. Intenta nuevamente en unos momentos';
      } else if (!error.response) {
        errorMessage = 'Sin conexión. Verifica tu conexión a internet';
      }

      set({ error: errorMessage, isLoading: false });
      Toast.error(errorMessage, 'top');
      throw new Error(errorMessage);
    }
  },

  verifyEmail: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/verify-account', { key: token }, { withCredentials: true });
      set({ isLoading: false });
      Toast.success('¡Correo verificado exitosamente!', 'top');
    } catch (error: any) {
      let errorMessage = 'Error al verificar el correo';

      if (error.response?.status === 401) {
        errorMessage = 'Ya haz verificado tu correo o el token es inválido';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Error del servidor. Intenta nuevamente en unos momentos';
      } else if (!error.response) {
        errorMessage = 'Sin conexión. Verifica tu conexión a internet';
      }

      set({ error: errorMessage, isLoading: false });
      Toast.error(errorMessage, 'top');
      throw new Error(errorMessage);
    }
  },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state: AuthState) => ({
        user: state.user,
      }),
    },
  ),
);
