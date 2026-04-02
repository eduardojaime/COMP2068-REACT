import User from "../models/user.js";
import jwt from "jsonwebtoken";
// register handle
// Expecting two fields in the body: username and password
export const register = async (req, res) => {
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ username: req.body.username });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        // Create new user
        // Password will be hashed/encrypted by passport-local-mongoose plugin when we call .register() method, which is provided by the plugin and takes care of hashing the password and saving the user to the database in one step
        const newUser = new User({ username: req.body.username });
        await newUser.setPassword(req.body.password);
        // Save user to database
        await newUser.save();
        // Return success response
        return res.status(201).json(newUser);
    }
    catch (error) {
        console.log("Error during registration:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
// login handle
export const login = async (req, res) => {
    try {
        // Check if user exists
        const user = await User.findOne({ username: req.body.username });
        // If not, return error
        if (!user) {
            return res.status(400).json({ message: "Invalid username or password" });
        }
        // If user exists, check if password is correct and return response accordingly
        const result = await user.authenticate(req.body.password);
        if (result.user) {
            const authToken = generateToken(user);
            setTokenCookie(res, authToken);
            return res.status(200).json({ message: "Login successful", token: authToken });
        }
        else {
            return res.status(400).json({ message: "Invalid username or password" });
        }
    }
    catch (error) {
        console.log("Error during login:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
// logout handle
export const logout = async (req, res) => {
    clearTokenCookie(res);
    console.log("User logged out");
    return res.status(200).json({ success: true, message: "Logout successful" });
};
// generateToken
const generateToken = (user) => {
    // JWT tokens have a payload section that contains info about the user
    const payload = {
        username: user.username
    };
    // define options for token using the interface provided by the jsonwebtoken library
    const jwtOptions = {
        expiresIn: "2h" // 2 hours
    };
    return jwt.sign(payload, process.env.PASSPORT_SECRET, jwtOptions);
};
// setTokenCookie
const setTokenCookie = (res, token) => {
    res.cookie("authToken", token, {
        httpOnly: true, // cookie cannot be accessed by client-side JavaScript, helps prevent XSS attacks
        secure: true, // cookie will only be sent over HTTPS, helps prevent highjacking attacks
        sameSite: "none", // allow cookie to be sent cross-site (from frontend to backend) 
    });
};
// clearTokenCookie
const clearTokenCookie = (res) => {
    res.clearCookie("authToken");
};
//# sourceMappingURL=users.controller.js.map