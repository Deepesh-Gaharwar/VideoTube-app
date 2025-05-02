// require('dotenv').config({path : './env'}) // -> from this , code also runs fine -> but not a good practice, code consistency khraab kr rha h 
import dotenv from "dotenv" 
import connectDB from "./DB/db.js";

dotenv.config({
    path : './env'
})


/* not a good practice
function connectDB (){}
connectDB()

*/ 

connectDB()














/*

 Do using IIFE

( async () => {
    try {
         
      await  mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)

      app.on("error", (error) => {
        console.log("ERROR : ", error)
        throw error
      })

      app.listen(process.env.PORT, () => {
         console.log(`App is listening on port$(process.env.PORT)`);
      })

    } catch (error) {
        console.log("ERROR: ",error)
        throw error
    }

})()

*/