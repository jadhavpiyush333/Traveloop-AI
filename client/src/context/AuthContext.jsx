import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage or token here if integrating with backend later
    const storedUser = localStorage.getItem('traveloop_user');
    const usersDB = JSON.parse(localStorage.getItem('traveloop_users_db')) || [];
    
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Validate that the user actually exists in our mocked DB
      const userExists = usersDB.some(u => u.email === parsedUser.email);
      
      if (userExists) {
        setUser(parsedUser);
      } else {
        // Clear invalid ghost session from previous versions
        localStorage.removeItem('traveloop_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simulated login API call checking against registered users
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const usersDB = JSON.parse(localStorage.getItem('traveloop_users_db')) || [];
        const foundUser = usersDB.find(u => u.email === email && u.password === password);
        
        if (foundUser) {
          const { password: _, ...userWithoutPassword } = foundUser;
          setUser(userWithoutPassword);
          localStorage.setItem('traveloop_user', JSON.stringify(userWithoutPassword));
          resolve(userWithoutPassword);
        } else {
          reject(new Error('Invalid email or password. Please sign up first.'));
        }
      }, 1000);
    });
  };

  const signup = async (name, email, password) => {
    // Simulated signup API call storing to a local DB
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const usersDB = JSON.parse(localStorage.getItem('traveloop_users_db')) || [];
        
        // Check if user exists
        if (usersDB.some(u => u.email === email)) {
          reject(new Error('Email is already registered. Please log in.'));
          return;
        }

        const newUser = { id: Date.now().toString(), name, email, password };
        usersDB.push(newUser);
        localStorage.setItem('traveloop_users_db', JSON.stringify(usersDB));

        const { password: _, ...userWithoutPassword } = newUser;
        setUser(userWithoutPassword);
        localStorage.setItem('traveloop_user', JSON.stringify(userWithoutPassword));
        resolve(userWithoutPassword);
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('traveloop_user');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
