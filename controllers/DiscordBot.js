const axios = require('axios');
const play = require('play-dl')
const { VoiceConnectionStatus ,createAudioPlayer,joinVoiceChannel,createAudioResource } = require('@discordjs/voice');
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
  const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent,GatewayIntentBits.GuildVoiceStates] });




function discord(){
   
   

    //discord message
    var res;
    let player = null; // To store the player for audio playback
    let isPaused = false; // To track whether the song is paused
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
                const avail=await I2D.findOne({'discordid':message.author.id});
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
                const avail=await I2D.findOne({'discordid':message.author.id});
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
                const avail=await I2D.findOne({'discordid':message.author.id});
                if(avail)
                {
                    if(message.content.split(" ")[1]=="spotify")
                    {
                        let Stringid=message.content.split(" ")[2];
                        
                        //Use parseInt to convert the string to an integer
                        const id = parseInt(Stringid, 10);
                        const trackid=res[id]['id'];
                        url=`https://open.spotify.com/track/${trackid}`;
                        message.channel.send(`Click [here](${url}) to be redirected to listen on spotify`);
                        
                    }
                    else if(message.content.split(" ")[1]=="ytube")
                    {
                        
                        let Stringid=message.content.split(" ")[2];
                        
                        //Use parseInt to convert the string to an integer
                        const id = parseInt(Stringid, 10);
                        const SongName=res[id]['name'];
                        //if author who send this command joined voice channel or not
                        const voiceChannel = message.member.voice.channel;
                        if (!voiceChannel) {
                        message.reply('You must be in a voice channel to use this command.');
                        return;
                        }

                        

                        if (!SongName) {
                        message.reply('Please provide a song name to search for.');
                        return;
                        }

                        try {
                            player = await createAudioPlayer();
                            const connection = await joinVoiceChannel({channelId: voiceChannel.id,
                                guildId: voiceChannel.guild.id,
                                adapterCreator: voiceChannel.guild.voiceAdapterCreator});
                            //Search for the song on YouTube
                            await connection.subscribe(player);
                            await connection.on(VoiceConnectionStatus.Ready, async() => {
                                try{
                                console.log('The connection has entered the Ready state - ready to play audio!');
                                }catch(err){
                                    console.log("Error");
                                }
                            });

                            //searching on youtube, we can limit searching videos to 1
                            let firstResult= await play.search(SongName, {
                                limit: 1
                            })
                            if (!firstResult) {
                                message.reply('No search results found for the song.');
                                voiceChannel.leave();
                                return;
                            }
                            

        
                           
                            const stream = await play.stream(firstResult[0].url)// Get the first stream (usually the highest quality)
                            const audioResource=await createAudioResource(stream.stream, {
                                inputType: stream.type
                            });
                            message.reply(`Playing the song ${SongName}`);
                            player.play(audioResource);

                            player.on('finish',() => {
                               
                                player.stop();
            
                            });
                        } catch (error) {
                        console.error('Error playing the song:', error);
                        }
                    
                        
                            
                       
                    }
                }
                else{
                    message.reply("sign in first!!!");
                }

            }
            else if(message.content=="*pause")
            {
                if (player && !isPaused) {
                    // Pause the audio playback
                    player.pause();
                    isPaused = true;
                    message.reply('Song paused.');
                  } else if (isPaused) {
                    message.reply('The song is already paused.');
                  } else {
                    message.reply('There is no song playing to pause.');
                  }
            }
            else if(message.content=="*resume")
            {
                if (player && isPaused) {
                    // Resume the paused audio playback
                    player.unpause();
                    isPaused = false;
                    message.reply('Song resumed.');
                  } else if (!player) {
                    message.reply('There is no song playing to resume.');
                  } else {
                    message.reply('The song is not paused.');
                  }
            }
            else if(message.content=="*stop")
            {
                if(!player)
                {
                    message.reply("Play a Song First");
                }
                else{
                    // Stop the audio playback
                    player.stop();
                }
            }
            else{
                message.reply({
                    
                    content: `hello!!! ${message.author.globalName} 😉`
                });
            }
        }catch(err)
        {
            console.log("Error Responding");
        }
    })

}

//Login as a bot
//bot_token
client.login(process.env.BOT_TOKEN);
console.log("Signed in as a bot");
module.exports=discord;