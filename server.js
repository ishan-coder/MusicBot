const express = require('express');
const session = require('express-session');
const dotenv=require("dotenv").config();
const errorHandler = require("./middleware/errorHandler");

const app = express();
const port = process.env.PORT || 5000;
const discordBot=require("./controllers/DiscordBot");
const connectDb = require('./config/dbconnection');
const bodyParser = require('body-parser');
//connecting to database to store accesstoken and refreshtoken per user
connectDb();


// Configure session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Change this to a secure random key
    resave: false,
    saveUninitialized: true,
  })
);
app.use(errorHandler);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api",require("./routes/SpotifyRoutes"));
//Listen for spotify-api on port 5001
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//Signing discord Bot and using it
discordBot();
