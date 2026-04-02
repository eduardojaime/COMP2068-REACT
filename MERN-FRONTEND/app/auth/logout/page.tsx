// app/auth/logout/page.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
    const { logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const handleLogout = async () => {
            await logout();
            router.push('/');
        };

        handleLogout();
    }, [logout, router]);

    return (
        <div className="container mt-4">
            <h1>Logging Out...</h1>
        </div>
    );
}
 