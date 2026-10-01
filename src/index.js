import dotenv from "dotenv"
import app from "./app.js"
import mongoDB from "./db/index.js"

dotenv.config({
    path : "./.env"
});

const port = process.env.PORT || 3000;

mongoDB().then(()=>{
    app.listen(port,() =>{
    console.log(`listeniong in port http://localhost:${port}`);
})

})
    .catch((e)=>{
        console.log("connection failed",e);
        process.exit(1);
    })
