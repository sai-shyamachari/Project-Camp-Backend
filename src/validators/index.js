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

export {
    userRegisterValidator
}