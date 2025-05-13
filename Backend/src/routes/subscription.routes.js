import { Router } from 'express';
import {
    createChannel,
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
    
} from "../controllers/subscription.controller.js"
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(verifyJWT); // apply verifyJWT middleware to all routes in this file

router.route("/create/c/:userId").post(createChannel) ;

router.route("/c/:channelId").get(getUserChannelSubscribers) ;

router.route("/toggle/c/:channelId").post(toggleSubscription);

router.route("/u/:subscriberId").get(getSubscribedChannels)  ;

export default router ;