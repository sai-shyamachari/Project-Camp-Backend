class ApiError extends Error{
    constructor(
        statuscode,
        message = "something went wrong",
        errors = [],
        stack = ""

    ){
        super(message),
        this.statuscode = statuscode,
        this.success = false,
        this.data = null,
        this.errors = errors,
        this.message = message

        if(stack){
            this.stack = stack;
        }else{
            Error.captureStackTrace(this, this.constructor);
        }

    }
} 

export {ApiError}