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

const login = asyncHandler(async (req,res)=>{
    const {email , password , username} = req.body;

    if(!email ){
        throw new ApiError(400, "email is required")
    }

    const user = await User.findOne({email});

    if(!user){
        throw new ApiError(400, "user not found");
    }

    const isPasswordValid = await user.comparePassword(password);

    if(!isPasswordValid ){
        throw new ApiError(400,"password is incorrect");
    }

    const {accessToken , refreshToken } = await generateAccessandRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user : loggedInUser,
                    accessToken,
                    refreshToken
                },
                "user logged in successfully"
            )
        )



})

const logoutUser = asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(req.user._id ,
         {
            $set :{
                refreshToken : ""
            }
    },{
        new : true,
    })
    const options = {
        httpOnly :true,
        secure : true
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "user logged out successfully"
            )
        )
})

const getCurrentUser = asyncHandler(async (req,res)=> {
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "current user fetched succesfully")
        )
} )

const verifyEmail = asyncHandler(async (req,res)=>{
    const {verificationToken} = req.params

    if(!verificationToken){
        throw new ApiError(400,"verification token is missing")
    }

    let hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex")
        
    const user = await User.findOne({
        emailVerificationToken : hashedToken,
        emailVerificationExpiry : {$gt : Date.now()}
    })

    if(!user){
        throw new ApiError(400,"invalid or expired verification token")
    }

    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    user.isEmailVerified = true;
    await user.save({validateBeforeSave : false})

    return res
        .status(200)
        .json(new ApiResponse(200, {
            isEmailVerified : true,
        }, "email verified successfully"))
})

const resendEmailVerification = asyncHandler (async (req , res)=>{
    const user = await User.findById(req.user._id);

    if(!user){
        throw new ApiError(404,"user not found")
    }

    if(user.isEmailVerified){
        throw new ApiError(409,"Email is already verified")
    }

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

    return res
        .status(200)
        .json(new ApiResponse(200,{},"mail has been sent to your email id"))

})

const refreshAccessToken = asyncHandler (async (req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorized access")
    }

    try{
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id);

        if(!user ){
            throw new ApiError(401, "invalid refresh token")
        }

        if(incomingRefreshToken !== user.refreshToken){
            throw new ApiError(401, "expired refresh token")
        }

        const options = {
            httpOnly : true,
            secure : true
        }

        const {accessToken , refreshToken : newRefreshToken } = await generateAccessandRefreshTokens(user._id);

        user.refreshToken = newRefreshToken;
        await user.save()

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {accessToken , refreshToken : newRefreshToken},
                    "access token is refreshed "
                )
            )

    }catch(err){
        throw new ApiError(401, "invalid refresh token")
    }
})

const forgotPasswordRequest = asyncHandler(async (req,res)=>{

    const {email} = req.body;

    const user = await User.findOne({email});

    if(!user){
        throw new ApiError(404,"user not found")
    }

    const {unhashedToken,hashedToken,tokenExpiry} = user.generateTemporaryToken()

    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = tokenExpiry;

    await user.save({validateBeforeSave:false});

    await sendEmail({
        
        email : user?.email,
        subject : "forgot password request",
        mailgenContent : forgotPasswordRequest(
            user.username,
            `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unhashedToken}`,
        )

    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "mail has been sent to your email id"
            )
        )

})

const resetForgotPassword = asyncHandler(async (req,res)=>{

    const {resetToken} = req.params;
    const {newPassword} = req.body;

    let hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")

    const user = await User.findOne({
        forgotPasswordToken : hashedToken,
        forgotPasswordExpiry : {$gt : Date.now()}
    })

    if(!user){
        throw new ApiError(489,"invalid or expired reset token")
    }

    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;

    user.password = newPassword;

    await user.save({validateBeforeSave : false})

    return res
        .status(200)
        .json(new ApiResponse(200,{}, "password reset successfully"))
})

const changeCurrentPassword = asyncHandler(async (req,res)=>{
    const {oldPassword , newPassword} = req.body;

    const user = await User.findById(req.user?._id);

    const isPasswordValid = await user.comparePassword(oldPassword);

    if(!isPasswordValid){
        throw new ApiError(400,"old password is incorrect")
    }

    user.password = newPassword;
    await user.save({validateBeforeSave : false})

    return res
        .status(200)
        .json(
            new ApiResponse(200,
                {},
                "password changed successfully"
            )
        )
})

export {registeredUser, login, logoutUser , getCurrentUser, verifyEmail , resendEmailVerification , refreshAccessToken , forgotPasswordRequest , resetForgotPassword, changeCurrentPassword }