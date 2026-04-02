// This file is used to create a context for authentication in a React application using the Context API and hooks.
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { set } from 'react-hook-form';

interface User {
    username: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    setUser: (user: User | null) => void;
}
// Create the AuthContext with an initial value of undefined. The context will be used to provide authentication-related data 
// and functions to the components that consume it.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    // Configure the login function to handle user authentication.
    const login = async (username: string, password: string): Promise<void> => {
        try {
            // Send a request to the backend to log in
            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Include cookies for authentication
                body: JSON.stringify({ username, password }),
            });
            if (!res.ok) {
                throw new Error('Login failed with invalid credentials.');
            }

            const data = await res.json();
            setUser({ username: data.username });
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }
    // Configure the logout function to handle user logout.
    const logout = async (): Promise<void> => { 
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/logout`, {
                method: 'POST',
                credentials: 'include', // Include cookies for authentication
            });
            setUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    }
    // Return the AuthContext.Provider component, which provides the authentication-related data and functions to its children components.
    return (
        <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}
// Create a custom hook called useAuth that allows components to easily access the authentication context.
export function useAuth() : AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}