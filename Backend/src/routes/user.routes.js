import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// when we hit the register route , before calling the registerUser , call the upload.fields method that is a middleware => for uploading file 

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1,
        },
        {
            name : "coverImage",
            maxCount : 1,
        }
    ]),
    registerUser
)

export default router;