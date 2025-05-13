import mongoose, {isValidObjectId} from "mongoose";
import { User } from "../models/user.model";
import { Subscription } from "../models/subscription.model";
import { ApiError } from "../utils/APIError";
import { APiResponse } from "../utils/APIResponse";
import { asyncHandler } from "../utils/asyncHandler";



// create subscription document -> channel
const createChannel = asyncHandler(async(req,res) => {

    const {userId} = req.params ;

    if(!isValidObjectId(userId)){
        throw new ApiError(404, "Invalid channel id :Try with valid id")
    }

    try {

        const createdUserChannel = await Subscription.create(
            {
                channel : userId,
                subscriber :null
            }

        );

        if(!createdUserChannel){
            throw new ApiError(404, "Couldn't create channel subscription")
        }

        res
          .status(201)
          .json(new APiResponse(
            201,
            createdUserChannel,
            "Your Videotube channel has been created successfully : "
          ))
        
    } catch (error) {
        
         throw new ApiError(500, error, "Something went wrong while creating your subscription")
    }
})


// toggle subscription
const toggleSubscription = asyncHandler(async (req,res) => {
    const {channelId} = req.params ;

    if(!isValidObjectId(channelId)){
        throw new ApiError(404, "Enter valid channel_Id to toggle subscription")
    }

    try {

        const subscription = await Subscription.findOne(
            {
                _id : channelId
            }
        )

        if(!subscription){
            throw new ApiError(404, "Could not find channel for toggling subscription")
        }


        if(subscription.channel.toString() === req.user._id.toString()){
            throw new ApiError(404, "You can not toggle subscription of  your own channel")
        }

        if(req.user && subscription.subscriber){
            subscription.subscriber = null ;
            await subscription.save();

            res
             .status(200)
             .json(new APiResponse(
                200,
                subscription,
                "Subscription toggled successfully"
             ))

        } else if(req.user){
            subscription.subscriber = req.user._id ;
            await subscription.save();

            res
             .status(200)
             .json(new APiResponse(
                200,
                subscription,
                "Subscription toggled successfully"
             ))
        }else {
            throw new ApiError(403, "User not authenticated")
        }
        
    } catch (error) {

        throw new ApiError(500, error, "Something went wrong while toggling your subscription: Try again later")
        
    }

})


//  controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params ;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(404, "Tyr againn with valid channel id")
    }

    try {

        const channelSubcriptions = await Subscription.find(
            {
                channel :channelId
            }
        )

        if(!channelSubcriptions || channelSubcriptions.length === 0){
            throw new ApiError(404, "No such channel exists")
        }


        const subscriberIds = channelSubcriptions.map(subscription => subscription.subscriber) ; //this will return array

        res
         .status(200)
         .json(new APiResponse(
            200,
            subscriberIds,
            "Channel Subscriber fetched successfully"
         ))
        
    } catch (error) {

        throw new ApiError(500, error, "Something went wrong while getting subscribers :Please try again later")
        
    }
})


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params ;

    if(!isValidObjectId(subscriberId)){
        throw new ApiError(404, "Try again with a valid subscriber id")
    }


    try {

        const userSubscriptions = await Subscription.find(
            {
                subscriber : subscriberId
            }
        )

        if(!userSubscriptions || userSubscriptions.length === 0){
            throw new ApiError(404, "You have not subscribed to any channels")
        }

        const channelIds = userSubscriptions.map(subscription => Subscription.channel) // this will return an arr

        res
         .status(200)
         .json(new APiResponse(
            200,
            channelId,
            "Subscribed channels fetched successfully"
         ))
        
    } catch (error) {

        throw new ApiError(500, error, "Something went wrong while getting subscribers :Please try again later")
        
    }
})


export {
    createChannel,
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}