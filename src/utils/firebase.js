/**
 * NOTA: Este es un archivo de autenticación simulada para desarrollo
 *
 * En un entorno de producción, deberías usar Firebase real:
 * 1. Ve a https://console.firebase.google.com/
 * 2. Crea un nuevo proyecto o selecciona uno existente
 * 3. En la configuración del proyecto, agrega una nueva aplicación web
 * 4. Copia la configuración de Firebase y configura este archivo correctamente
 */

// Simulación de autenticación para desarrollo
// Almacena usuarios en localStorage para simular una base de datos
const getUsers = () => {
  const users = localStorage.getItem('mockUsers');
  return users ? JSON.parse(users) : [];
};

const saveUsers = (users) => {
  localStorage.setItem('mockUsers', JSON.stringify(users));
};

// Función para obtener el usuario actual del almacenamiento
export const getUserFromStorage = () => {
  try {
    const user = localStorage.getItem('currentUser');
    if (!user) return null;

    // تحليل بيانات المستخدم
    const userData = JSON.parse(user);

    // التحقق من صحة البيانات
    if (userData && userData.uid) {
      console.log('User found in localStorage:', userData.displayName);
      return userData;
    }

    return null;
  } catch (error) {
    console.error('Error getting user from storage:', error);
    // في حالة حدوث خطأ، قم بمسح البيانات غير الصالحة
    localStorage.removeItem('currentUser');
    return null;
  }
};

// Simula el objeto auth de Firebase
const auth = {
  currentUser: null,
  onAuthStateChanged: (callback) => {
    const user = localStorage.getItem('currentUser');
    callback(user ? JSON.parse(user) : null);
    return () => {}; // Función de limpieza
  }
};

// Simula los proveedores de autenticación
const googleProvider = {};
const facebookProvider = {};

// Authentication functions
export const registerWithEmailAndPassword = async (name, email, password) => {
  try {
    // Verificar si el correo ya está registrado
    const users = getUsers();
    const existingUser = users.find(user => user.email === email);

    if (existingUser) {
      throw new Error('auth/email-already-in-use');
    }

    // Crear nuevo usuario
    const newUser = {
      uid: Date.now().toString(),
      email,
      displayName: name,
      emailVerified: false,
      createdAt: new Date().toISOString()
    };

    // Guardar usuario en "base de datos"
    users.push({
      ...newUser,
      password // En una aplicación real, NUNCA almacenes contraseñas en texto plano
    });
    saveUsers(users);

    // Guardar sesión actual
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    return newUser;
  } catch (error) {
    console.error("Error en el registro:", error);
    throw error;
  }
};

export const loginWithEmailAndPassword = async (email, password) => {
  try {
    // Buscar usuario
    const users = getUsers();
    const user = users.find(user => user.email === email && user.password === password);

    if (!user) {
      throw new Error('auth/user-not-found');
    }

    // Guardar sesión actual
    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

    return userWithoutPassword;
  } catch (error) {
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    // Simular inicio de sesión con Google
    const mockGoogleUser = {
      uid: `google-${Date.now()}`,
      email: 'usuario.google@example.com',
      displayName: 'Usuario Google',
      emailVerified: true,
      providerData: [{ providerId: 'google.com' }]
    };

    localStorage.setItem('currentUser', JSON.stringify(mockGoogleUser));
    return mockGoogleUser;
  } catch (error) {
    throw error;
  }
};

export const signInWithFacebook = async () => {
  try {
    // Simular inicio de sesión con Facebook
    const mockFacebookUser = {
      uid: `facebook-${Date.now()}`,
      email: 'usuario.facebook@example.com',
      displayName: 'Usuario Facebook',
      emailVerified: true,
      providerData: [{ providerId: 'facebook.com' }]
    };

    localStorage.setItem('currentUser', JSON.stringify(mockFacebookUser));
    return mockFacebookUser;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    // Eliminar sesión actual
    localStorage.removeItem('currentUser');
    return true;
  } catch (error) {
    throw error;
  }
};

export { auth };

