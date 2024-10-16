import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios'; // Make sure to install axios if not already installed

// Create Context
const AuthContext = createContext();

// Provider Component
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [hostedEvents, setHostedEvents] = useState([]);
    const [sponsoredEvents, setSponsoredEvents] = useState([]);

    // Check localStorage on mount
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsAuthenticated(true);
            getHostedEvents();
            getSponsoredEvents();
        }
    }, []);

    const login = (token) => {
        setIsAuthenticated(true);
        localStorage.setItem('authToken', token); // Store token in localStorage
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('authToken'); // Remove token from localStorage
        setHostedEvents([]); // Clear hosted events
        setSponsoredEvents([]); // Clear sponsored events
    };

    const getHostedEvents = async () => {
        const userId = localStorage.getItem('userId'); // Ensure this key matches your stored user ID
        if (userId) {
            try {
                const response = await axios.get(`http://localhost:3000/api/events/hosted/${userId}`);
                setHostedEvents(response.data);
            } catch (error) {
                console.error('Error fetching hosted events:', error);
            }
        }
    };

    const getSponsoredEvents = async () => {
        const userId = localStorage.getItem('userId'); // Ensure this key matches your stored user ID
        if (userId) {
            try {
                const response = await axios.get(`http://localhost:3000/api/events/sponsored/${userId}`);
                setSponsoredEvents(response.data);
            } catch (error) {
                console.error('Error fetching sponsored events:', error);
            }
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, hostedEvents, sponsoredEvents }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for easy access to the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};
