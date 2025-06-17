import { FunctionComponent } from 'preact';
import { Route } from 'preact-iso';
import { getDecodedToken } from '../utils/authUtils';
import { NotFound } from '../pages/_404';
import { UserRole } from '../types/UserRole';

interface ProtectedRouteProps {
  component: FunctionComponent;
  path: string;
  allowedRoles: UserRole[];
}

const ProtectedRoute: FunctionComponent<ProtectedRouteProps> = ({
  component: Component,
  path,
  allowedRoles,
  ...rest
}) => {
  const data = getDecodedToken();

  if (!data) {
  // Redirect only if user is unauthenticated
    window.location.href = '/auth/login';
    return null;
  }

  const hasAccess = allowedRoles.includes(data.role as UserRole);

  // Render the component if access is granted, or NotFound if denied
  return hasAccess ? (
    <Route path={path} component={Component} {...rest} />
  ) : (
    <Route component={NotFound} />
  );
};

export default ProtectedRoute;
