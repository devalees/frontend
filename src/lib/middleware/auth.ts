import { User } from '../store/slices/authSlice';
import { redirect } from 'next/navigation';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: Error | null;
}

interface AuthMiddlewareProps {
  authState: AuthState;
  requiredPermissions?: string[];  // Required permissions for the route
}

export const authMiddleware = ({
  authState,
  requiredPermissions = []
}: AuthMiddlewareProps) => {
  const { isAuthenticated, user } = authState;

  // Check if user is authenticated
  if (!isAuthenticated) {
    redirect('/login');
  }

  // If no permissions required, allow access
  if (requiredPermissions.length === 0) {
    return true;
  }

  // Check if user has required permissions
  const userPermissions = user?.permissions || [];
  const hasRequiredPermissions = requiredPermissions.every(permission =>
    userPermissions.includes(permission)
  );

  if (!hasRequiredPermissions) {
    // Redirect to unauthorized page
    redirect('/unauthorized');
  }

  return true;
}; 