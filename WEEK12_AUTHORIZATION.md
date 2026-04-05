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
            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Important: sends cookies
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                throw new Error('Invalid login credentials');
            }

            const data = await res.json();
            // Backend returns { message, token } but not username, so use the parameter
            setUser({ username: username });
        } catch (error) {
            throw error;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/logout`, {
                method: 'POST',
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
    - Add NEXT_PUBLIC_SERVER_URL pointing to your backend (for API routes)
    - Add NEXT_PUBLIC_CLIENT_URL pointing to your frontend (for page navigation)

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:4000
NEXT_PUBLIC_CLIENT_URL=http://localhost:3000
```

- In MERN-BACKEND/.env
    - Add CLIENT_URL for CORS configuration

```env
CLIENT_URL=http://localhost:3000
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/register`, {
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

### Part 6: Protecting Backend Routes

#### Important: Public vs Protected Routes
- **Public Routes (no auth)**: GET operations for viewing data
- **Protected Routes (require auth)**: POST, PUT, DELETE operations

#### Backend Route Protection
In your backend sushi routes, apply `verifyToken` middleware **only** to POST, PUT, and DELETE:

```typescript
// routes/sushi.routes.ts
import { Router } from "express";
import { verifyToken } from "../middlewares/auth";

const router = Router();

// Public - no authentication required
router.get("/", async (req, res) => {
  // Get all sushi
});

router.get("/:id", async (req, res) => {
  // Get sushi by ID
});

// Protected - authentication required
router.post("/", verifyToken, async (req, res) => {
  // Create sushi
});

router.put("/:id", verifyToken, async (req, res) => {
  // Update sushi
});

router.delete("/:id", verifyToken, async (req, res) => {
  // Delete sushi
});
```

#### Update Backend Cookie Configuration
In MERN-BACKEND/src/controllers/users.controller.ts:

```typescript
const setTokenCookie = (res: Response, token: string): void => {
    res.cookie("authToken", token, {
        httpOnly: true,
        secure: false, // Set to false for local development
        sameSite: "lax", // "lax" works with http://localhost
        path: '/',
    })
}

const clearTokenCookie = (res: Response): void => {
    res.cookie('authToken', '', {
        httpOnly: true,
        secure: false,
        path: '/',
        expires: new Date(0),
    });
    res.clearCookie('authToken', { path: '/' });
}
```

#### Update Backend CORS Configuration
In MERN-BACKEND/src/index.ts:

```typescript
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  methods: ["OPTIONS", "GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
}));
```

### Part 7: Setting Up Next.js API Routes with Cookie Forwarding

#### Understanding the Cookie Flow
In Next.js with App Router, API routes run server-side. When a browser makes a request to a Next.js API route, the cookie is available, but when that API route calls your Express backend, the cookie is NOT automatically forwarded. You must manually extract and forward it.

**Flow:**
1. Browser → Next.js API Route (cookie available via `cookies()`)
2. Next.js API Route → Express Backend (must manually forward cookie in headers)
3. Express Backend verifies cookie/token

#### Create API Route: app/api/sushi/route.ts

```typescript
import { cookies } from 'next/headers';

// GET all sushi (public - no auth required)
export async function GET() {
  const res: Response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/sushi`,
  );
  return Response.json(await res.json());
}

// POST new sushi (protected - requires auth)
export async function POST(req: Request) {
  // Get cookies from the incoming request
  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken');
  
  const body = await req.json();

  const res: Response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/sushi`,
    {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        // Forward the cookie to the backend
        ...(authToken && { Cookie: `authToken=${authToken.value}` }),
      },
      credentials: "include",
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    const errorText = await res.text();
    return new Response(errorText, { status: res.status });
  }

  return Response.json({ success: true });
}
```

#### Create API Route: app/api/sushi/[id]/route.ts

```typescript
import { cookies } from 'next/headers';

// GET single sushi by ID (public - no auth required)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const res: Response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/sushi/${id}`,
  );

  if (!res.ok) throw new Error("Failed to fetch sushi");

  return Response.json(await res.json());
}

