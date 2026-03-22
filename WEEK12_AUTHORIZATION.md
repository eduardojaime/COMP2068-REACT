# Week 12: Authorization and Client Integration in MERN Stack

## Prerequisites
- Complete Week 11 JWT Authentication setup on backend
- Frontend packages (MERN-FRONTEND):
```bash
npm i react-hook-form
```

### Part 1: Creating Auth Context for Client-Side State Management

#### Create Auth Context
- In MERN-FRONTEND/app/context/
    - Create AuthContext.tsx file with 'use client' directive
    - Define User interface with id and username
    - Define AuthContextType interface with user state and auth methods
    - Create AuthContext using createContext
    - Implement AuthProvider component
        - Manage user state (null when logged out)
        - Manage loading state for initial auth check
        - Create login function that posts to API and updates state
        - Create logout function that calls API and clears state
        - Create setUser function to update user state
        - Provide context value to children
    - Export useAuth hook for consuming the context

```typescript
// app/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
    id: string;
    username: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    const login = async (username: string, password: string): Promise<void> => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Important: sends cookies
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                throw new Error('Invalid login credentials');
            }

            const data = await res.json();
            setUser({ id: data.id, username: username });
        } catch (error) {
            throw error;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
                method: 'GET',
                credentials: 'include',
            });
            setUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
```

#### Wrap Application with AuthProvider
- In MERN-FRONTEND/app/layout.tsx
    - Import AuthProvider
    - Wrap children with AuthProvider
    - Ensure all pages have access to auth context

```typescript
// app/layout.tsx
import { AuthProvider } from './context/AuthContext';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
```

#### Configure Environment Variables
- In MERN-FRONTEND/.env.local
    - Add NEXT_PUBLIC_API_URL pointing to your backend

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Part 2: Implementing Register Functionality

#### Create Register Page Component
- In MERN-FRONTEND/app/auth/register/
    - Create page.tsx with 'use client' directive
    - Import useForm from react-hook-form
    - Import useRouter from next/navigation
    - Define RegisterFormData interface
    - Set up form with username, password, and confirm password fields
    - Add validation rules (password min 8 chars, passwords match)
    - Create message state for success/error feedback
    - Create messageClass state for styling (alert-info, alert-success, alert-danger)
    - Implement onSubmit handler
        - Check if passwords match
        - POST to /auth/register endpoint
        - Handle success: show success message with login link
        - Handle errors: display error message
    - Display message with dynamic styling
    - Show login link only on successful registration

```typescript
// app/auth/register/page.tsx
'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { useState } from 'react';
import Link from 'next/link';

interface RegisterFormData {
    username: string;
    password: string;
    confirm: string;
}

export default function RegisterPage() {
    const [message, setMessage] = useState('Please complete all fields');
    const [messageClass, setMessageClass] = useState('alert alert-info');
    
    const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>();
    
    const password = watch('password');

    const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
        if (data.password !== data.confirm) {
            setMessage('Passwords do not match');
            setMessageClass('alert alert-danger');
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: data.username,
                    password: data.password
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Registration failed');
            }

            const result = await res.json();
            
            if (result.username) {
                setMessage('Registration Successful. Click the Login link below.');
                setMessageClass('alert alert-success');
            }
        } catch (error: any) {
            setMessage(error.message || 'Registration failed');
            setMessageClass('alert alert-danger');
        }
    };

    return (
        <div className="container mt-4">
            <h1>Register</h1>
            <h5 className={messageClass}>{message}</h5>
            
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input
                        type="text"
                        className="form-control"
                        id="username"
                        {...register('username', { required: 'Username is required' })}
                    />
                    {errors.username && <span className="text-danger">{errors.username.message}</span>}
                </div>

                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        {...register('password', { 
                            required: 'Password is required',
                            minLength: { value: 8, message: 'Password must be at least 8 characters' }
                        })}
                    />
                    {errors.password && <span className="text-danger">{errors.password.message}</span>}
                </div>

                <div className="mb-3">
                    <label htmlFor="confirm" className="form-label">Confirm Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="confirm"
                        {...register('confirm', { required: 'Please confirm password' })}
                    />
                    {errors.confirm && <span className="text-danger">{errors.confirm.message}</span>}
                </div>

                <button type="submit" className="btn btn-primary">Register</button>
            </form>

            {messageClass === 'alert alert-success' && (
                <Link href="/auth/login" className="btn btn-primary mt-3">
                    Login
                </Link>
            )}
        </div>
    );
}
```

