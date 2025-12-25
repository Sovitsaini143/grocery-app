import mongoose from 'mongoose'

export const connectDB = async () =>{
    try{
         await mongoose.connect(process.env.MONGODB_URI);
         console.log("MongoDB Connected Successfully..")

    } catch (error){;
        console.log("Error in connecting MongoDB", error);
        process.exit(1);

    }
}