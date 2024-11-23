import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
    {
        from : {
           type : String,
           required : true
        },
        to : {
           type : String,
           required : true
        },
        text: {
            type :String ,
            required : true
        }
        ,
    }, { timestamps: true }
);

const Message = mongoose.model("Message", MessageSchema);
export default Message;