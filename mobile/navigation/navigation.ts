import { router } from 'expo-router';

// Helper function for navigation - wraps expo-router's router
export function navigate(name: string, params?: Record<string, any>) {
  try {
    // Map old route names to new expo-router paths
    const routeMap: Record<string, string> = {
      'SignIn': '/auth/signin',
      'SignUp': '/auth/signup',
      'Confirm': '/auth/confirm',
      'ForgotPassword': '/auth/forgot-password',
      'ResetPassword': '/auth/reset-password',
      'VerifyEmail': '/auth/verify-email',
      'Main': '/',
      'Home': '/',
    };

    const path = routeMap[name] || name;

    if (params) {
      router.push({ pathname: path as any, params });
    } else {
      router.push(path as any);
    }
  } catch (error) {
    console.error('Navigation error:', error);
  }
}

export function resetTo(name: string) {
  try {
    const routeMap: Record<string, string> = {
      'SignIn': '/auth/signin',
      'SignUp': '/auth/signup',
      'Main': '/',
      'Home': '/',
    };

    const path = routeMap[name] || name;
    router.replace(path as any);
  } catch (error) {
    console.error('Navigation reset error:', error);
  }
}

// Re-export router for direct use
export { router };
