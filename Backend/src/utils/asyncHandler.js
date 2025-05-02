// These are two methods for async handler

// 1 
const asyncHandler = (requesthandler) => {
    (req,res,next) => {
        Promise.resolve(requesthandler(req,res,next)).catch((err) => next(err))
    }
}

export {asyncHandler};



/* 2
const asyncHandler = () => {}
const asyncHandler = (func) => () => {}
const asyncHandler = (func) => async () => {}
*/

/*
const asyncHandler = (func) => async (err,req,res,next) => {
    try {
        await func(err,req,res,next) 
        
    } catch (error) {
        res.status(err.code || 500).json({
            success: false,
            message : err.message
        })
        
    }
}

*/

 