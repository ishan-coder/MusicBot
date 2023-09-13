const axios = require('axios');
const ytdl = require('ytdl-core');
//discordBot Configuration
const { Client, GatewayIntentBits }= require('discord.js');
async function captureGetResponse(url) {
    try {
      const response = await axios.get(url);
      const responseData = response.data;
  
      // Do something with the response data
      return responseData;
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }


  const I2D = require("../Models/Ip2D");
  //this gives access to bots to different actions
  const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent] });




function discord(){
   
   

    //discord message
    var res;
    client.on("messageCreate",async (message) =>{
    try{
            if(message.author.bot) return;
            //console.log(message.content)
            
            //login the user to spotify account
            if(message.content=='*login')
            {
                var url='http://localhost:5001/api/login?discordid=';
                url+=`${message.author.id}`;
                // a check functin to check if same user did not try to login again.
                const avail=await I2D.findOne({'discordid':message.author.id},'found it');
                if(avail)
                {
                    message.reply("Already signed in");
                }
                else{
                message.channel.send(`Click [here](${url}) to be redirected.\n Login to your Spotify Account.`);
                // message.channel.send("You have logged in Succesfully");
                }
            }
            else if(message.content=='*likedsongs')// get all liked songs from this account
            {
                const avail=await I2D.findOne({'discordid':message.author.id},'found it');
                if(!avail)
                {
                    message.reply("Login First");
                }
                else{
                    var url='http://localhost:5001/api/liked-songs?discordid=';
                    url+=message.author.id;
                  
                    res=await captureGetResponse(url);
                    if(!res)
                    {
                        message.reply("No Liked Songs");
                    }
                    else
                    {
                        let rep="";
                        for(var i=0;i<res.length;i++)
                        {
                            rep+=res[i]['name']+`\tid:${i}`+'\n';
                        }
                        message.reply(rep);
                    }
                }
            }
            else if(message.content.split(" ")[0]=="*play")
            {
                let Stringid=message.content.split(" ")[1];
                
                //Use parseInt to convert the string to an integer
                const id = parseInt(Stringid, 10);
                const trackid=res[id]['id'];
              
                const avail=await I2D.findOne({'discordid':message.author.id},'found it');
                if(avail)
                {
                    url=`https://open.spotify.com/track/${trackid}`;
                    message.channel.send(`Click [here](${url}) to be redirected to listen on spotify`);
                }
                else{
                    message.reply("sign in first!!!");
                }
                
              

            }
            else{
                message.reply({
                    
                    content: `hello!!! ${message.author.globalName} 😉`
                });
            }
        }catch(err)
        {
            console.log(err);
        }
    })

}

//Login as a bot
//bot_token
client.login(process.env.BOT_TOKEN);
console.log("Signed in as a bot");
module.exports=discord;