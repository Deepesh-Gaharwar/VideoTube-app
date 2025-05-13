import { ApiError } from "../utils/APIError";
import { APiResponse } from "../utils/APIResponse";
import { asyncHandler } from "../utils/asyncHandler";


// health check 
const healthCheck = asyncHandler(async (req,res) => {
    
    try {

        // check database connectivity

    await mongoose.connection.db.admin().ping();

    // if the ping succeeds, respond with a 200 status 

    res
     .json(new APiResponse(
         200,
         {status: "OK", message: "Service is running and operational" }
     ))
        
    } catch (error) {
         throw new ApiError(500, error, "Database connection failed on healthCheck");
    }
})

export {
    healthCheck
}