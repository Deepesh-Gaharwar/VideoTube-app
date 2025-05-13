import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweets.model"
import { User } from "../models/user.model"
import { ApiError } from "../utils/APIError"
import { APiResponse } from "../utils/APIResponse"
import { asyncHandler } from "../utils/asyncHandler"


// create tweet
const createTweet = asyncHandler(async (req, res) => {
    
    const {tweetToBeCreated} = req.body ;

    if(!tweetToBeCreated){
       throw new ApiError(404, "No tweet created by user") 
    }

    try {

        const createdTweet = await Tweet.create(
            {
                content : tweetToBeCreated ,
                owner : req.user._id
            }
        );

        if(!createdTweet){
            throw new ApiError(500, "Tweet could not be created")
        }

        res
         .status(200)
         .json(new APiResponse(
            200,
            createdTweet,
            "Tweet created successfully"
         ))
        
    } catch (error) {

        throw new ApiError(500, error, "Error creating tweet")
        
    }
})


// get the user tweets
const getUserTweets = asyncHandler(async (req, res) => {

    const {userId} = req.params ;

    if(!(userId || isValidObjectId(userId))){
        throw new ApiError(404, "Enter user id to get user tweets") ;
    }

    try {

        const userTweets = await Tweet.find(
            {
                owner : userId
            }
        ).exec();

        if(!(userTweets || userTweets.length === 0)){
            throw new ApiError(500, `Can not fetch user ${userId} tweets at thid moment : try again later`)
        }

        res
          .status(200)
          .json(new APiResponse (
            200,
            userTweets,
            "User Tweets fetched Successfully"
          ))
        
    } catch (error) {

        throw new ApiError(500, error, "Could not fetch user tweets at thid moment")
        
    }
    
})


// update tweet
const updateTweet = asyncHandler(async (req, res) => {

    const {tweetId} = req.params ;
    const {tweet} = req.body ;

    if(!(tweet || tweetId)){
       throw new ApiError(403, "tweet or tweet_Id is not provided")
    }

    try {

        const existingTweets = await Tweet.findOne(
            {
                _id : tweetId,
                owner : req.user._id
            }
        );

        if(!existingTweets){
           console.log(existingTweets, "not auhtenticated user")
             throw new ApiError(401, `Tweet not found u can not update this: ${req.user.username} :tweet`) 
        }


        const updateTweet = await Tweet.findByIdAndUpdate(
            tweetId,
            {
                content : tweet
            },
            {
                new : true,
                validateBeforeSave : false
            }
        )

        if(!updateTweet){
            throw new ApiError(403, "Something went wrong")
        }

        res 
          .status(200)
          json(new APiResponse (
            200,
            updateTweet,
            "Tweet has been updated"
          ))
        
    } catch (error) {
        throw new ApiError(500, error, "Error updating tweet : Try again later")
    }
    
})


// delete tweet
const deleteTweet = asyncHandler(async (req, res) => {

    const {tweetId} = req.params ;

    if(!tweetId){
        throw new ApiError(404,"Enter tweet_Id tp delete tweet")
    }

    try {

        if(!isValidObjectId(tweetId)){
            throw new ApiError(404,"Invalid tweet_Id :Enter valid tweet_Id")
        }

        const tweet = await Tweet.findById(tweetId);

        if(!(tweet || (tweet.owner.toString() !== req.user._id.toString()))){
            throw new ApiError(403, "You can not delete this tweet")
        }


        const deleteTweet = await Tweet.deleteOne(
            {
                _id : tweetId
            }
        );

        if(!deleteTweet){
            throw new ApiError(500, "Delete tweet failed")
        }

        res 
          .status(200)
          .json(new APiResponse(
            200,
            deleteTweet,
            "Your tweet has been deleted"
          ))
        
    } catch (error) {

         throw new ApiError(500, error, "Something went wrong while deleting your tweet :Try again")
        
    }
    
})


export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}