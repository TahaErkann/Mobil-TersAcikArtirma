import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Kimlik doğrulama verilerine erişim hook'u
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth hook\'u AuthProvider içinde kullanılmalıdır');
  }
  
  // User tipindeki isAdmin özelliğine göre admin kontrolü yap
  const isAdmin = !!context.user?.isAdmin;
  
  // Genişletilmiş context'i döndür
  return {
    ...context,
    isAdmin,
  };
}; 