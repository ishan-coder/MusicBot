const mongoose=require("mongoose");

const schema=mongoose.Schema({
    ip: {
        type: String,
        required: [true,"Please add the id"]
    },
    AccessToken: {
        type: String,
        required: [true,"Please add the spotify Access Token"]
    },
    RefreshToken: {
        type: String,
        required: [true,"Please add the spotify Access Token"]
    },
},
{
    timestamps: true,
}

);




module.exports=mongoose.model("Discord",schema);
