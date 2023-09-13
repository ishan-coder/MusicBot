const express=require("express");
const router=express.Router();
const  {loginUser,callb,profile,likedSongs}= require("../controllers/SpotifyController");

// Create a login link
router.route('/login').get(loginUser);
  
// Handle the callback after Spotify login
router.route('/callback').get(callb);

// Example: Get user's profile information
router.route('/profile').get(profile);


router.route('/liked-songs').get(likedSongs);


module.exports=router;