### Part 3: Implementing Login Functionality

#### Create Login Page Component
- In MERN-FRONTEND/app/auth/login/
    - Create page.tsx with 'use client' directive
    - Import useAuth hook from AuthContext
    - Import useRouter for navigation
    - Import useForm from react-hook-form
    - Define LoginFormData interface
    - Create message and messageClass states
    - Implement onSubmit handler
        - Call login from auth context
        - On success: redirect to main page (e.g., /sushi)
        - On error: display error message
    - Remove HTML form tags (use div) to prevent default form submission
    - Use button with onClick or form onSubmit handler

```typescript
// app/auth/login/page.tsx
'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

interface LoginFormData {
    username: string;
    password: string;
}

export default function LoginPage() {
    const [message, setMessage] = useState('Please enter your credentials');
    const [messageClass, setMessageClass] = useState('alert alert-info');
    const { login } = useAuth();
    const router = useRouter();
    
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

    const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
        try {
            await login(data.username, data.password);
            router.push('/sushi');
        } catch (error: any) {
            setMessage('Invalid Login');
            setMessageClass('alert alert-danger');
        }
    };

    return (
        <div className="container mt-4">
            <h1>Login</h1>
            <h5 className={messageClass}>{message}</h5>
            
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input
                        type="text"
                        className="form-control"
                        id="username"
                        {...register('username', { required: 'Username is required' })}
                    />
                    {errors.username && <span className="text-danger">{errors.username.message}</span>}
                </div>

                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        {...register('password', { required: 'Password is required' })}
                    />
                    {errors.password && <span className="text-danger">{errors.password.message}</span>}
                </div>

                <button type="submit" className="btn btn-primary">Login</button>
            </form>
        </div>
    );
}
```

### Part 4: Implementing Logout Functionality

#### Create Logout Component
- In MERN-FRONTEND/app/auth/logout/
    - Create page.tsx with 'use client' directive
    - Import useAuth and useRouter
    - Use useEffect hook to run logout on component mount
    - Call logout from auth context
    - Redirect to home page after logout
    - Display "Logging out..." message while processing

```typescript
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
```

### Part 5: Toggling Navbar Based on Auth State

#### Update Navbar Component
- In MERN-FRONTEND/app/components/navbar.tsx
    - Add 'use client' directive if not already present
    - Import useAuth hook
    - Get user from auth context
    - Conditionally render:
        - When user is null: show Register and Login links
        - When user exists: show username and Logout link
    - Use Link component from next/link for navigation

```typescript
// app/components/navbar.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user } = useAuth();

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container-fluid">
                <Link href="/" className="navbar-brand">Sushi Restaurant</Link>
                
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link href="/sushi" className="nav-link">Menu</Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/about" className="nav-link">About</Link>
                        </li>
                    </ul>
                    
                    <ul className="navbar-nav ms-auto">
                        {user ? (
                            <>
                                <li className="nav-item">
                                    <span className="nav-link">
                                        <i className="bi bi-person"></i> {user.username}
                                    </span>
                                </li>
                                <li className="nav-item">
                                    <Link href="/auth/logout" className="nav-link">
                                        <i className="bi bi-box-arrow-right"></i> Logout
                                    </Link>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link href="/auth/register" className="nav-link">
                                        <i className="bi bi-person-plus"></i> Register
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link href="/auth/login" className="nav-link">
                                        <i className="bi bi-person-lock"></i> Login
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}
```

