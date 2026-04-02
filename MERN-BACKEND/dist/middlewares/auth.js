import jwt from 'jsonwebtoken';
// Middleware to verify JWT token and continue processing the request if valid, otherwise return an error response
export const verifyToken = (req, res, next) => {
    const token = req.cookies?.authToken;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized Access" });
    }
    try {
        const decode = jwt.verify(token, process.env.PASSPORT_SECRET);
        req.user = { username: decode.username }; // attach user info to request object for use in subsequent middleware/route handlers
        next(); // token is valid, proceed to the next middleware/route handler
    }
    catch (error) {
        console.log("Error verifying token:", error);
        return res.status(401).json({ message: "Unauthorized Access" });
    }
};
//# sourceMappingURL=auth.js.map