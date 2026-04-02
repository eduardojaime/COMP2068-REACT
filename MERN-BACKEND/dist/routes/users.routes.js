import { Router } from "express";
import { register, login, logout } from "../controllers/users.controller.js";
const router = Router();
// Define routes: PATH + MIDDLEWARE (CONTROLLER FUNCTION)
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
export default router;
//# sourceMappingURL=users.routes.js.map