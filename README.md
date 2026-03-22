# MERN Sushi Restaurant Application

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing a sushi restaurant menu. This project demonstrates a complete implementation of a modern web application with a TypeScript-based Express backend and a Next.js 16 frontend.

## Project Overview

This application consists of two main components:

- **MERN-BACKEND**: RESTful API server built with Express.js and TypeScript, connected to MongoDB
- **MERN-FRONTEND**: Next.js 16 application with React 19 and TailwindCSS for the user interface

### Features

- View sushi menu items
- Create new sushi items
- Update existing sushi items
- Delete sushi items
- Full CRUD operations with MongoDB
- API documentation with Swagger UI
- Server-side rendering with Next.js
- Type-safe development with TypeScript

## Technology Stack

### Backend
- **Express.js 5**: Web framework for Node.js
- **MongoDB**: NoSQL database
- **TypeScript**: Type-safe JavaScript
- **Swagger**: API documentation
- **Morgan**: HTTP request logger
- **dotenv**: Environment variable management

### Frontend
- **Next.js 16**: React framework with server-side rendering
- **React 19**: UI library
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS 4**: Utility-first CSS framework

## Prerequisites

Before running this project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account or local MongoDB instance

## Project Structure

```
COMP2068-REACT/
├── MERN-BACKEND/
│   ├── src/
│   │   ├── index.ts              # Express server entry point
│   │   ├── models/
│   │   │   └── sushi.ts          # Sushi data model
│   │   ├── routes/
│   │   │   └── sushi.routes.ts   # API routes for sushi
│   │   └── services/
│   │       └── database.service.ts # MongoDB connection
│   ├── .env                       # Environment variables (not in git)
│   └── package.json
│
└── MERN-FRONTEND/
    ├── app/
    │   ├── api/
    │   │   └── sushi/            # Next.js API routes (proxy to backend)
    │   ├── sushi/                # Sushi pages
    │   ├── auth/                 # Authentication pages
    │   └── components/           # Reusable components
    ├── .env.local                # Environment variables (not in git)
    └── package.json
```

## Setup and Installation

### 1. Backend Setup (MERN-BACKEND)

#### Step 1: Navigate to the backend folder
```bash
cd MERN-BACKEND
```

#### Step 2: Install dependencies
```bash
npm install
```

#### Step 3: Configure environment variables
Create a `.env` file in the `MERN-BACKEND` folder with the following content:

```env
DB_CONN_STRING=mongodb+srv://username:password@cluster.mongodb.net/?appName=YourCluster
DB_NAME=myFirstDatabase
COLLECTION_NAME=sushiMenu
```

Replace `username`, `password`, and cluster information with your MongoDB Atlas credentials.

#### Step 4: Run the backend development server
```bash
npm run dev
```

The backend server will start at **http://localhost:4000**

- API endpoints: `http://localhost:4000/api/sushi`
- API documentation (Swagger): `http://localhost:4000/api-docs`

### 2. Frontend Setup (MERN-FRONTEND)

#### Step 1: Navigate to the frontend folder
```bash
cd MERN-FRONTEND
```

#### Step 2: Install dependencies
```bash
npm install
```

#### Step 3: Configure environment variables
Create a `.env.local` file in the `MERN-FRONTEND` folder with the following content:

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:4000
NEXT_PUBLIC_CLIENT_URL=http://localhost:3000
```

#### Step 4: Run the frontend development server
```bash
npm run dev
```

The frontend application will start at **http://localhost:3000**

## Running the Complete Application

To run the full application, you need **both servers running simultaneously**:

1. **Terminal 1 (Backend)**:
   ```bash
   cd MERN-BACKEND
   npm install
   npm run dev
   ```

2. **Terminal 2 (Frontend)**:
   ```bash
   cd MERN-FRONTEND
   npm install
   npm run dev
   ```

3. Open your browser and navigate to **http://localhost:3000**

## How the Frontend and Backend Connect

The application uses a proxy architecture where the Next.js frontend communicates with the Express backend:

1. **Frontend → Next.js API Routes**: The frontend pages (e.g., `/app/sushi/page.tsx`) make requests to internal Next.js API routes at `/app/api/sushi/route.ts`

2. **Next.js API Routes → Express Backend**: The Next.js API routes act as a proxy and forward requests to the Express backend using the `NEXT_PUBLIC_SERVER_URL` environment variable

3. **Express Backend → MongoDB**: The Express server handles the requests and performs CRUD operations on the MongoDB database

### Example Request Flow:
```
Browser Request
    ↓
Next.js Page (http://localhost:3000/sushi)
    ↓
Next.js API Route (http://localhost:3000/api/sushi)
    ↓
Express Backend (http://localhost:4000/api/sushi)
    ↓
MongoDB Database
```

## API Endpoints

### Base URL: `http://localhost:4000/api/sushi`

- **GET** `/api/sushi` - Get all sushi items
- **GET** `/api/sushi/:id` - Get a specific sushi item by ID
- **POST** `/api/sushi` - Create a new sushi item
- **PUT** `/api/sushi/:id` - Update a sushi item
- **DELETE** `/api/sushi/:id` - Delete a sushi item

## Available Scripts

### Backend (MERN-BACKEND)
- `npm run dev` - Start development server with auto-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production server

### Frontend (MERN-FRONTEND)
- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm run lint` - Run ESLint

## Development Notes

- The backend uses **TypeScript** with auto-compilation and auto-reload via `nodemon` and `concurrently`
- The frontend uses **Next.js App Router** with server-side rendering
- Both applications are configured with TypeScript for type safety
- MongoDB ObjectId is used for document IDs
- API documentation is automatically generated using Swagger

## Troubleshooting

### Backend won't start
- Ensure MongoDB connection string in `.env` is correct
- Check if port 4000 is already in use
- Verify all dependencies are installed with `npm install`

### Frontend won't start
- Ensure backend is running first
- Check if port 3000 is already in use
- Verify environment variables in `.env.local`
- Clear Next.js cache: delete `.next` folder and restart

### Connection issues
- Verify `NEXT_PUBLIC_SERVER_URL` matches your backend URL
- Check browser console and terminal for error messages
- Ensure MongoDB Atlas IP whitelist includes your IP address
