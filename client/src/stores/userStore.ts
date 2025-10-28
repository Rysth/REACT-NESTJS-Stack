import { create } from 'zustand';
import api from '../utils/api';

// Define the User type here or import it from a types file
export interface User {
  id: number;
  email: string;
  username: string;
  fullname: string;
  identification?: string;
  phone_number?: string;
  roles: string[];
  created_at: string;
  updated_at: string;
  verified: boolean; // From account.status == 'verified'
  account_status: string; // 'unverified', 'verified', 'closed'
}

interface Pagination {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
}

interface UserFilters {
  search?: string;
  role?: string;
  fullname?: string;
  username?: string;
  email?: string;
  sort_by?: string;
  sort_direction?: string;
}

interface CreateUserData {
  fullname: string;
  username: string;
  email: string;
  identification?: string;
  phone_number?: string;
  roles: string[];
  password?: string;
  passwordConfirmation?: string;
}

// Añadir interfaz para datos de actualización
interface UpdateUserData {
  fullname?: string;
  username?: string;
  email?: string;
  identification?: string;
  phone_number?: string;
  roles?: string[];
}

// Actualizar la interfaz UserState
interface UserState {
  users: User[];
  isLoading: boolean;
  isExporting: boolean;
  error: string | null;
  pagination: Pagination;
  fetchUsers: (page?: number, perPage?: number, filters?: UserFilters, sort?: string) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  createUser: (userData: CreateUserData) => Promise<void>;
  toggleUserConfirmation: (userId: number, isConfirmed: boolean) => Promise<void>;
  updateUser: (id: number, userData: UpdateUserData) => Promise<void>;
  updateUserPassword: (id: number, password: string, passwordConfirmation: string) => Promise<void>;
  exportUsers: (filters?: UserFilters) => Promise<void>;
  currentFilters: UserFilters | null; // Añadir esta línea
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  isLoading: false,
  isExporting: false,
  error: null,
  pagination: {
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    per_page: 12
  },
  currentFilters: null, // Inicializar como null
  
  fetchUsers: async (page = 1, perPage = 12, filters = {}, sort?: string) => {
    set({ isLoading: true, error: null, currentFilters: filters });
    try {
      // Construir la URL con los parámetros de consulta necesarios
      let params: any = { 
        page, 
        per_page: perPage
      };
      
      // Añadir los filtros si existen
      if (filters.search) {
        params.search = filters.search;
      }
      
      if (filters.role) {
        params.role = filters.role;
      }
      
      // Añadir parámetros de ordenamiento
      if (filters.sort_by) {
        params.sort_by = filters.sort_by;
      }
      
      if (filters.sort_direction) {
        params.sort_direction = filters.sort_direction;
      }
      
      // Handle legacy sort parameter
      if (sort) {
        params.sort = sort;
      }
      
      const response = await api.get('/api/users', { params });
      
      if (response.status === 200) {
        set({ 
          users: response.data.users, 
          pagination: response.data.pagination,
          isLoading: false 
        });
        return;
      }
      
      throw new Error('Error al obtener usuarios');
    } catch (error: any) {
      console.error('Error fetching users:', error);
      const message = error.response?.data?.message || 'Error al obtener usuarios';
      set({ error: message, isLoading: false });
      throw error;
    }
  },
  
  deleteUser: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.delete(`/api/users/${id}`);
      
      if (response.status === 200) {
        // Obtener el estado actual de la paginación y filtros
        const { pagination, currentFilters } = get();
        
        // Si se eliminó el último usuario de una página (excepto la primera)
        if (get().users.length === 1 && pagination.current_page > 1) {
          // Cargar la página anterior 
          await get().fetchUsers(pagination.current_page - 1, pagination.per_page, currentFilters || {});
        } else {
          // Refrescar la página actual con los filtros existentes
          await get().fetchUsers(pagination.current_page, pagination.per_page, currentFilters || {});
        }
        return;
      }
      
