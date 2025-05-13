import mongoose, {isValidObjectId} from "mongoose"
import { Playlist } from "../models/playlist.model"
import { ApiError } from "../utils/APIError"
import { APiResponse } from "../utils/APIResponse"
import { asyncHandler } from "../utils/asyncHandler"


// create playlist
const createPlaylist = asyncHandler(async (req,res) => {
  
    const {playlistName, description} = req.body ;

    if(!playlistName){
        throw new ApiError(404, "Name of playlist is required")
    }

    try {

        const newPlaylist = await Playlist.create(
            {
                name : playlistName,
                description : description || "Playlist description",
                videos : [],
                owner : req.user._id
            }
        ) ;

        if(!newPlaylist){
            throw new ApiError(404, "Could not create playlist with info:")
        }


        res
          .status(201)
          .json(new APiResponse(
            201,
            newPlaylist,
            "Playlist created successfully"
        )) ;

    } catch (error) {
        throw new ApiError(500, error, "An error while creating playlist : try again later")
    }

})


// get User playlists
const getUserPlaylists = asyncHandler(async (req,res) => {

    const {userId} = req.params ;

    if(!isValidObjectId(userId)){
        throw new ApiError(404, "Invalid user id provided for user playlist")

    }

    try {

        const userPlaylists = await Playlist.find(
            {
                owner : userId
            }
        ) ;

        if(!userPlaylists || ! userPlaylists.length === 0){
            throw new ApiError(404, `No playlists exist for user ${userId}`) 
        }

        res  
          .status(200)
          .json(new APiResponse(
              200,
              userPlaylists,
              "User playlist fetched successfully"
          ))
        
    } catch (error) {
         throw new ApiError(500, error, "An error while fetching user playlists : try again later")
    }
})


// get playlist by id
const getPlaylistById = asyncHandler(async (req,res) => {
    const {playlistId} = req.params ;

    if(!isValidObjectId(playlistId)){
        throw new ApiError(404, "Inavalid playlist id is provided : enter valid id to get playlist")
    }


    try {

        const playlist = await Playlist.findById(playlistId);

        if(!playlist){
            throw new ApiError(404, "No playlist found")
        }

        res
          .status(200)
          .json(new APiResponse(
             200,
             playlist,
             "Playlist has been fetched successfully"
          ))
        
    } catch (error) {
        throw new ApiError(500, error, "An error while getting playlist by id : try again later")
    }
})


// add video to playlist
const addVideoToPlaylist = asyncHandler(async (req,res) => {
    const {playlistId, videoId} = req.params ;

    if(!isValidObjectId(playlistId) || isValidObjectId(videoId)){
        throw new ApiError(404, "Enter valid playlistId and videoId to add video in playlist")
    }

    try {

        // check if the video is already in the playlist

        const playlist = await Playlist.findById(playlistId) ;

        if(!playlist){
            throw new ApiError(404, "Playlist not found");
        }

      // check if the video is already present in the playlist's videos arr
      
      if(playlist.videos.includes(videoId)){
        // video already exists in the playlist, send success response with the playlist

        return res
                 .status(200)
                 .json(new APiResponse(
                       200,
                       playlist,
                       "Video already in playlist"
                 )) ;
      }


      // add the video to the playlist's videos arr

      const videoAddedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push : {
                videos : videoId
            }
        }, // using $push to add videoId to the videos arr
        {
            new : true,
            validateBeforeSave : false
        }
      ) ;


      if(!videoAddedPlaylist || videoAddedPlaylist.length === 0){
        throw new ApiError(404, "No videos to add in playlist")
      }

      res
        .status(200)
        .json(new APiResponse(
             200,
             videoAddedPlaylist,
             "Video added to playlist successfully"
        ))
        
    } catch (error) {

        throw new ApiError(500, error, "An error occured while adding video in playlist: please try again later")
    }
})


// remove video from playlist
const removeVideoFromPlaylist = asyncHandler(async (req,res) => {
     const {playlistId, videoId} = req.params ;

     if(!(playlistId || videoId)){
        throw new ApiError(404, "Invalid video or playlist id : Enter valid ids")
     }


     try {

        const playlistWithoutVideo = await Playlist.findOne(
            {
                _id : playlistId,
                videos : videoId
            }
        ) ;

        if(!playlistWithoutVideo){
            throw new ApiError(404, "Video does not exist in playlist or playlist was not created")
        }

        // remove video from the playlist
        const indexOfVideoToBeRemoved = playlistWithoutVideo.videos.indexOf(videoId);

        if(indexOfVideoToBeRemoved > -1){
            playlistWithoutVideo.videos.splice(indexOfVideoToBeRemoved, 1);
        }

        // save the modified playlist
        await playlistWithoutVideo.save();

        res
          .status(200)
          .json(new APiResponse(
            200,
            playlistWithoutVideo,
            "Video is removed from playlist"
          ))
         
     } catch (error) {
        
        throw new ApiError(500, error, "An error occured while removing video from playlist")
     }


}) 



//  delete playlist
const deletePlaylist = asyncHandler(async (req,res) => {
    const {playlistId} = req.params ;

    if(!isValidObjectId(playlistId)){
        throw new ApiError(404, "Invalid playlistId to delete playlist") 
    }

    try {

        const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

        if(!deletedPlaylist){
            throw new ApiError(404, "Playlist not found to delete");
        }

        res 
         .status(200)
         .json(new APiResponse(
            200,
            deletedPlaylist,
            "Playlist deleted successfully"
         ))
        
    } catch (error) {

        throw new ApiError(500, error, "An error occurred while deleting playlist")
    }
})


//  update playlist 
const updatePlaylist = asyncHandler(async (req,res) => {
    const {playlistId} = req.params ;
    const {name,description} = req.body ;

    if(!isValidObjectId(playlistId)){
       throw new ApiError(404, "Invalid playlistId: Please provide a valid playlistId"); 
    }

    if(!name){
        throw new ApiError(404, "Name is required to update the playlist");
    }


    try {

       const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name : name,
            description : description
        },
        {
            new : true,
            validateBeforeSave :false
        }
       ) 

       if(!updatedPlaylist){
          throw new ApiError(404, "Could not fund Playlist to update")
       }
        
        res
         .status(200)
         .json(new APiResponse(
            200,
            updatedPlaylist,
            "Playlist updated"
         ))

    } catch (error) {
        
        throw new ApiError(500, 'An error occurred while trying to update the playlist')
    }
})


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}