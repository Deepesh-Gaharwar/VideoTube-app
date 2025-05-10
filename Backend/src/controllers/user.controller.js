import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/APIError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { APiResponse } from "../utils/APIResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const generateAccessAndRefreshTokens = async(userId) => {

  try {
   const user = await User.findById(userId);
   const accessToken = user.generateAccessToken()
   const refreshToken = user.generateRefreshToken()

   user.refreshToken = refreshToken ;
   await user.save({validateBeforeSave : false});

   return {accessToken, refreshToken};
    
  } catch (error) {
     throw new ApiError(500, "Something went wrong while generating refresh and access tokens")
  }

}

// register user
const registerUser = asyncHandler(async (req,res) => {
 
// STEPS FOR REGISTER USER

    // get user details from frontend
    // validation -> not empty
    // check if user already exists : username,email
    // check for images -> check for avatar -> given required in user model
    // upload them to cloudinary, avatar-> avatar is required if not given db will be crashed as our user model
    // create user object -> create entry in DB
    // remove password and refresh token field from response
    // check for user creation -> not null
    // return response

 // 1. getting user details from frontend    
    const {fullname,email,username,password} = req.body

  //  console.log("email : ", email);

 // 2. VALIDATION 
    /* if(fullname === ""){
        throw new ApiError(400,"fullName is required")
     }
    */ 
    
    // Advance code for the above 
    if(
        [fullname,email,username,password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400,"fullName is required")
    }

  // 3. Check if user already exists 
    const existedUser = await  User.findOne({
        $or : [{ username }, { email }]
    }) ;

    if(existedUser){
        throw new ApiError(409, "User with email or username already exits")
    }
  // 4. check for images -> check for avatar  
    const avatarLocalPath = req.files?.avatar[0]?.path ;

  //  const coverImageLocalPath = req.files?.coverImage[0]?.path ;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
      coverImageLocalPath = req.files.coverImage[0].path ;
    }

    if(!avatarLocalPath){
         throw new ApiError(400, " Avatar file is required");
    }


  // 5. upload them to cloudinary, avatar 
   const avatar = await uploadOnCloudinary(avatarLocalPath);

   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

   if(!avatar){
      throw new ApiError(400, "Avatar file is required");
   }

  // 6. create user object -> create entry in DB 
    const user = await User.create({
       fullname,
       avatar : avatar.url,
       coverImage : coverImage?.url  || "",
       email,
       password,
       username : username.toLowerCase(),

    }) 
 
  // 7. remove password and refresh token field from response  

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    ) ;

  // 8. check for user creation -> not null
  if(!createdUser){
    throw new ApiError(500, " Something went wrong while registering the User") ;
  } 
  
  
  // 9. return response 
  // ham yhan direct createdUser return skte h -> but below is the best practice for returning the api response

  return res.status(201).json(
    new APiResponse(200, createdUser, "User registered successfully")
  )

})


// Login User
const loginUser = asyncHandler(async( req,res) => {

  // STEPS FOR LOGIN USER

   // 1. req body -> data le aao
   // 2. username or email ->in which from these you want to give the access
   // 3. find the user based on the above
   // 4. password check if you find the user
   // 5. access and refresh token
   // 6. send secure cookies
   // 7. send response

  // 1. req body -> data le aao
     const {email,username,password} = req.body ;
     
     if(!username && !email){
      throw new ApiError(400, " username or email is required")
     }
  
  // 3. find the user based on username and email
    const user = await User.findOne({
       $or : [{ username }, { email }]
     }) 
  // if you dont find the user , then it is not registered
    if(!user){
      throw new ApiError(400, "user does not exists")
    }
  // 4. password check if user is exists
  
    const isPasswordValid = await user.isPasswordCorrect(password) ;

    if(!isPasswordValid){
      throw new ApiError(401, "Invalid user credentials")
    }

  // 5. if password is also true -> generate access and refresh token

 const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

  // 6. send secure cookies

 const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  // options designed for cookies 
    const options = {
      httpOnly : true,
      secure : true
    }

  
   return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken ,options)
    .json(
      new APiResponse(
        200,
        {
          user : loggedInUser, accessToken,refreshToken
        },
        "User logged in Successfully"
      )
    );
}) ;

const logoutUser = asyncHandler( async(req,res) => {
  // clear cookies
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set : {
        refreshToken : undefined
      }
    },
    {
      new : true
    }
  )

  const options = {
    httpOnly : true,
    secure : true
  }

  return res.status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken",options)
  .json(new APiResponse(200, {}, "User logged out Successfully"))
})



// Refresh Access Token End-point

const refreshAccessToken = asyncHandler(async(req,res) => {
  const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken ;

  if(!incomingRefreshToken){
    throw new ApiError(401, "Unauthorised request")
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
  
    const user = await User.findById(decodedToken?._id);
     
    if(!user){
      throw new ApiError(401, "invalid Refresh Token")
    }
  
   // verification of incoToken coming directly from the user and the stored token in the DB  
    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401, " Refresh Token is expired or used")
    }
  
     const options = {
      httpOnly : true,
      secure : true
     }
  
    const {accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(user._id);
  
    return res
     .status(200)
     .cookie("accessToken" , accessToken, options)
     .cookie("refreshToken", newRefreshToken, options)
     .json(
      new APiResponse(
        200,
        {accessToken, refreshToken : newRefreshToken},
  
        "Access Token Refreshed Successfully  "
      )
     )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
  }

})


