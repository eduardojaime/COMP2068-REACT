# Week 11: JWT Authentication in MERN Stack

## Prerequisites
- Install required packages (BACKEND):
```bash
npm i passport passport-local passport-local-mongoose jsonwebtoken passport-jwt cookie-parser cors express-rate-limit helmet
```

### Part 1: Setting Up User Model and Passport

#### Create User Model
- In MERN-BACKEND/src/models/
    - Create user.ts file
    - Define User interface with username and password
    - Add methods from passport-local-mongoose (setPassword, authenticate)
    - Define UserModel interface with static methods (createStrategy, serializeUser, deserializeUser)
    - Create user schema with validation
    - Apply passport-local-mongoose plugin
    - Export User model

```typescript
import mongoose, { Schema, Model } from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

interface User {
    username: string;
    password: string;
    setPassword(password: string): any;
    authenticate(password: string): any;
}

interface UserModel extends Model<User> {
    createStrategy(): any;
    serializeUser(): any;
    deserializeUser(): any;
}

const userSchema = new Schema<User>({
    username: {
        type: String,
        required: [true, 'Username is Required'],
        trim: true,
        minLength: 1
    },
    password: {
        type: String,
        trim: true,
        minLength: 8
    }
});

userSchema.plugin(passportLocalMongoose as any);
const User = mongoose.model<User, UserModel>('User', userSchema);
export default User;
```

#### Configure Environment Variables
- In .env file add:
    - PASSPORT_SECRET for session encryption
    - CLIENT_URL for CORS configuration

```env
PASSPORT_SECRET=your-random-secret-here
CLIENT_URL=http://localhost:3000
```

#### Configure Passport in index.ts
- Import required packages (passport, session, JWT strategy, cookie-parser, User model)
- Add cookieParser middleware
- Update CORS configuration to allow credentials and cookies
- Configure express-session with passport secret
- Initialize passport and session
- Link passport to User model using createStrategy
- Configure serialize/deserialize for session management
- Setup JWT options (extract from Bearer token, use passport secret)
- Create JWT strategy to verify and find user by ID
- Apply JWT strategy to passport

```typescript
// At the top of index.ts, add imports
import passport from 'passport';
import session from 'express-session';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import cookieParser from 'cookie-parser';
import User from './models/user';
import cors from 'cors';

// Add these middleware configurations in order (before your routes)

// 1. Cookie parser
app.use(cookieParser());

// 2. Update CORS to allow credentials
app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: 'GET,POST,PUT,DELETE,HEAD,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization'
}));

// 3. Configure express-session
app.use(session({
    secret: process.env.PASSPORT_SECRET as string,
    resave: true,
    saveUninitialized: false
}));

// 4. Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// 5. Link passport to User model
passport.use(User.createStrategy());

// 6. Configure serialize/deserialize
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// 7. Setup JWT options
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.PASSPORT_SECRET as string
};

// 8. Create and apply JWT strategy
const strategy = new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
    try {
        const user = await User.findById(jwt_payload.id);
        if (user) {
            return done(null, user);
        }
        return done(null, false);
    } catch (error) {
        return done(error, false);
    }
});

passport.use(strategy);

// Now add your routes below this configuration
```

### Part 2: Create Authentication Controllers and Routes

#### Create Users Controller
- In MERN-BACKEND/src/controllers/
    - Create usersController.ts file
    - Import User model and JWT
    - Create generateToken helper function
        - Accept user object as parameter
        - Create payload with user id and username
        - Set expiration time (1hr)
        - Sign and return JWT token
    - Create setTokenCookie helper function
        - Accept response and token as parameters
        - Set httpOnly cookie with token
        - Configure secure and sameSite options
    - Create clearTokenCookie helper function
        - Clear authToken cookie by setting to empty string with past expiry
    - Implement register handler
        - Check for duplicate username
        - Validate password length (minimum 8 characters)
        - Create new user instance
        - Use setPassword to hash password
        - Save user to database
        - Return 201 status with user data
        - Handle errors appropriately
    - Implement login handler
        - Find user by username
        - Use authenticate method to verify password
        - Generate JWT token on success
        - Set token in HTTP-only cookie
        - Return 200 status with token
        - Return 401 for invalid credentials
    - Implement logout handler
        - Call clearTokenCookie
        - Return success message

```typescript
import { Request, Response } from 'express';
import User from '../models/user';
import jwt from 'jsonwebtoken';

const generateToken = (user: any): string => {
    const payload = {
        id: user._id,
        username: user.username,
    };
    
    const jwtOptions = {
        expiresIn: '1hr'
    };

    return jwt.sign(payload, process.env.PASSPORT_SECRET as string, jwtOptions);
}

const setTokenCookie = (res: Response, token: string): void => {
    res.cookie('authToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    });
};

const clearTokenCookie = (res: Response): void => {
    res.clearCookie('authToken');
};

export const register = async (req: Request, res: Response) => {
    try {
        const duplicateUser = await User.findOne({ username: req.body.username });

        if (duplicateUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        if (req.body.password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        const user = new User({ username: req.body.username });
        await user.setPassword(req.body.password);
        await user.save();
        return res.status(201).json(user);
    }
    catch (err) {
        console.log(err);
        return res.status(400).json(err);
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        const result = await user.authenticate(req.body.password);
        
        if (result.user) {
            const authToken: string = generateToken(user);
            setTokenCookie(res, authToken);
            return res.status(200).json({ token: authToken });
        } else {
            return res.status(401).json({ error: 'Invalid Login' });
        }   
    }
    catch (err) {
        console.log(err);
        return res.status(401).json(err);
    }
};

export const logout = (req: Request, res: Response) => {
    clearTokenCookie(res);
    console.log('User Logged Out');
    res.status(200).json({ success: true, msg: 'User Logged out Successfully' });
};
```

