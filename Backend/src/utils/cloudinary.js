import {v2 as cloudinary} from "cloudinary"
import fs from "fs" // given by node.js -> donot have to install  a package for this

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET, 
    });    


    const uploadOnCloudinary = async (localFilePath) => {
        try {
            if(!localFilePath) return null ;

            // upload the file on the cloudinary
          const response = await cloudinary.uploader.upload(localFilePath, {
                resource_type :"auto"
            })

            fs.unlinkSync(localFilePath); // if file uploads successfully or not , file will be removed from the local server -> /public/temp

         //  console.log(response) 

            // file has been uploaded successfully
          //  console.log("File uploaded successfully" , response.url);

            return response;

        } catch (error) {
            fs.unlinkSync(localFilePath) ; // remove the locally saved temp file as the upload operation got failed
            
            return null;
        }
    }


    export {uploadOnCloudinary};

