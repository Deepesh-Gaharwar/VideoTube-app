import mongoose from "mongoose"
import { Video } from "../models/video.model"
import { Subscription } from "../models/subscription.model"
import { Like } from "../models/like.model"
import { ApiError } from "../utils/APIError"
import { APiResponse } from "../utils/APIResponse"
import { asyncHandler } from "../utils/asyncHandler"


// get the channel stats
const getChannelStats = asyncHandler(async (req,res) => {
     // get the channel stats like total video views,total subscribers, total videos,total likes etc...
     
     try {
        
        const channelStats = [];
        if(req.user){

            // no. of subscribers

            const subscription = await Subscription.find({channel : req.user._id}) // arr

            if(!subscription || subscription.length == 0){
               throw new ApiError(404, "Channel not found") 
            }

            const subscribers = subscription.map(subscription => subscription.subscriber) ;

            const numofSubscribers = subscribers.length ;

            channelStats.push(numofSubscribers);


            // no. of videos

            const videos = await Video.find({owner : req.user._id, isPublished : true}) // will return an arr

            let numofVideos = 0;

            if(!videos || videos.length === 0){
                channelStats.push(0);
            }else{
                numofVideos = videos.length ;

                channelStats.push(numofVideos);

                // no of views

                let totalViews = 0;

                const views = videos.map(views => totalViews = totalViews + views.view)

                channelStats.push(totalViews)
            }


            // no. of likes
            let videoLikes = 0;

            for(const video of videos){
                const likes = await Like.find({video :video._id})

                videoLikes += push(videoLikes) ;
            }

            channelStats.push(videoLikes);

            res 
              .status(200)
              .json(new APiResponse(200, `numOfSubscribers: ${channelStats[0]} ,
              numOfVideos : ${channelStats[1]} , numOfViews: ${channelStats[2]} , numOfLikes: ${channelStats[3]}`, "Channel Stats has been fetched successfully"))

        } else{

        throw new ApiError(403, "User not logged in : Login with channel official credentials")

       }

     } catch (error) {
        throw new ApiError(500, error, "Some error occurred while getting the channel stats: Please try again later")
     }
})


// get all the videos uploaded by the channel
const getChannelVideos = asyncHandler(async (req,res) => {

    try {
        
         let channelVideos ;

         if(req.user){
            channelVideos = await Video.find({owner : req.user._id})
         }

         if(!channelVideos || channelVideos.length === 0){
            throw new ApiError(404, `No videos exist for channel of user: ${req.user.username}`)
         }

         res
        .status(200)
        .json(new APiResponse(200, channelVideos, "Channel videos fetched successfully"))

    } catch (error) {
        throw new ApiError(404, error, "Some error occurred while fetching video your videos")
    }
    
})


export {
    getChannelStats,
    getChannelVideos
}