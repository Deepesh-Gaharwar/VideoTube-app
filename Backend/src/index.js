 import dotenv from "dotenv" 
import connectDB from "./DB/db.js";
import { app } from "./app.js";

dotenv.config({
    path : './.env'
})


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