#### Create User Routes
- In MERN-BACKEND/src/routes/
    - Create usersRoutes.ts file
    - Import express Router and controller functions
    - Create POST route for /register
    - Create POST route for /login
    - Create GET route for /logout
    - Export router

```typescript
import express, { Router } from 'express';
import { register, login, logout } from '../controllers/usersController';

const router: Router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

export default router;
```

#### Register Routes in index.ts
- Import usersRoutes
- Mount routes at /auth path
- Verify routes work with Postman/Thunder Client

### Part 3: Creating Authentication Middleware

#### Create Auth Middleware
- In MERN-BACKEND/src/middleware/
    - Create auth.ts file
    - Import required types from Express
    - Import JWT
    - Define JwtPayload interface with id and username
    - Extend Express Request interface to include optional user property
    - Create verifyToken middleware function
        - Extract authToken from cookies
        - Return 401 if token not present
        - Verify token using JWT and passport secret
        - Add decoded user data to request object
        - Call next() if valid
        - Return 401 for invalid/expired tokens

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    id: string;
    username: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token: string = req.cookies.authToken;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decode = jwt.verify(token, process.env.PASSPORT_SECRET as string) as JwtPayload;
        req.user = decode;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
```

### Part 4: Protecting API Routes

#### Apply Middleware to Protected Routes
- In your sushi routes (or other resource routes):
    - Import verifyToken middleware
    - Add verifyToken to POST routes (create operations)
    - Add verifyToken to PUT routes (update operations)
    - Add verifyToken to DELETE routes (delete operations)
    - Leave GET routes (list/read) public or protect as needed

```typescript
import { verifyToken } from '../middleware/auth';

// Example: Protect POST route
router.post('/', verifyToken, async (req: Request, res: Response) => {
    // Create logic here
    // req.user contains authenticated user info
});

// Example: Protect PUT route
router.put('/:id', verifyToken, async (req: Request, res: Response) => {
    // Update logic here
});

// Example: Protect DELETE route
router.delete('/:id', verifyToken, async (req: Request, res: Response) => {
    // Delete logic here
});
```

#### Test Protected Routes
- Try accessing protected routes without token
    - Should receive 401 Unauthorized
- Login first to get token
- Access protected routes with token in cookie
    - Should work successfully

### Part 5: Security Enhancements

#### Add Rate Limiting
- In index.ts:
    - Import express-rate-limit
    - Create apiLimiter configuration
        - Set window to 15 minutes
        - Set max requests to 100
    - Apply limiter to /api routes

```typescript
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // max 100 requests per window
});

app.use('/api/', apiLimiter);
```

#### Add Security Headers with Helmet
- In index.ts:
    - Import helmet
    - Apply helmet middleware
    - Optionally configure Content Security Policy

```typescript
import helmet from 'helmet';

app.use(helmet());

// Optional: Configure CSP
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", 'trusted-cdn.com'],
        },
    })
);
```

### Part 6: Frontend Integration (Next.js)

#### Create Auth Context
- In MERN-FRONTEND/app/context/
    - Create AuthContext.tsx with 'use client' directive
    - Define User and AuthContextType interfaces
    - Create AuthProvider component
        - Manage user state and loading state
        - Implement checkAuth function to verify existing session
        - Implement login function (POST to /api/auth/login)
        - Implement logout function (POST to /api/auth/logout)
        - Provide context value to children

#### Register and Login Components
- In MERN-FRONTEND/app/auth/register/
    - Create page.tsx with registration form
    - Use React Hook Form for validation
    - POST to backend /auth/register endpoint
    - Handle success/error states
- In MERN-FRONTEND/app/auth/login/
    - Create page.tsx with login form
    - Use React Hook Form for validation
    - Call AuthContext login function
    - Redirect on success

#### Protected Components
- Create withAuth HOC for route protection
- Wrap components that require authentication
- Check user state before rendering
- Redirect to login if not authenticated

#### API Calls with Credentials
- When making fetch requests to protected endpoints:
    - Include credentials: 'include' in fetch options
    - This sends the HTTP-only cookie with the request
    - Backend will verify JWT from cookie

```typescript
fetch('http://localhost:5000/api/sushi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Important!
    body: JSON.stringify(data)
});
```

### Testing Checklist

- [ ] Register new user successfully
- [ ] Login with valid credentials returns token
- [ ] Login with invalid credentials returns 401
- [ ] Token is stored in HTTP-only cookie
- [ ] Protected routes reject requests without token
- [ ] Protected routes accept requests with valid token
- [ ] Logout clears the token cookie
- [ ] Rate limiting prevents excessive requests
- [ ] Helmet headers are present in responses
- [ ] Frontend can register/login users
- [ ] Frontend can access protected API routes
- [ ] Frontend redirects unauthorized users to login