### Part 6: Protecting Create/Update/Delete Operations

#### Update Backend Logout Handler
- In MERN-BACKEND/src/controllers/usersController.ts
    - Modify clearTokenCookie for local development
    - Set secure to false for localhost testing
    - Add path: '/' option
    - Use both cookie modification and clearCookie methods

```typescript
const clearTokenCookie = (res: Response): void => {
    res.cookie('authToken', '', {
        httpOnly: true,
        secure: false, // Set to false for local development
        path: '/',
        expires: new Date(0),
    });
    
    res.clearCookie('authToken', { path: '/' });
};
```

#### Secure Create Operation (POST)
- In your sushi controller or component making API calls
    - Import verifyToken middleware (already created in Week 11)
    - Apply to POST route in backend
    - In frontend component:
        - Add credentials: 'include' to fetch options
        - Handle 401 errors (redirect to login)
        - Check if user is authenticated before showing create form

**Backend (already done in Week 11):**
```typescript
// routes/sushi.routes.ts
import { verifyToken } from '../middleware/auth';

router.post('/', verifyToken, async (req: Request, res: Response) => {
    // Create logic
});
```

**Frontend Component:**
```typescript
// app/sushi/create/page.tsx
'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

export default function CreateSushiPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { register, handleSubmit } = useForm();

    // Redirect if not authenticated
    if (!user) {
        router.push('/auth/login');
        return <p>Redirecting to login...</p>;
    }

    const onSubmit = async (data: any) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sushi`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Important: includes auth cookie
                body: JSON.stringify(data),
            });

            if (res.status === 401) {
                router.push('/auth/login');
                return;
            }

            if (!res.ok) {
                throw new Error('Failed to create sushi');
            }

            router.push('/sushi');
        } catch (error) {
            console.error('Create failed:', error);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Create New Sushi Item</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Form fields */}
            </form>
        </div>
    );
}
```

#### Secure Delete Operation with User Ownership Check
- In MERN-BACKEND sushi controller
    - Modify DELETE route to check JWT token
    - Verify token exists and is valid
    - Find the resource by ID
    - Check if resource belongs to current user (if your sushi model has username field)
    - Return 403 Forbidden if user doesn't own the resource
    - Return 404 if resource not found
    - Delete only if all checks pass

```typescript
// Backend example (adapt to your sushi model)
router.delete('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const sushi = await Sushi.findById(req.params.id);

        if (!sushi) {
            return res.status(404).json({ msg: 'Sushi item not found' });
        }

        // If your sushi model tracks who created it
        // if (sushi.username !== req.user?.username) {
        //     return res.status(403).json({ msg: 'Unauthorized' });
        // }

        await Sushi.findByIdAndDelete(req.params.id);
        return res.status(204).json({});
    } catch (err) {
        return res.status(500).json(err);
    }
});
```

**Frontend Delete Component:**
```typescript
// app/components/deleteSushiButton.tsx
'use client';

import { useRouter } from 'next/navigation';

interface DeleteSushiButtonProps {
    id: string;
}

