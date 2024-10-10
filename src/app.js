import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from 'express-session';
import passport from "./config/passport.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" })); //to allow json data

app.use(express.urlencoded({ extended: true, limit: "16kb" })); // to make url same at all places

app.use(express.static("public")); // to store things locally in public folder

app.use(cookieParser()); // to access cookies from users browser using server

// Initialize sessions and passport
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Auth routes

//import all routes 
import userRouter from './routes/user.routes.js';

app.use('/api/v1/users',userRouter);

export { app };
