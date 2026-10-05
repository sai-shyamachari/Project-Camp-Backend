import {body} from "express-validator";

const userRegisterValidator = () =>{
    return[
        body("email")
           .trim()
           .notEmpty()
           .withMessage("email is required")
           .isEmail()
              .withMessage("email is not valid"),
        body("username")
            .trim()
            .isEmpty().withMessage("username is required")
            .isLowercase().withMessage("username should be in lowercase")
            .isLength({min : 3}).withMessage("username should be at least 3 characters long"),
        body("username")
            .trim()
            .isEmpty().withMessage("username is required"),
        body("fullname")
            .trim()
            .optional()
    ]
}

const userLoginValidator = ()=>{
    return [
        body("email")
            .optional()
            .isEmail().withMessage("email is not valid"),
        body("password")
            .notEmpty().withMessage("password is required")

    ]
}

const userChangeCurrentPasswordValidator = ()=>{
    return [
        body("oldPassword")
            .notEmpty().withMessage("old password is required"),
        body("newPassword")
            .notEmpty().withMessage("new password is required")
    ]
}

const userForgotPasswordValidator = ()=>{
    return [
        body("email")
            .notEmpty().withMessage("email is required")
            .isEmail().withMessage("email is not valid")
    ]
}

const userResetForgotPasswordValidator = ()=>{
    return [
        body("newPassword")
            .notEmpty().withMessage("new password is required")
    ]
}

export {
    userRegisterValidator,
    userLoginValidator,
    userChangeCurrentPasswordValidator,
    userForgotPasswordValidator,
    userResetForgotPasswordValidator
}