export default function DeleteSushiButton({ id }: DeleteSushiButtonProps) {
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this sushi item?')) {
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sushi/${id}`, {
                method: 'DELETE',
                credentials: 'include', // Include auth cookie
            });

            if (res.status === 401) {
                router.push('/auth/login');
                return;
            }

            if (res.status === 403) {
                alert('You are not authorized to delete this item');
                return;
            }

            if (!res.ok) {
                throw new Error('Delete failed');
            }

            // Refresh the page or redirect
            router.refresh();
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete item');
        }
    };

    return (
        <button onClick={handleDelete} className="btn btn-danger">
            Delete
        </button>
    );
}
```

#### Secure Update Operation with User Ownership Check
- In MERN-BACKEND sushi controller
    - Modify PUT route to check JWT token
    - Verify token exists and is valid
    - Find resource by ID
    - Check resource ownership (if applicable)
    - Return 403 if user doesn't own resource
    - Update only if authorized

```typescript
// Backend PUT route
router.put('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const sushi = await Sushi.findById(req.params.id);

        if (!sushi) {
            return res.status(404).json({ msg: 'Sushi item not found' });
        }

        // If your sushi model tracks who created it
        // if (sushi.username !== req.user?.username) {
        //     return res.status(403).json({ msg: 'Unauthorized' });
        // }

        await Sushi.findByIdAndUpdate(req.params.id, req.body);
        return res.status(202).json(sushi);
    } catch (err) {
        return res.status(500).json(err);
    }
});
```

**Frontend Update Component:**
```typescript
// app/sushi/edit/[id]/page.tsx
'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

export default function EditSushiPage({ params }: { params: { id: string } }) {
    const { user } = useAuth();
    const router = useRouter();
    const { register, handleSubmit, setValue } = useForm();

    // Redirect if not authenticated
    if (!user) {
        router.push('/auth/login');
        return <p>Redirecting to login...</p>;
    }

    // Load existing data
    useEffect(() => {
        const loadSushi = async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sushi/${params.id}`);
            const data = await res.json();
            setValue('name', data.name);
            setValue('price', data.price);
        };
        loadSushi();
    }, [params.id, setValue]);

    const onSubmit = async (data: any) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sushi/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Include auth cookie
                body: JSON.stringify(data),
            });

            if (res.status === 401) {
                router.push('/auth/login');
                return;
            }

            if (res.status === 403) {
                alert('You are not authorized to edit this item');
                return;
            }

            if (!res.ok) {
                throw new Error('Update failed');
            }

            router.push('/sushi');
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Edit Sushi Item</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Form fields */}
            </form>
        </div>
    );
}
```

### Part 7: Conditional UI Rendering Based on Auth State

#### Hide Create Button from Anonymous Users
- In your sushi list page
    - Import useAuth hook
    - Get user from context
    - Conditionally render "Add New" or "Create" button only when user is authenticated
    - Hide edit/delete buttons for anonymous users

```typescript
// app/sushi/page.tsx
'use client';

import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function SushiListPage() {
    const { user } = useAuth();

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center">
                <h1>Sushi Menu</h1>
                {user && (
                    <Link href="/sushi/create" className="btn btn-primary">
                        Add New Item
                    </Link>
                )}
            </div>
            
            {/* List of sushi items */}
            {/* Show edit/delete buttons only when user is authenticated */}
        </div>
    );
}
```

### Testing Checklist

- [ ] Register creates new user and shows success message
- [ ] Login with valid credentials succeeds and redirects
- [ ] Login with invalid credentials shows error message
- [ ] Navbar shows Register/Login when logged out
- [ ] Navbar shows username and Logout when logged in
- [ ] Logout clears user state and redirects to home
- [ ] Logout clears auth cookie on backend
- [ ] Create form is hidden from anonymous users
- [ ] Create operation requires authentication (401 without token)
- [ ] Edit operation requires authentication
- [ ] Delete operation requires authentication
- [ ] Delete shows confirmation dialog
- [ ] All protected API calls include credentials: 'include'
- [ ] Unauthorized users are redirected to login page
- [ ] Auth state persists correctly across page navigation

### Important Notes

#### Cookie Configuration for Local Development
- Set `secure: false` in cookie options for localhost
- Add `path: '/'` to ensure cookie is sent with all requests
- Production should use `secure: true` with HTTPS

#### CORS Configuration
- Backend must allow credentials
- Frontend must include `credentials: 'include'` in all authenticated requests
- Origin must match exactly (no wildcards with credentials)

#### User Ownership
- If implementing user-specific resources, add `username` field to your models
- Compare `req.user.username` (from JWT) with resource owner
- Return 403 Forbidden for unauthorized access attempts
