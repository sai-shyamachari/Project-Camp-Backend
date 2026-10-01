import {User} from "../models/users.models.js";
import {ApiResponse} from "../utils/api_response.js";
import {ApiError} from "../utils/api_error.js";
import {asyncHandler} from "../utils/async_handler.js";
import {sendEmail , gmailVerificationContent} from "../utils/mail.js"

const generateAccessandRefreshTokens = async (userId)=>{
    try {
        const user = await User.findById(userId);
        const refreshToken = user.generateRefreshToken();
        const accessToken = user.generateAccessToken();

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})
        return{refreshToken,accessToken};

    } catch (error) {
        throw new ApiError(500, "something went wrong while creating access token");
        
    }
}

const registeredUser = asyncHandler(async (req,res)=>{

    const {username , password , role , email} = req.body;

    const existedUser = await User.findOne({
        $or : [{username} , {email}]
    })

    if(existedUser){
        throw new ApiError(409,"user with same email or username already exist" , [])
    }

    const user = await User.create({
        username,
        email,
        password,
        isEmailVerified : false
    })

    const {unhashedToken,hashedToken,tokenExpiry} = user.generateTemporaryToken()

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({validateBeforeSave:false});

    await sendEmail({
        email : user?.email,
        subject : "please verify your email",
        mailgenContent : gmailVerificationContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unhashedToken}`,
        )
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    )
    if(!createdUser){
        throw new ApiError(500, "something went wrong while registering the user")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                "user registered successfully and verification email has been sent ..."
            ),
        )
})

export {registeredUser}