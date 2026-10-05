import {Router} from "express";
import {registeredUser, login, logoutUser , getCurrentUser, verifyEmail , resendEmailVerification , refreshAccessToken , forgotPasswordRequest , resetForgotPassword, changeCurrentPassword} from "../controllers/auth.controller.js"
import {userRegisterValidator,
    userLoginValidator,
    userChangeCurrentPasswordValidator,
    userForgotPasswordValidator,
    userResetForgotPasswordValidator} from "../validators/index.js"
import {validate} from "../middlewares/validator.middleware.js"
import {verifyJWT} from "../middlewares/auth.middlewares.js"


const router = Router();

// unsecure routes
router.route("/register").post(userRegisterValidator(), validate, registeredUser); 
router.route("/login").post(userLoginValidator(), validate, login);
router.route("/verify-email/:verficationToken").get(verifyEmail);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/forgot-password").post(userForgotPasswordValidator(), validate, forgotPasswordRequest);
router.route("/reset-password/:resetToken").post(userResetForgotPasswordValidator(), validate, resetForgotPassword);

// secure routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").post(verifyJWT, getCurrentUser);
router.route("/change-password").post(verifyJWT, userChangeCurrentPasswordValidator(),validate, changeCurrentPassword);
router.route("/resend-email-verification").post(verifyJWT , resendEmailVerification);



export default router;
