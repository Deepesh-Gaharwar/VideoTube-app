import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({origin : process.env.CORS_ORIGIN, credentials: true,}))

// these middleware functions are used to parse incoming request bodies, and the limit parameter is used to restrict the size of the data being sent to the server
app.use(express.json({limit: "16kb"}))

// a middleware that enables the server to parse incoming URL-encoded form data
app.use(express.urlencoded({extended : true, limit : "16kb"}))

// tells Express to serve static content from the public directory
app.use(express.static("public"))

// cookie-parser => ki m mere server se user ka browser haina uski  andar ki cookies access kar paau or set kr paau => basically crud operations perform kr paau
app.use(cookieParser())


// routes import 

import userRouter from "./routes/user.routes.js"
import healthcheckRouter from "./routes/healthcheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"



// router declaration
app.use("/api/v1/users",userRouter)
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)


// http://localhost:8000/api/v1/users/register


export { app }; 