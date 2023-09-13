
const mongoose=require("mongoose");
const schema=mongoose.Schema({
    discordid: {
        type: String,
        required: [true,"Please add the id"]
    },
    ip: {
        type: String,
        required: [true,"Please add the ip"]
    },
},
{
    timestamps: true,
}

);

module.exports=mongoose.model("Ip2D",schema);