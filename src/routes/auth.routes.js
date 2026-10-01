import {Router} from "express";
import {registeredUser} from "../controllers/auth.controller.js"
import {userRegisterValidator} from "../validators/index.js"
import {validate} from "../middlewares/validator.middleware.js"


const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registeredUser); 



export default router;

// just checking if the code is working or not