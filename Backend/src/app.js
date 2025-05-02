import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

// cookie-parser => ki m mere server se user ka browser haina uski  andar ki cookies access kar paau or set kr paau => basically crud operations perform kr paau

const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials: true,
}))

// these middleware functions are used to parse incoming request bodies, and the limit parameter is used to restrict the size of the data being sent to the server
app.use(express.json({
    limit: "16kb"
}))

app.use(express.urlencoded({
    extended : true,
    limit : "16kb"
}))

app.use(express.static("public"))

app.use(cookieParser())

export { app }; 