import mongoose from "mongoose";

const connectDB = async() =>{

    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅✅✅✅MongoDb connected");
    }catch(e){
        console.log("❌❌❌❌MongoDb connection failed",e);
        process.exit(1);
    }
}

export default connectDB;