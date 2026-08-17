// models/adminModels/Announcement.js

import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({

title:{
type:String,
required:true
},

message:{
type:String,
required:true
},

type:{
type:String,
enum:["GENERAL","EXAM","HOLIDAY","EVENT","IMPORTANT"],
default:"GENERAL"
},

semester:{
type:Number
},

division:{
type:String
},

role:{
type:String,
enum:["student","teacher","all"],
default:"student"
},

expiryDate:{
type:Date,
default:null
},

isPinned:{
type:Boolean,
default:false
},

isActive:{
type:Boolean,
default:true
},

createdBy:{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
}

},{timestamps:true});

export default mongoose.model("Announcement",announcementSchema);