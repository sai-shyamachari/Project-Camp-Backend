import {User} from "../models/users.models.js"
import {ApiError} from "../utils/api_error.js"
import {asyncHandler} from "../utils/async_handler.js"
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async (req , res , next)=>{
    console.log("HEADERS:", req.headers);
    console.log("COOKIES:", req.cookies);
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");

    if(!token){
        throw new ApiError(401,"Unauthorized access")
    }

    try{
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).
        select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry")

        if(!user){
        throw new ApiError(401,"invalid access token")
    }
    req.user = user;
    next();
    }catch(err){
        throw new ApiError(401,"invalid access token")
    }
})
