import express from "express";
import sushiRouter from "./routes/sushi.routes.js";
import userRouter from "./routes/users.routes.js";
import { connectToDatabase } from "./services/database.service.js";
import morgan from "morgan";
// Swagger setup
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
// Passport and session setup
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";
// Login/Registration using passport local (username/password)
import User from "./models/user.js";
// API calls from Frontend after user logs in (JWT token in header)
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
// Protect routes with JWT token verification
import { verifyToken } from "./middlewares/auth.js";


const app = express();
const port = 4000;
// Swagger Configuration
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: { title: "Sushi API", version: "1.0.0" },
  },
  apis: ["./src/routes/*.ts"],
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
//middleware
// 'dev' gives a color-coded output: :method :url :status :response-time ms
app.use(morgan("dev"));

// Middleware: lets us read JSON bodies
app.use(express.json());

// Cookie handler
app.use(cookieParser());
// configure CORS to allow credentials
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  methods: "GET,POST,PUT,DELETE",
  credentials: true, // allow cookies to be sent
  allowedHeaders: "Content-Type,Authorization",
}));
// Session and Base Passport Configuration
app.use(session({
  secret: process.env.PASSPORT_SECRET || "defaultsecret",
  resave: true,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
// Configure Local Strategy (coming from User model via PLM)
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// Configure JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // look for token in Authorization header
  secretOrKey: process.env.PASSPORT_SECRET || "defaultsecret", // same secret as session so that it matches when we generate tokens
}
// Define middleware logic, what happens when a request comes in with a JWT token in the header? 
// We want to verify that the user exists and is valid, then allow the request to proceed
const jwtStrategy = new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
  try {
    const user = await User.findById(jwt_payload.id);
    if (user) {
      return done(null, user); // user exists, pass request to the next middleware/route handler
    }
    return done(null, false); // no user found
  } catch (error) {
    return done(error, false); // error or invalid
  }
});
passport.use(jwtStrategy);

connectToDatabase()
  .then(() => {
    // Protects all sushi routes with JWT token verification middleware, user must be logged in and provide a valid token to access any sushi route
    app.use("/api/sushi", verifyToken, sushiRouter);
    app.use("/api/users", userRouter);

    app.listen(port, () => {
      console.log(`Server started at http://localhost:${port}`);
    });
  })
  .catch((error: Error) => {
    console.error("Database connection failed", error);
    process.exit();
  });

// mount sushi routes
//app.use("/api/sushi", sushiRouter);

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });
