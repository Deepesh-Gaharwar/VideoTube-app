import mongoose, {isValidObjectId} from "mongoose"
import { Video } from "../models/video.model"
import { User } from "../models/user.model"
import { Comment } from "../models/comment.model"
import { Like } from "../models/like.model"
import { ApiError } from "../utils/APIError"
import { APiResponse } from "../utils/APIResponse"
import { asyncHandler } from "../utils/asyncHandler"
import { uploadOnCloudinary,deleteOnCLoudinaryVideo,deleteOnCloudinaryImage } from "../utils/cloudinary"
import {v2 as Cloudinary} from "cloudinary"



// get all the videos
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType} = req.query

    const userId = req.user._id ;

    if(!(query || isValidObjectId(userId))){
        throw new ApiError(400, "Required field : query or userId")
    }

    try {

        // parse page and limit parameters
        const pageNumber = parseInt(page);
        const pageLimit = parseInt(limit);

        // Calculate the skip value for pagination
        const skip = (pageNumber -1) * pageLimit ;

        // creating pipelines

        let pipeline = [
            {
                $match : {
                    $or : [
                        { title : { $regex : query , $options : "i"}},
                        {description : { $regex : query , $options : "i"}},
                        {owner : new mongoose.Types.ObjectId(userId)}
                    ]
                } //This stage matches documents based on the specified criteria: matching the title or description fields using case-insensitive regular expressions ($regex), or matching the owner field with the provided userId
            },

            {
                $lookup : {
                    from : "users",
                    localField : "owner",
                    foreignField : "-id",
                    as : "ownerDetails",

                    pipeline : [
                        {
                            $project : {
                                username : 1,
                                fullname : 1,
                                avatar : 1,
                                coverImage : 1,
                                email : 1,
                            }
                        },
                        {
                            $addFields : {
                                ownerDetails : {
                                    $first : "$ownerDetails"
                                }
                            }
                        }
                    ],
                } //This stage performs a left outer join with the "users" collection.It adds a new field to each document called "owner", which contains the details of the user who owns the video.The localField specifies the field from the current collection (Video) to match.The foreignField specifies the field from the "users" collection to match.The as option specifies the name of the field to add to each document.Overall, this pipeline is used to retrieve videos based on the provided query and include information about the owner of each video by performing a lookup operation with the "users" collection.
            },
            {
                $lookup : {
                    from : "comments",
                    localField : "_id",
                    foreignField : "video",
                    as : "commentsOnVideo",

                    pipeline : [
                        {
                            $project : {
                                content : 1,
                            },
                        },
                        {
                            $addFields : {
                                commentsOnVideo : "$commentsOnVideo"
                            }
                        }
                    ]
                } //This stage performs a left outer join with the "comments" collection.It adds a new field to each document called "comments", which contains the comments made on the video.The localField specifies the field from the current collection (Video) to match.The foreignField specifies the field from the "comments" collection to match.The as option specifies the name of the field to add to each document.Overall, this pipeline is used to retrieve videos based on the provided query and include information about the owner of each video by performing a lookup operation with the "users" collection
            },
            {
                $lookup  : {
                    from : "likes",
                    localField : "_id",
                    foreignField : "video",
                    as : "likesVideo",

                    pipeline : [
                        {
                            $project : {
                                tweet : 1,
                                likedBy : 1,
                                comment : 1,
                            },
                        },
                        {
                          $addFields : {
                            likesOnVideo : "$likesOnVideo" // all the likes on each video
                          }  
                        }
                    ]
                } // this stage performs a left outer join with likes
            },
            {
                $lookup : {
                    from : "playlists",
                    localField : "_id",
                    foreignField : "video",
                    as : "PlaylistsOnVideo",

                    pipeline : [
                        {
                            $project : {
                                title : 1,
                                description : 1,
                                owner : 1,
                            }
                        },
                        {
                            $addFields : {
                                PlaylistsOnVideo : "$PlaylistsOnVideo" // all the playlists on each video
                            }
                        }
                    ]
                } // this stage performs same things as above on playlis
            },
            {
                $sort : {
                    [sortBy] : sortType === "desc" ? -1 : 1,
                    createdAt : -1 // sort by createdAt in descending order as an option newest first
                } //sort by ascending (1) or descending (-1)order
            },
            {
                // skip documents for pagination
                $skip : skip
            },
            {
                $limit : pageLimit
            }
        ]

        if(!pipeline || pipeline.length === null){
            throw new ApiError(500, "Loading Failed : Please try again later")
        }

        const video = await Video.aggregate(pipeline) ;
        const videoAggregate = await Video.aggregatePaginate(pipeline);

        if(!(video || video.length == (0 || null))){
            throw new ApiError(500, "Failed to get all videos . Please try again later")
        }


        res
          .status(200)
          .json(new APiResponse(
            200,
            {video,videoAggregate},
            "Video aggregated and paginated retrieved successfully"
          ))
        
    } catch (error) {

        throw new ApiError(500,error, "Some error occurred while getting your video")
    }


    
})