// change the current password/user 
const changeCurrentUser = asyncHandler(async(req,res) => {

  const {oldPassword, newpassword} = req.body ;

 const user = User.findById(req.User?._id) ;

 const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

 if(!isPasswordCorrect){ 
  throw new ApiError(400, "invalid Old password");
 }

 user.password = newpassword ;

 await user.save({validateBeforeSave : false})

  
  return res
  .status(200)
  .json(new APiResponse(200,{},"Password changed Successfully"))

})


// get the current user
const getCurrentUser = asyncHandler(async(req,res) => {

  return res
  .status(200)
  .json(new APiResponse(
    200,
    req.user, 
    "Cureent user fetched successfully"))
})


// update account details

const updateAccountDetails = asyncHandler(async (req,res) => {
  
   const {fullname,email } = refreshAccessToken.body ;

   if(!fullname || !email){
    throw new ApiError(400, "All fields are required")
   }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set : {
        fullname,
        email : email ,
      }
    },
    {new : true}
  ).select("-password")

  return res
   .status(200)
   .json(new APiResponse(200, user, "Account details updated successfully"))
})


// update user avatar
const updateUserAvatar = asyncHandler(async(req, res) => {
 const avatarLocalPath = req.file?.path

 if(!avatarLocalPath){
   throw new ApiError(400, "Avatar file is missing")
 }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if(!avatar.url){
       
    throw new ApiError(400, "Error while uploading on avatar")
  }

  const user = await User.findByIdAndUpdate(req.user?._id, 
    {
      $set : {
        avatar : avatar.url
      }
    },
    {new : true}
  ).select("-password")

  return res
    .status(200)
    .json(
      new APiResponse(200, user, "Avatar image updated Successfully")
    )
})


// update user cover image
const updateUserCoverImage = asyncHandler(async(req, res) => {
 const coverImgLocalPath = req.file?.path

 if(!coverImgLocalPath){
   throw new ApiError(400, "Cover Image file is missing")
 }

  const coverImage = await uploadOnCloudinary(coverImgLocalPath);

  if(!coverImage.url){
       
    throw new ApiError(400, "Error while uploading on cover image")
  }

  const user = await User.findByIdAndUpdate(req.user?._id, 
    {
      $set : {
        avatar : coverImage.url
      }
    },
    {new : true}
  ).select("-password")

  return res
    .status(200)
    .json(
      new APiResponse(200, user, "cover image updated Successfully")
    )
})


// get the user channel profile
const getUserChannelProfile = asyncHandler(async (req,res) => {

  const {username} = req.params ;

  if(!username?.trim()){
        throw new ApiError(400, "Username is missing")
  }

//aggregation pipelines
  const channel = await User.aggregate([
    {
      $match : {
        username : username?.toLowerCase()
      }
    }, 
    {
      $lookup : {
        from : "subscriptions",
        localfield : "_id",
        foreignField : "channel",
        as : "subscribers"
      }
    },
    {
      $lookup : {
        from : "subscriptions",
        localfield : "_id",
        foreignField : "subscriber",
        as : "subscribedTo"
      }
    },
    {
      $addFields : {
        subscribersCount : {
          $size : "$subscribers"

        },
        channelsSubscribedToCount : {
          $size : "$subscribedTo"
        },

        isSubscribed : {
          $cond : {
             if : {$in : [req.user?._id , "$subscribers.subscriber"]},
             then : true,
             else : false
          }
        }
      }
    },

    {
      $project :{
        fullname : 1,
        username : 1,
        subscribersCount : 1,
        channelsSubscribedToCount : 1,
        isSubscribed : 1,
        avatar : 1,
        coverImage : 1,
        email : 1,
      }
    }
  ])

  if(!channel?.length){
    throw new ApiError(404, "Channel does not exists")
  }

  return res
  .status(200)
  .json(
    new APiResponse(200, channel[0], "User Channel fetched successfully")
  )

})


// get watch history 

const getWatchHistory = asyncHandler(async (req,res) => {
   const user  = await user.aggregate([
    {
      $match : {
        _id : new mongoose.Types.ObjectId(req.user._id) 
      }
    },
    {
      $lookup : {
         from : "videos",
         localfield : "watchHistory",
         foreignField : "_id",
         as : "watchHistory",
         pipeline : [
          {
            $lookup : {
              from : "users",
              localfield : "owner",
              foreignField : "_id",
              as : "owner",
              pipeline :[
                {
                  $project : {
                    fullname : 1,
                    username : 1,
                    avatar : 1,
                    
                  }
                }
              ]
            }
          },
          {
            $addFields : {
              owner : {
                $first : "$owner"
              }
            }
          }
         ]
      }
    }
   ])

   return res
    .status(200)
    .json(
      new APiResponse(
        user[0].watchHistory,
        "watch history fetched successfully"
      )
    )
})
 
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentUser,
  getCurrentUser,
  updateUserCoverImage,
  updateUserAvatar,
  updateAccountDetails,
  getUserChannelProfile,
  getWatchHistory,
}; 