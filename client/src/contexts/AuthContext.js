import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuthToken, setAuthToken, removeAuthToken } from '../utils/cookieUtils';


const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fallback para localStorage se cookies não funcionarem (compatibilidade com Brave)
  const getInitialToken = () => {
    const cookieToken = getAuthToken();
    if (cookieToken) return cookieToken;
    
    // Fallback para localStorage
    const localStorageToken = localStorage.getItem('auth_token');
    if (localStorageToken) {
      // Migrar para cookies
      setAuthToken(localStorageToken);
      localStorage.removeItem('auth_token');
      return localStorageToken;
    }
    
    return null;
  };
  
  const [token, setToken] = useState(getInitialToken());

  useEffect(() => {
    // Verificar se há um erro na URL (callback do OAuth)
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');

    if (error) {
      console.error('Erro na autenticação:', error);
      // Limpar URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      console.log('Verificando token:', token ? 'Token presente' : 'Token ausente');
      console.log('Cookie auth_token:', getAuthToken() ? 'Presente' : 'Ausente');

      try {
        const response = await fetch('/api/auth?action=verify', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include', // Incluir cookies na requisição
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // Token inválido
          removeAuthToken();
          setToken(null);
        }
      } catch (error) {
        console.error('Erro ao verificar token:', error);
        removeAuthToken();
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const login = async () => {
    try {
      const response = await fetch('/api/auth?action=login');
      const data = await response.json();
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Erro no login:', error);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/auth?action=logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include', // Incluir cookies na requisição
        });
      }
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      removeAuthToken();
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