// publish a video
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body

    if (!(title || description )) {
        throw new ApiError(400, "Required fileds: title and description")
    }


    const videoLocalPath = req.files?.videoFile[0]?.path ;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path ;

    if(!(videoLocalPath || thumbnailLocalPath)){
        throw new ApiError(400, "Video and thumbnail are required: please provide video and thumbanil")
    }

    try {

        const videoUploaded = await uploadOnCloudinary(videoLocalPath);

        const thumbnailUploaded = await uploadOnCloudinary(thumbnailLocalPath) ;

        if(!(videoUploaded.url && thumbnailUploaded.url)){
            throw new ApiError(400, "Video and thumbanil is required")
        }

        const newVideo = await Video.create(
            {
                title,
                description,
                duration : videoUploaded.duration ,
                videoFile : videoUploaded.url,
                thumbnail : thumbnailUploaded.url,
                isPublished : true,
                owner : req.user?._id // beacuse we have added user object through verifyJWT
            }
        );

        if(!newVideo){
            throw new ApiError(400, "Video couldn't be created")
        }

        const createdVideo = await Video.findById(newVideo._id);

        if(!createdVideo){
            throw new ApiError(500, "Video couldn't be created")
        }


        res
          .status(201)
          .json(new APiResponse(
             200,
             createdVideo,
             "Video uploaded successfully uploaded"
          ))
        
    } catch (error) {
        
        throw new ApiError(500,error, "Some error occurred while publishing video")
    }
    
})


// get a video by id
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params ;

    if(!videoId){
        throw new ApiError(400, "Please enter valid videoId")
    }

    try {
        
        const user = await User.findById(req.user._id);

        const video = await Video.findById(videoId);

        if(!video){
            throw new ApiError(404, "Video not found")
        }

        if(video.isPublished === false && video.owner.toString() !== user._id.toString()){
               
            throw new ApiError(403, "Video is not published")
        }


        const updateVideo = await Video.updateOne(
            {_id : videoId},
            {$inc : {view : 1}},
            {new : true, validateBeforeSave : false}
        )

        if(updateVideo.modifiedCount === 0){
            throw new ApiError(404, "Video not Found")
        }


        res
          .status(200)
          .json(new APiResponse(
            200,
            video,
            "Your required video"
          ))

    } catch (error) {
        
        throw new ApiError(500, "Some error occurred while getting your video by id")
    }
    
})


// update video
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params ;

    if(!videoId){
        throw new ApiError(400, "Invalid video id: Cannot update video")
    }

    const {title, description} = req.body ;

    const thumbnailLocalPath = req.file?.path ;

    if(!title || !description || !thumbnailLocalPath){
        throw new ApiError(400, "title, description and thumbnail are required ")
    }


    try {

        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

        if(!thumbnail.url){
            throw new ApiError(400, "Error while uploading thumbnail")
        }


        const deleteVideoThumbnail = await Video.findById(req.user?._id) ;

        if(deleteVideoThumbnail){
            await deleteOnCloudinaryImage(deleteVideoThumbnail.thumbnail);
        }


        const video = await Video.findByIdAndUpdate(
            videoId,
            {
                $set : {
                    title :title,
                    description : description ,
                    thumbnail : thumbnail.url || ""
                }
            },
            {new : true, validateBeforeSave : false}
        ) ;

        if(!video){
            throw new ApiError(404, "Video can not be updated")
        }


        res
          .status(200)
          .json(new APiResponse(
            200,
            video,
            "Video updated successfully"
          ))
        
    } catch (error) {

        throw new ApiError(500, "Error updating video: please try again later")
        
    }
    

})


// delete a video
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params ;

    if(!isValidObjectId(videoId) && !videoId?.trim()){
        throw new ApiError(404, "enter valid video id to know delete video")
    }


    // delete the video from cloudinary
    try {

        const video = await Video.findById(videoId);

        if(!video){
            throw new ApiError(404, "Video not found");
        }

        // for thumbnail 
        const thumbnailUrl = video.thumbnail // extract video url from video document

        const urlArrayOfThumbnail = thumbnailUrl.split("/"); // split the url into arr from every/ point

        const thumbnailFromUrl = urlArrayOfThumbnail[urlArrayOfThumbnail.length - 1] ; // extracting the video name with format

        const thumbnailName = thumbnailFromUrl.split(".")[0] // only name of thumbnail without any format


        // deleting video document from databse first then from cloudinary

        if(video.owner.toString() === req.user._id.toString()){

            const deleteResultFromDatabase = await Video.findByIdAndDelete(videoId) ;

            if(!deleteResultFromDatabase){
                throw new ApiError(404, "Video is already deleted from database")
            }

            await deleteOnCLoudinaryVideo(video.videoFile) ; // delete video file

            // delete from cloudinary
            await Cloudinary.uploader.destroy(
                thumbnailName,
                {invalidate : true,},

                (error,result) => {
                    console.log("result:", result, ", error:", error, "result or error after deleting thumbnail from cloudinary")
                }  
            ) ; // delete thumbnail

            const comments = await Comment.find(
                {video : deleteResultFromDatabase._id}
            ) ;

            const commentsIds = comments.map((comment) => comment._id) ; // taking out the commentId

            await Like.deleteMany({video : deleteResultFromDatabase}) ;

            await Like.deleteMany({comment : { $in : commentsIds}}) ; // deleting all comments of the video

            await Comment.deleteMany({video : deleteResultFromDatabase._id});
        } else {
            throw new ApiError(403, "You are not authorized to delete this video")
        }


        res
         .status(200)
         .json(new APiResponse(
            200,
            video,
            "Video deleted from database"
         ))
        
    } catch (error) {

         throw new ApiError(500, error, "Failed to delete video:Try again later");
        
    }
    
})


// toggle publish status
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId){
        throw new ApiError(404, "enter valid video id to know publish status")
    }

    const video = await Video.findById(videoId) ;

    if(!video){
        throw new ApiError(400, "Can not toggle publish status , Either video does no texist or already deleted")
    }

    video.isPublished = !video.isPublished ;

    await video.save({validateBeforeSave : false})

    res
     .status(200)
     .json(new APiResponse(
        200,
        videoId,
        "Video status is toggled successfully"
     ))
})



export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}