import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model";
import { ApiError } from "../utils/APIError";
import { APiResponse } from "../utils/APIResponse";
import { asyncHandler } from "../utils/asyncHandler";


// toggle video like
const toggleVideoLike = asyncHandler(async(req,res) => {
   
    const {videoId} = req.params ;

    if(!isValidObjectId(videoId)){
        throw new ApiError(404, "Invalid video id provided");
    }

    
    try {

        // check if the user has already liked the video
        const existingLike = await Like.findOne (
            { 
                video : videoId, 
                likedBy : req.user._id
            } 
        );

        if(existingLike){

            await Like.deleteOne(
                {
                  _id : existingLike._id
                }
            ) ;

            res
             .status(200)
             .json(new APiResponse(
                200,
                null,
                "Like removed successfully"
             ));
        } else{
            
            // user has not liked the video, add the like
            const newLike = await Like.create(
                {
                  video : videoId,
                  likedBy : req.user._id
                }
            ) ;

            res
              .status(200)
              .json(new APiResponse(
                200,
                newLike,
                "Like added successfully"
              ));
        }
        
    } catch (error) {
        throw new ApiError(500, error, "Some error occurred while toggling video like: Try again later");
    }

}) ;


// toggle comment like
const toggleCommentLike = asyncHandler(async (req,res) => {
    
    const {commentId} = req.params ;

    if(!isValidObjectId(commentId)){
        throw new ApiError(404, "Invalid commentId");
    }

    try {
        
        // check if the user has already liked the comment

        const existingLike = await Like.findOne(
            {
                comment : commentId,
                likedBy : req.user._id
            }
        ) ;

        if(existingLike){
            // user has already liked the comment, remove the like

            await Like.deleteOne(
                {
                   _id : existingLike._id
                }
            ) ;

            res
             .status(200)
             .json(new APiResponse(
                200,
                null,
                "Like removed successfully"
             ));
        } else{
            // user has not liked the comment, add the like

            const newLike = await Like.create(
                { 
                    comment: commentId , likedBy:req.user._id 
                }
            );

             res
               .status(200)
               .json(new APiResponse(
                        200, 
                        newLike, 
                        "Like added successfully"
                        )
                    );
        }

    } catch (error) {
        throw new ApiError(500, error, "Some error occurred while toggling comment like: Try again later");
    }
})


// toggle tweet like
const toggleTweetLike = asyncHandler (async (req,res) => {
    
    const {tweetId} = req.params ;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(404, "Invalid tweetId provided: Provide a valid tweet id");
    }

    try {

        // check if the user has already liked the video 

        const existingLike = await Like.findOne({
            tweet : tweetId,
            likedBy : req.user._id
        }) ;

        if(existingLike){
            // user has already liked the tweet, remove the like

            await Like.deleteOne({
                 _id: existingLike._id 
            });

            res
              .status(200)
              .json(new APiResponse(
                200, 
                null, 
                "Like removed successfully"
            ));
        }else {
            // User has not liked the tweet, add the like

            const newLike = await Like.create({
                tweet : tweetId ,
                likedBy : req.user._id
            });

            res
              .status(200)
              .json(new APiResponse(
                  200, 
                  newLike, 
                  "Like added successfully"
            ));
        }
        
    } catch (error) {
        throw new ApiError(500, error, "Some error occurred while toggling tweet like: Try again later");
    }
})


// get all liked videos
const getLikedVideos = asyncHandler(async (req,res) => {
    
    try {
        
        const likedVideos = await Like.find(
            {
                video : {$ne : null},
                likedBy : req.user._id 
            }
        ) // find all liked videos so pass without any argument

        if(!likedVideos || likedVideos.length === 0){
            throw new ApiError(404, "No liked videos found")
        }

        res
       .status(200)
       .json(new APiResponse(200, likedVideos, "Liked videos fetched successfully")) ;

    } catch (error) {

       throw new ApiError(500, error, "Some error occured while getting liked videos") 
    }
})

// get all liked comments
const getLikedComments = asyncHandler(async(req,res) => {

    try {
        
         const likedComments = await Like.find(
            {
                comment : {$ne : null},
                likedBy : req.user._id
            }
         ) ;  // Find documents where the "comment" field is not empty
        

        if(!likedComments || likedComments.length === 0){
             throw new ApiError(404, "No liked comments found");
        } 

        res
          .status(200)
          .json(new APiResponse(
            200, 
            likedComments, 
            "Liked comments fetched successfully"
        ));

    } catch (error) {
        
        throw new ApiError(500, error, "Some error occurred while getting liked comments");
    }
})


// get all Liked tweets
const getLikedTweets = asyncHandler(async (req,user) => {

    try {
        
        const likedTweets = await Like.find(
            {
                tweet : {$ne : null},
                likedBy : req.user._id
            }
        ) ;  // Find documents where the "tweet" field is not empty

        if(!likedTweets || likedTweets.length === 0){
            throw new ApiError(404, "No liked tweets found");
        }

        res
          .status(200)
          .json(new APiResponse(
             200, 
             likedTweets, 
             "Liked tweets fetched successfully"
        ));

    } catch (error) {
        throw new ApiError(500, error, "Some error occurred while getting liked tweets");
    }
})


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    getLikedComments,
    getLikedTweets
}