// DELETE sushi by ID (protected - requires auth)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken');
  
  const { id } = await params;

  const res: Response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/sushi/${id}`,
    { 
      method: "DELETE",
      headers: {
        ...(authToken && { Cookie: `authToken=${authToken.value}` }),
      },
      credentials: "include",
    },
  );

  if (!res.ok) throw new Error("Failed to delete sushi");

  return new Response(null, { status: 204 });
}

// PUT update sushi by ID (protected - requires auth)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken');
  
  const { id } = await params;
  const body = await req.json();

  const res: Response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/sushi/${id}`,
    {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        ...(authToken && { Cookie: `authToken=${authToken.value}` }),
      },
      credentials: "include",
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) throw new Error("Failed to update sushi");
  return new Response(null, { status: 204 });
}
```

#### Create API Route: app/api/sushi/create/route.ts

```typescript
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('authToken');
    
    const body = await req.json();

    const res: Response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/sushi`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken && { Cookie: `authToken=${authToken.value}` }),
        },
        credentials: "include",
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      return Response.json(
        { message: "Failed to create sushi on server" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    console.error("Create error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Part 8: Conditional UI Rendering Based on Auth State

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

**Authentication Flow:**
- [ ] Register creates new user and shows success message
- [ ] Login with valid credentials succeeds and redirects to /sushi
- [ ] Login with invalid credentials shows error message
- [ ] Navbar shows Register/Login when logged out
- [ ] Navbar shows username when logged in
- [ ] Logout clears user state and redirects to home
- [ ] Logout clears auth cookie on backend

**Cookie Management:**
- [ ] AuthToken cookie appears in browser DevTools after login
- [ ] Cookie has correct settings (httpOnly, path: '/', sameSite: 'lax')
- [ ] Cookie is cleared after logout

**Route Protection:**
- [ ] GET /api/sushi works without authentication (public)
- [ ] GET /api/sushi/:id works without authentication (public)
- [ ] POST /api/sushi requires authentication (protected)
- [ ] PUT /api/sushi/:id requires authentication (protected)
- [ ] DELETE /api/sushi/:id requires authentication (protected)
- [ ] 401 error returned when accessing protected routes without auth

**Frontend Integration:**
- [ ] Next.js API routes forward cookies to Express backend
- [ ] Create button hidden from anonymous users
- [ ] Edit/Delete buttons hidden from anonymous users
- [ ] Unauthorized requests redirect to login page
- [ ] Delete shows confirmation dialog before action

**Cross-Origin:**
- [ ] No CORS errors in browser console
- [ ] Credentials properly sent cross-origin (localhost:3000 → localhost:4000)
- [ ] Set-Cookie headers received from backend

### Important Notes

#### Cookie Configuration for Local Development
- Set `secure: false` in cookie options for localhost
- Set `sameSite: "lax"` for local development (use "none" only with HTTPS/production)
- Add `path: '/'` to ensure cookie is sent with all requests
- Production should use `secure: true` with HTTPS

**Backend Cookie Settings:**
```typescript
const setTokenCookie = (res: Response, token: string): void => {
    res.cookie("authToken", token, {
        httpOnly: true,
        secure: false, // Set to false for local development
        sameSite: "lax", // "lax" works with http://localhost
        path: '/',
    })
}
```

#### CORS Configuration
- Backend must allow credentials
- Backend must include "Cookie" in allowedHeaders
- Frontend must include `credentials: 'include'` in all authenticated requests
- Origin must match exactly (no wildcards with credentials)

**Backend CORS Setup:**
```typescript
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  methods: ["OPTIONS", "GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
}));
```

#### Next.js Cookie Forwarding (Critical!)
Since Next.js API routes run server-side, they don't automatically forward browser cookies to your Express backend. You must manually extract and forward cookies in each protected API route.

**Import cookies helper:**
```typescript
import { cookies } from 'next/headers';
```

**Forward cookies in API routes:**
```typescript
export async function POST(req: Request) {
  // Get cookies from the incoming request
  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken');
  
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/sushi`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      // Forward the cookie to the backend
      ...(authToken && { Cookie: `authToken=${authToken.value}` }),
    },
    credentials: "include",
    body: JSON.stringify(data),
  });
}
```

Apply this pattern to all API routes that need authentication (POST, PUT, DELETE operations).

#### User Ownership
- If implementing user-specific resources, add `username` field to your models
- Compare `req.user.username` (from JWT) with resource owner
- Return 403 Forbidden for unauthorized access attempts

### Common Issues and Solutions

#### Issue: "Token is undefined" in backend
**Cause**: Cookies not being forwarded from Next.js API routes to Express backend  
**Solution**: Import and use `cookies()` from 'next/headers' in all protected API routes, and forward the authToken in the Cookie header

#### Issue: Cookie not being set after login
**Cause**: `sameSite: "none"` requires `secure: true` (HTTPS only)  
**Solution**: Use `sameSite: "lax"` with `secure: false` for local development

#### Issue: CORS errors when sending cookies
**Cause**: Missing Cookie in allowedHeaders or credentials not enabled  
**Solution**: 
- Backend: Add "Cookie" to allowedHeaders in CORS config
- Frontend: Include `credentials: "include"` in all fetch requests

#### Issue: "sushi.map is not a function" 
**Cause**: API returns error object instead of array when authentication fails  
**Solution**: Ensure GET routes are not protected with verifyToken (they should be public)

#### Issue: Mongoose timeout/connection errors
**Cause**: Mongoose not connected when using User model  
**Solution**: Ensure Mongoose connection is established in database service:
```typescript
await mongoose.connect(`${connString}${dbName}`);
```

### Architecture Summary

#### Complete Cookie Flow
1. **User logs in** → Express backend generates JWT and sets httpOnly cookie
2. **Cookie stored** in browser for frontend domain (localhost:3000)
3. **Browser makes request** to Next.js API route with cookie
4. **Next.js API route** extracts cookie using `cookies()` helper
5. **Cookie forwarded** to Express backend in fetch headers
6. **Express backend** verifies JWT from cookie and processes request

#### Key Technologies
- **Frontend**: Next.js 13+ (App Router), React Context API, TailwindCSS
- **Backend**: Express.js, Passport.js, JWT, Mongoose
- **Authentication**: HTTP-only cookies, JWT tokens
- **Database**: MongoDB (Mongoose for users, native driver for sushi)

#### Security Features
- ✅ Passwords hashed with passport-local-mongoose
- ✅ JWT tokens stored in httpOnly cookies (not localStorage)
- ✅ CORS properly configured for cross-origin cookie handling
- ✅ Route-level authorization on backend
- ✅ Protected operations require valid JWT token

#### Development vs Production
**Development (localhost):**
- `secure: false`
- `sameSite: "lax"`
- Separate ports (3000 frontend, 4000 backend)

**Production:**
- `secure: true` (HTTPS required)
- `sameSite: "strict"` or `"lax"`
- Same domain or proper CORS configuration
