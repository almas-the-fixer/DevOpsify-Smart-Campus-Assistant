import mongoose from "mongoose";

const ojtSchema = new mongoose.Schema({

studentId:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},

companyName:String,

position:String,

stipend:Number,

joiningDate:Date,

duration:String,

endDate:{
type:Date,
default:null
},

status:{
type:String,
enum:["ACTIVE","COMPLETED"],
default:"ACTIVE"
}

},{timestamps:true});

export default mongoose.model("OjtRecord",ojtSchema);