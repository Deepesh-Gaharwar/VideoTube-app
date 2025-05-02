// require('dotenv').config({path : './env'}) // -> from this , code also runs fine -> but not a good practice, code consistency khraab kr rha h 
import dotenv from "dotenv" 
import connectDB from "./DB/db.js";
import { app } from "./app.js";

dotenv.config({
    path : './env'
})


/* not a good practice
function connectDB (){}
connectDB()

*/ 

const port = process.env.PORT || 8000 ; 

connectDB() // db connection func 
 .then(() => {
    app.listen(port, () => {
        console.log(`Server is running at port : ${port}`)
    })

    app.on("Error : ", (error) => {
        console.log("ERROR : ", error)
        throw error
      })
 })
 .catch((err) => {
    console.log("MongoDB connection failed !!!" , err);
 })














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