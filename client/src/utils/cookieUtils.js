import Cookies from 'js-cookie';

// Configurações padrão para cookies - Compatível com Brave
const COOKIE_OPTIONS = {
  expires: 7, // 7 dias
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
};

// Funções para gerenciar cookies de autenticação
export const setAuthToken = (token) => {
  Cookies.set('auth_token', token, COOKIE_OPTIONS);
};

export const getAuthToken = () => {
  return Cookies.get('auth_token');
};

export const removeAuthToken = () => {
  Cookies.remove('auth_token');
};

// Função para verificar se o usuário está autenticado
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Função para limpar todos os cookies de autenticação
export const clearAuthCookies = () => {
  removeAuthToken();
};

// Função para configurar cookies com opções personalizadas
export const setCookie = (name, value, options = {}) => {
  const finalOptions = { ...COOKIE_OPTIONS, ...options };
  Cookies.set(name, value, finalOptions);
};

// Função para obter cookie
export const getCookie = (name) => {
  return Cookies.get(name);
};

// Função para remover cookie
export const removeCookie = (name) => {
  Cookies.remove(name);
};