      throw new Error('Error al eliminar usuario');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      const message = error.response?.data?.message || 'Error al eliminar usuario';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  createUser: async (userData: CreateUserData) => {
    set({ isLoading: true, error: null });
    try {
      const requestData: any = { 
        user: {
          fullname: userData.fullname,
          username: userData.username,
          email: userData.email,
          identification: userData.identification,
          phone_number: userData.phone_number
        },
        roles: userData.roles.join(',')
      };

      // Add password fields if provided
      if (userData.password) {
        requestData.user.password = userData.password;
        requestData.user.password_confirmation = userData.passwordConfirmation;
      }

      const response = await api.post('/api/users', requestData);
      
      if (response.status === 201) {
        const { pagination } = get();
        await get().fetchUsers(pagination.current_page, pagination.per_page);
        return;
      }
      
      throw new Error('Error al crear usuario');
    } catch (error: any) {
      console.error('Error creating user:', error);
      let errorMessage = 'Error al crear usuario';
      
      if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  toggleUserConfirmation: async (userId: number, isConfirmed: boolean) => {
    set({ isLoading: false, error: null });
    try {
      const response = await api.put(`/api/users/${userId}/toggle_confirmation`, {
        confirmed: isConfirmed
      });
      
      if (response.status === 200) {
        // Update the user in the local state
        const users = [...get().users];
        const userIndex = users.findIndex(user => user.id === userId);
        
        if (userIndex !== -1) {
          users[userIndex] = {
            ...users[userIndex],
            verified: response.data.verified,
            account_status: response.data.account_status
          };
          
          set({ users, isLoading: false });
        }
        
        return;
      }
      
      throw new Error('Error al actualizar la confirmación del usuario');
    } catch (error: any) {
      console.error('Error toggling user confirmation:', error);
      const message = error.response?.data?.message || 'Error al actualizar la confirmación del usuario';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  updateUser: async (id: number, userData: UpdateUserData) => {
    set({ isLoading: true, error: null });
    try {
      // Structure the request data
      const requestData: any = { user: { ...userData } };
      
      // If roles are present, they need to be sent outside the user object
      if (userData.roles) {
        requestData.roles = userData.roles.join(',');
        delete requestData.user.roles;
      }
      
      const response = await api.put(`/api/users/${id}`, requestData);
      
      if (response.status === 200) {
        // Update the local state with the updated user
        set(state => ({
          users: state.users.map(user => 
            user.id === id 
              ? { ...user, ...response.data.user }
              : user
          )
        }));
        set({ isLoading: false });
      } else {
        throw new Error('Error al actualizar usuario');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al actualizar usuario';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  updateUserPassword: async (id: number, password: string, passwordConfirmation: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/api/users/${id}/update_password`, {
        user: {
          password,
          password_confirmation: passwordConfirmation
        }
      });

      if (response.status === 200) {
        set({ isLoading: false });
        return;
      }

      throw new Error('Error al actualizar la contraseña');
    } catch (error: any) {
      console.error('Error updating password:', error);
      let errorMessage = 'Error al actualizar la contraseña';

      // Handle validation errors
      if (error.response?.data?.errors) {
        errorMessage = Object.entries(error.response.data.errors)
          .map(([field, errors]) => `${field}: ${errors}`)
          .join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  exportUsers: async (filters = {}) => {
    set({ isExporting: true, error: null });
    try {
      // Build query parameters
      let params: any = {};

      if (filters.search) {
        params.search = filters.search;
      }

      if (filters.role) {
        params.role = filters.role;
      }

      // Make request with responseType blob for file download
      const response = await api.get('/api/users/export', {
        params,
        responseType: 'blob'
      });

      // Create a blob from the response
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      link.setAttribute('download', `usuarios_${timestamp}.xlsx`);

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      set({ isExporting: false });
    } catch (error: any) {
      console.error('Error exporting users:', error);
      const message = error.response?.data?.message || 'Error al exportar usuarios';
      set({ error: message, isExporting: false });
      throw new Error(message);
    }
  }
}));