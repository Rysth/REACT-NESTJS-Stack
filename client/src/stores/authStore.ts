import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  resendVerification: (email: string) => Promise<void>;
  verifyEmail: (key: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (key: string, password: string, passwordConfirmation: string) => Promise<void>;
  clearSession: () => void;
  fetchUserInfo: () => Promise<void>;
  updateUser: (user: User) => void;
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
        } catch (error: any) {
          let errorMessage = 'Error al registrar la cuenta';

          if (error.response?.status === 422) {
            // Handle validation errors from Rodauth
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
              } else if (responseText.includes('El nombre completo es requerido')) {
                errorMessage = 'El nombre completo es requerido';
              } else if (responseText.includes('El nombre de usuario es requerido')) {
                errorMessage = 'El nombre de usuario es requerido';
              } else if (responseText.includes('Solo se permiten letras, números y guiones bajos')) {
                errorMessage = 'El nombre de usuario solo puede contener letras, números y guiones bajos';
              } else if (responseText.includes('Formato de correo electrónico inválido')) {
                errorMessage = 'El formato del correo electrónico no es válido';
              } else if (responseText.includes('email')) {
                errorMessage = 'Problema con el correo electrónico proporcionado';
              } else if (responseText.includes('username')) {
                errorMessage = 'Problema con el nombre de usuario proporcionado';
              } else if (responseText.includes('password')) {
                errorMessage = 'Problema con la contraseña proporcionada';
              } else if (responseText.includes('fullname')) {
                errorMessage = 'El nombre completo es requerido';
              }
            }
          } else if (error.response?.status >= 500) {
            errorMessage = 'Error del servidor. Intenta nuevamente en unos momentos';
          } else if (!error.response) {
            errorMessage = 'Sin conexión. Verifica tu conexión a internet';
          }

          set({ error: errorMessage, isLoading: false });
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

          // Fetch user info after successful login
          await get().fetchUserInfo();
          set({ isLoading: false });
        } catch (error: any) {
          let errorMessage = 'Error al iniciar sesión';

          if (error.response?.status === 401) {
            // 401 means invalid credentials (email/password combination)
            errorMessage = 'Credenciales incorrectas. Verifica que tu correo electrónico y contraseña sean correctos';
          } else if (error.response?.status === 403) {
            // 403 means account exists but is not verified
            errorMessage = 'Tu cuenta no está verificada. Revisa tu correo electrónico y activa tu cuenta.';
          } else if (error.response?.status === 422) {
            const responseText = error.response?.data || '';
            if (typeof responseText === 'string') {
              if (responseText.includes('email')) {
                errorMessage = 'El formato del correo electrónico no es válido';
              } else if (responseText.includes('password')) {
                errorMessage = 'La contraseña es requerida';
              }
            }
          } else if (error.response?.status >= 500) {
            errorMessage = 'Error del servidor. Intenta nuevamente en unos momentos';
          } else if (!error.response) {
            errorMessage = 'Sin conexión. Verifica tu conexión a internet';
          }

          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      fetchUserInfo: async () => {
        set({ isLoadingUserInfo: true });
        try {
          // Since Rodauth doesn't have a built-in user info endpoint,
          // we'll create a simple one in our Rails app
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
          set({ user: null, isLoading: false });
          clearToken();
        } catch (error: any) {
          set({ error: 'Logout failed', isLoading: false });
          throw error;
        }
      },


      // New: resend verification email
      resendVerification: async (email) => {
        try {
          await api.post('/verify-account-resend', { email }, { withCredentials: true });
        } catch (error: any) {
          // surface meaningful errors
          if (error.response?.status === 429) {
            throw new Error('Se ha enviado un correo recientemente. Por favor, espera antes de solicitar otro.');
          }
          if (error.response?.status === 401) {
            throw new Error('Esta cuenta ya está verificada o no existe.');
          }
          throw new Error(error.response?.data?.message || 'No se pudo reenviar el correo de verificación');
        }
      },

      // New: verify email with token
      verifyEmail: async (key) => {
        try {
          await api.post('/verify-account', { key }, {
            withCredentials: true,
            headers: { Accept: 'application/json' },
          });
        } catch (error: any) {
          throw new Error('Token inválido o ya utilizado');
        }
      },

      // New: request password reset
      requestPasswordReset: async (email) => {
        try {
          await api.post('/reset-password-request', { email }, { withCredentials: true });
        } catch (error: any) {
          throw new Error(error.response?.data?.message || 'No se pudo solicitar el restablecimiento');
        }
      },

      // New: reset password with token
      resetPassword: async (key, password, passwordConfirmation) => {
        try {
          await api.post('/reset-password', {
            key,
            password,
            'password-confirm': passwordConfirmation,
          }, { withCredentials: true });
        } catch (error: any) {
          if (error.response?.status === 401) {
            throw new Error('El enlace es inválido o ha expirado');
          }
          if (error.response?.status === 422) {
            throw new Error('Las contraseñas no coinciden o no cumplen los requisitos');
          }
          throw new Error('Error al restablecer la contraseña');
        }
      },

      clearSession: () => {
        set({ user: null, isLoading: false, error: null });
        clearToken();
      },

      updateUser: (user) => {
        set({ user });
      },

    }),
    {
      name: 'auth-storage',
      partialize: (state: AuthState) => ({
        user: state.user,
      }),
    },
  ),
);
