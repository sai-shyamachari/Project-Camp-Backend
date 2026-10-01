import express from 'express';
import cors from "cors";

let app = express();

// basic configurations
app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended : true, limit : "16kb"}))
app.use(express.static("public"))

// cors configurations
app.use(cors({
    origin : process.env.ORIGIN?.split(",") || "https://localhost:5173",
    credentials : true,
    methods : ["GET", "POST", "PUT", "DELETE", "PATCH" , "OPTIONS"],
    headers : ["Content-Type", "Authorization"]
}))

// importing routes
import healthcheckRoutes from "./routes/healthcheck.routes.js";
import authRoute from "./routes/auth.routes.js";

app.use("/api/v1/healthcheck", healthcheckRoutes);
app.use("/api/v1/auth",authRoute);


app.get("/", (req, res) => {
    res.send("Welcome to basecampy >>>>>");
});

app.get("/contact_us", (req,res)=>{
    res.send("You can contact us at contact@basecampy.com");
})



export default app;