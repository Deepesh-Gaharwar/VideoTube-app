import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/APIError.js"
import { User } from "../models/user.model.js";
import { uploaduploadOnCloudinary } from "../utils/cloudinary.js"
import { APiResponse } from "../utils/APIResponse.js";

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
    const {fullname,email,username,passsword} = req.body

    console.log("email : ", email);

 // 2. VALIDATION 
    /* if(fullname === ""){
        throw new ApiError(400,"fullName is required")
     }
    */ 
    
    // Advance code for the above 
    if(
        [fullname,email,username,passsword].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400,"fullName is required")
    }

  // 3. Check if user already exists 
    const existedUser =  User.findOne({
        $or : [{ username }, { email }]
    }) ;

    if(existedUser){
        throw new ApiError(409, "User with email or username already exits")
    }
  // 4. check for images -> check for avatar  
    const avatarLocalPath = req.files?.avatar[0]?.path ;

    const coverImageLocalPath = req.files?.coverImage[0]?.path ;

    if(!avatarLocalPath){
         throw new ApiError(400, " Avatar file is required");
    }


  // 5. upload them to cloudinary, avatar 
   const avatar = await uploaduploadOnCloudinary(avatarLocalPath);

   const coverImage = await uploaduploadOnCloudinary(coverImageLocalPath);

   if(!avatar){
      throw new ApiError(400, "Avatar file is required");
   }

  // 6. create user object -> create entry in DB 
    const user = await User.create({
       fullname,
       avatar : avatar.url,
       coverImage : coverImage?.url  || "",
       email,
       passsword,
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

export {registerUser}; 