import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    profileCreation,
    updateProfile,
    uploadProfilePic,
} from "../controllers/profile.controllers.js";

const router = Router();

router.route("/create").post(verifyJWT, profileCreation);
router.route("/uploadProfile").patch(verifyJWT, uploadProfilePic);
router.route("/update").patch(verifyJWT, updateProfile);

export default router;
