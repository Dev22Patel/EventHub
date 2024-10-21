import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [hostedEvents, setHostedEvents] = useState([]);
    const [sponsoredEvents, setSponsoredEvents] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
            getHostedEvents();
            getSponsoredEvents();
        }
    }, []);

    const login = (token) => {
        setIsAuthenticated(true);
        localStorage.setItem('token', token);
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        setHostedEvents([]);
        setSponsoredEvents([]);
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
        <AuthContext.Provider value={{ isAuthenticated, login, logout,isAdmin,setIsAdmin, hostedEvents, sponsoredEvents }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for easy access to the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};
