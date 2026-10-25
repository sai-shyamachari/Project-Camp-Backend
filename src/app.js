import express from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";

let app = express();

// basic configurations
app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended : true, limit : "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// cors configurations
app.use(cors({
    origin : process.env.ORIGIN?.split(",") || "https://localhost:5173",
    credentials : true,
    methods : ["GET", "POST", "PUT", "DELETE", "PATCH" , "OPTIONS"],
    headers : ["Content-Type", "Authorization"]
}))

// importing routes
import healthcheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";

app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/auth",authRouter);
app.use("/api/v1/projects",projectRouter);


app.get("/", (req, res) => {
    res.send("Welcome to basecampy >>>>>");
});

app.get("/contact_us", (req,res)=>{
    res.send("You can contact us at contact@basecampy.com");
})



export default app;