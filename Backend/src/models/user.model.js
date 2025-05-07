import mongoosee, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username : {
            type :  String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
            index : true,
        },
       email : {
            type :  String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
        },
        fullname : {
            type :  String,
            required : true,
            trim : true,
            index : true,
        },
        avatar : {
            type : String , // cloudinary url
            required : true,

        },
        coverImage : {
            type : String , // cloudinary url

        },
        watchHistory : [
            {
                type : Schema.Types.ObjectId,
                ref : "Video",
            }
        ],
        password : {
            type : String ,
            required : [true, "Password is required"]
        },
        refreshToken : {
            type : String,
        }

    },

    {
        timestamps : true,
    }
);

// takes some time and also cpu => so we wrap in async => callback m nahi likhna -> because this ka reference nahi hota h callbacks m , see the function after save event below
userSchema.pre("save",async function (next) { // hm this.password => wala if condition m hi wrap up kr skte h -> it just the style of writing your logic => it doesnot signifies anything

// if not modified the current password -> then abhio call krdo next()    
    if(!this.isModified("password")) return next();

// if modified then first encrypt the password -> then call the next()
    this.password = await bcrypt.hash(this.password, 10)
        next()
} )


userSchema.methods.isPasswordCorrect = async function (password) { // (current pass, encrypted pass) => compare method
  return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function (){
  return  jwt.sign( // current , or 2nd db se aarha h
        {
            _id : this._id,
            email : this.email,
            username : this.username,
            fullname : this.fullname,
        },

        process.env.ACCESS_TOKEN_SECRET,

        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }

        
    )
}

userSchema.methods.generateRefreshToken = function (){
    return  jwt.sign( // current , or 2nd db se aarha h
        {
            _id : this._id,

        },

        process.env.REFRESH_TOKEN_SECRET,

        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }

        
    )
}

export const User = mongoosee.model("User", userSchema);

