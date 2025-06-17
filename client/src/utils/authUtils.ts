import { jwtDecode } from 'jwt-decode';

interface DecodedTokenProps {
  exp: number;
  role: string;
  iat: number;
  userId: string;
}

export const getDecodedToken = (): DecodedTokenProps | null => {
  const token = localStorage.getItem('authToken');
  if (token) {
    const decodedToken: DecodedTokenProps | null = jwtDecode(token);
    if (decodedToken.exp * 1000 < Date.now()) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return null;
    }
    return decodedToken;
  }
  return null;
};

export const isAuthenticated = () => {
  if (getDecodedToken() === null) {
    return false;
  }
  return true;
};

export const isAdmin = () => {
  const decodedToken = getDecodedToken();
  if (decodedToken?.role === 'DATABASE_ADMIN') {
    return true;
  }
  return false;
};

interface User {
  id: string;
  officeId: string;
  email?: string;
  phone?: string;
  username?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  status?: string;
  lastSeen?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const localUserData = (): User | null => {
  const userData = localStorage.getItem('user');
  return userData ? (JSON.parse(userData) as User) : null;
};


export const baseUserRoute = () => {
  const decodedToken = getDecodedToken();
  if (getDecodedToken() === null) {
    return '/auth/login';
  }
  switch (decodedToken.role) {
    case 'DATABASE_ADMIN':
      return '/admin';
    case 'USER':
      return '/dashboard';
  }
};
