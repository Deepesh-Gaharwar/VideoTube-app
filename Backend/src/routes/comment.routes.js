import { Router } from "express";
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller"
import {verifyJWT} from "../middlewares/auth.middleware"

const router = Router();

router.use(verifyJWT) ; // apply verifyJWT middleware to all routes in this file

router.route("/:videoId").get(getVideoComments).post(addComment);

router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router ;