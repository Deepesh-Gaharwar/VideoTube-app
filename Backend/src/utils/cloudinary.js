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
  
  // delete on cloudinary video  
    const deleteOnCLoudinaryVideo = async(oldFilePublicId) => {
         try {

            if(!oldFilePublicId){
                return null ;
            }

            const publicId = oldFilePublicId.split("/").pop().split(".")[0];

            const response = await cloudinary.uploader.destroy(publicId, { invalidate: true, resource_type: 'video'});

   
            return response;
            
         } catch (error) {
            return error;
         }
    }

  
    // delete on cloudinary image
    const deleteOnCloudinaryImage = async (oldFilePublicId) => {

  try {
    if(!oldFilePublicId) return null;

    // delete the file on cloudinary.

    const public_id = oldFilePublicId.split("/").pop().split(".")[0] ;

    const response = await cloudinary.uploader.destroy(public_id, { invalidate: true, resource_type: 'raw'});

    
    return response;
  } 
  catch (error) {
    return error;
  }
};


    export {
        uploadOnCloudinary,
        deleteOnCLoudinaryVideo,
        deleteOnCloudinaryImage
    };

