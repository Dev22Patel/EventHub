import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Context
const AuthContext = createContext();

// Provider Component
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check localStorage on mount
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    const login = (token) => {
        setIsAuthenticated(true);
        localStorage.setItem('authToken', token); // Store token in localStorage
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('authToken'); // Remove token from localStorage
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for easy access to the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};

