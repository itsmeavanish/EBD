import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt?: string;
}

interface Order {
  orderId:string;
  refundAmount?: number;
  id: string;
  name: string;
  isPlaced: boolean;
  isAlloted?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  signup: (
    email: string,
    password: string,
    name: string,
    role?: 'user' | 'admin'
  ) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;

  // 👇 new
  order: Order | null;
  updateOrder: (newOrder: Order) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrders] = useState<Order | null>(null);
  useEffect(() => {
    // Restore user & token on app start
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedOrders = localStorage.getItem('orders'); // 👈 restore orders

    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoading(false);
    } else if (token) {
      fetch('http://localhost:3001/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  // 🔹 Keep orders in localStorage whenever they change
  useEffect(() => {
    const storedOrder = localStorage.getItem('orders');
  if (storedOrder) {
    setOrders(JSON.parse(storedOrder));
  }
  }, []);

  // 🔹 Utility function to update or add an order
  const updateOrder = (newOrder: Order) => {
    setOrders(newOrder);
  localStorage.setItem('orders', JSON.stringify(newOrder));
  };

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
      }
      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    role: 'user' | 'admin' = 'user'
  ): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      });

      const data = await response.json();
      if (data.success && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('orders'); // 👈 clear orders too
    setUser(null);
    setOrders([]);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, signup, logout, isLoading, order, updateOrder }}
    >
      {children}
    </AuthContext.Provider>
  );
};
