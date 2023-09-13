
const { query } = require("express");
const asyncHandler=require("express-async-handler");
const SpotifyWebApi = require('spotify-web-api-node');
const DiscordModel=require("../Models/discordModel");
const I2D = require("../Models/Ip2D");


// const getContacts= asyncHandler(async (req,res) => {
//     res.send("Get all contacts");
//     //res.json({message:"Get all contacts"}); // to get response in json
// });
// Initialize Spotify API client
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI, // Redirect URI registered in your Spotify Developer Dashboard
  });

  
const loginUser=async (req, res) => {

    try{
         // a check functin to check if same user did not try to login again.
         const avail=await I2D.findOne({'ip':req.ip});
         if(avail)
         {
            res.send("Already signed in");
         }
         else{
            const scopes = ['user-read-private', 'user-read-email','user-library-read']; // Define the permissions you need
            
            var authorizeURL = await spotifyApi.createAuthorizeURL(scopes);
            const ip=req.ip;
            const discordid=req.query.discordid;
            const store=await I2D.create({discordid:discordid,ip:ip});
            res.redirect(authorizeURL);
         }
    }catch(err){
        console.log(err);
    }
  }

const callb = async (req, res) => {
    const code = req.query.code;
    try {
        const data = await spotifyApi.authorizationCodeGrant(code);
        const { access_token, refresh_token } = data.body;
        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);
        // Now you can use the Spotify API on behalf of the user
        //adding ip of req sender,access_token,Refresh_token to database
     
       const newField=await DiscordModel.create({ip:req.ip,AccessToken:access_token,RefreshToken:refresh_token});
        res.send('Authentication successful! You can now access the user\'s Spotify account.');
    } catch (error) {
        res.status(400).send('Authentication failed');
    }
}

const profile=async (req, res) => {
    try {
    const data = await spotifyApi.getMe();
    res.json(data.body);
    } catch (error) {
    res.status(400).send('Unable to get user profile');
    }
}

const likedSongs=async (req,res) => {
    try{
        //setting up access token for user;
        const avail=await I2D.findOne({'discordid':req.query.discordid},);
        const ip=avail.ip;
        const spotAccess=await DiscordModel.findOne({'ip':ip},);
        AccessToken=spotAccess.AccessToken;
        RefreshToken=spotAccess.RefreshToken;
        spotifyApi.setAccessToken(AccessToken);
        spotifyApi.setRefreshToken(RefreshToken);
         // Refresh the access token
        const da= await spotifyApi.refreshAccessToken();
         // Set the new access token
         spotifyApi.setAccessToken(da.body['access_token']);
         const av=await DiscordModel.findOneAndUpdate({'ip':ip});
         av.AccessToken=da.body['access_token'];

        //request to api
        const limit = 20; // Number of songs to retrieve per request
        let offset = 0; // Starting offset
        const data = await spotifyApi.getMySavedTracks({limit:limit,offset:offset});
        // Extract the list of liked songs from the response
        // Extract the song names from the response
        const tracks = data.body.items.map((item) => ({
            name: item.track.name,
            id: item.track.id,
          }));
        // Return the list of liked songs as JSON
        //res.json({Liked:songNames});
        res.send(tracks);
    }catch(err){
        console.error('Error fetching liked songs:', err);
        res.status(500).json({ error: 'Unable to fetch liked songs' });
    }
};



module.exports={loginUser,callb,profile,likedSongs};