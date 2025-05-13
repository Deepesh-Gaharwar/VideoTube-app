import mongoose from "mongoose"
import { Comment } from "../models/comment.model"
import {ApiError} from "../utils/APIError.js"
import { APiResponse } from "../utils/APIResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


// get all comments for a video
const getVideoComments = asyncHandler(async(req,res) => {
    

    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    console.log("VideoId from request", videoId)

    if(!videoId){
        throw new ApiError(404, "Enter valid videoid to find comments")
    }

    try {

        const videoComments = await Comment.find( {video : videoId}).skip((page-1)*limit).limit(limit).exec();

        if(!videoComments || videoComments.length == 0){
            throw new ApiError(404, "Could not find comments for this specified video")
        }

        res 
         .status(200)
         .json(new APiResponse(200,videoComments, "All comments fetched successfully"));
        
    } catch (error) {
        throw new ApiError(500, error, "Couldn't find video comments")
    }
})


// add a comment to a video
const addComment = asyncHandler(async(req,res) => {
    
    // extracting video ID from request parameters
    const {videoId} = req.params ;

    // extracting comment content from request body
    const {commentContent} = req.body ;

    console.log("video id and comment : ", videoId,  commentContent);

    if(!(videoId || commentContent)){
        throw new ApiError(404, "Invalid videoId or you have not written any comment");
    }


    try {

        const newComment = await Comment.create({
            content : commentContent,
            video : videoId,
            owner : req.user._id // Assuming user is authenticated and their ID is in req.user._id
        }) ;

        if(!newComment){
            throw new ApiError(500, "Cannot add a comment to video");
        }


        res
          .status(200)
          .json(new APiResponse(200, newComment, "Comment added successfully")) ;
        
    } catch (error) {
        
        throw new ApiError(500, error, "Some error occurred while adding comment");
    }

})


// update a comment
const updateComment = asyncHandler(async(req,res) => {

    const {commentId} = req.params ;
    const {newComment} = req.body ;

    console.log("Comment and comment id",newComment ,commentId)

    if(!(commentId || newComment)){
        throw new ApiError(404, "Invalid commentId : can not update empty");
    }


    try {

        const updatedComment = await Comment.findByIdAndUpdate(commentId,
            {
                content : newComment
            },
            {
                new : true,
                validateBeforeSave : false
            }
        )

        console.log("Comment updated", updatedComment) ;

        res
          .status(200)
          .json(new APiResponse(200, updatedComment, "Comment updated successfully"))
        
    } catch (error) {
        throw new ApiError(500, error, "Some error occurred while updating comment");
    }
     
})


// delete a comment
const deleteComment = asyncHandler(async(req,res) => {
    
    const {commentId} = req.params ;

    console.log("CommentId", commentId);

    if(!commentId){
        throw new ApiError(404, "Enter Comment Id to delete comment")
    }

    try {

        const comment = await Comment.findById({
            _id : commentId
        })

        if(!comment){
            throw new ApiError(404, "comment not found : See if comment id is correct")
        }

        if(comment.owner.toString() !== req.user._id.toString()){

             throw new ApiError(403, "You are not allowed to delete this comment")
        }

        const deletedComment = await Comment.findByIdAndDelete(commentId);

        if(!deleteComment){
            throw new ApiError(500, "Comment could not deleted: try again")
        }

        res 
          .status(200)
          .json(new APiResponse(200, deletedComment, "Comment deleted successfully")) ;
        
    } catch (error) {
        
        throw new ApiError(500, "An error occured while deleting your comment: please try again later")
    } 

})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}