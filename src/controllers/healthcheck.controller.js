import {ApiResponse} from "../utils/api_response.js";
import {asyncHandler} from "../utils/async_handler.js";

// const healthcheck = (req,res,next) => {
//     try{
//         res.status(200)
//         .json(new ApiResponse(200 , {message :"server is running ....."}))
//     } catch (error) {
//         next(error);
        
//     }

// };

const healthcheck = asyncHandler(async (req, res, next) => {
    res.status(200)
    .json(new ApiResponse(200, { message: "server is running ......" }));
});
export {healthcheck};