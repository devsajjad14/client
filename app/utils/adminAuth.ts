'use client';

import Cookies from 'js-cookie';

export const setAdminAuth = () => {
  Cookies.set('adminAuth', 'true', { expires: 1 }); // Expires in 1 day
};

export const removeAdminAuth = () => {
  Cookies.remove('adminAuth');
};

export const isAdminAuthenticated = () => {
  return Cookies.get('adminAuth') === 'true';
}; 