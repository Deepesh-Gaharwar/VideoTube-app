import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials: true,
}))

// these middleware functions are used to parse incoming request bodies, and the limit parameter is used to restrict the size of the data being sent to the server
app.use(express.json({
    limit: "16kb"
}))

// a middleware that enables the server to parse incoming URL-encoded form data
app.use(express.urlencoded({
    extended : true,
    limit : "16kb"
}))

// tells Express to serve static content from the public directory
app.use(express.static("public"))

// cookie-parser => ki m mere server se user ka browser haina uski  andar ki cookies access kar paau or set kr paau => basically crud operations perform kr paau
app.use(cookieParser())

export { app }; 