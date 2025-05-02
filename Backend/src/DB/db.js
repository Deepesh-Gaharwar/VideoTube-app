import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
      const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)

      console.log(`\n MONGODB connected !! DB HOST : ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB Connection Error ", error);

        process.exit(1) // command used in node -> to terminate the current process with an exit code of 1
    }
}

export default connectDB;