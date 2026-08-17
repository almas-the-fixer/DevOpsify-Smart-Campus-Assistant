import OjtRecord from "../models/adminModels/OjtRecord.js";
import User from "../models/adminModels/User.js";
import { sendSMS } from "../../services/smsService.js";
const durationRegex = /^\d+(\.\d+)?\s(months?|years?)$/i;



export const startOJT = async (req, res) => {
  try {

    const {
      studentId,
      companyName,
      position,
      stipend,
      joiningDate,
      duration
    } = req.body;

    if (!studentId || !companyName || !position || !stipend || !joiningDate || !duration) {
      return res.status(400).json({ message: "All fields required" });
    }

    if(new Date(joiningDate) < new Date().setHours(0,0,0,0)){
      return res.status(400).json({message:"Past date not allowed"});
    }

    if (!durationRegex.test(duration)) {
      return res.status(400).json({
        message: "Duration must be like '6 months' or '1.5 years'"
      });
    }

    const user = await User.findById(studentId);

    if(!user){
      return res.status(404).json({message:"Student not found"});
    }

    const existing = await OjtRecord.findOne({
      studentId,
      status:"ACTIVE"
    });

    if(existing){
      return res.status(400).json({
        message:"Student already in active OJT"
      });
    }

    const newOjt = await OjtRecord.create({
      studentId,
      companyName,
      position,
      stipend,
      joiningDate,
      duration,
      status:"ACTIVE"
    });

    const last = user.batchHistory[user.batchHistory.length-1];

    if(last && !last.to){
      last.to = joiningDate;
    }

    user.batchHistory.push({
      type:"OJT",
      from:joiningDate,
      to:null
    });

    user.batchType = "OJT";

    await user.save();


    /* ================= SMS SEND ================= */

    const message = `Smart Campus Assistant

Dear ${user.name},

Your OJT has been successfully registered.

Company: ${companyName}
Position: ${position}
Joining Date: ${joiningDate}
Duration: ${duration}

We wish you great success in your professional journey.

- Smart Campus Assistant`;

    if(user.phone){
      await sendSMS(user.phone, message);
    }

    console.log("Student phone:", user.phone);
console.log("Sending SMS...");
    /* ============================================ */


    res.json({
      message: "OJT started successfully",
      data: newOjt
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const endOJT = async (req, res) => {
  try {

    const { studentId } = req.body;

    const record = await OjtRecord.findOne({
      studentId,
      status:"ACTIVE"
    });

    if (!record) {
      return res.status(404).json({ message: "Active OJT not found" });
    }

    record.endDate = new Date();
    record.status = "COMPLETED";
    await record.save();

    const user = await User.findById(studentId);

    if(!user){
      return res.status(404).json({message:"Student not found"});
    }

    const today = new Date();

    const last = user.batchHistory[user.batchHistory.length-1];

    if(last && last.type === "OJT" && !last.to){
      last.to = today;
    }

    user.batchHistory.push({
      type:"NORMAL",
      from:today,
      to:null
    });

    user.batchType = "NORMAL";

    await user.save();

    res.json({
      message: "OJT ended successfully"
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


export const getOjtHistory = async(req,res)=>{
try{

const data = await OjtRecord
.find({status:"COMPLETED"})
.populate("studentId","name email division rollNo semester")
.sort({createdAt:-1});

res.json(data);

}catch(err){
res.status(500).json({message:"server error"});
}
};


export const getActiveOjt = async(req,res)=>{

try{

const data = await OjtRecord
.find({status:"ACTIVE"})
.populate("studentId","name division rollNo semester");

res.json(data);

}catch(err){
res.status(500).json({message:"server error"});
}

};

export const updateOjt = async (req, res) => {

try{

const { id } = req.params;

const record = await OjtRecord.findById(id);

if(!record){
return res.status(404).json({message:"OJT record not found"});
}

const previousStatus = record.status;

// update record fields
Object.assign(record, req.body);

// if admin marks COMPLETED
if(req.body.status === "COMPLETED" && previousStatus !== "COMPLETED"){

record.status = "COMPLETED";
record.endDate = new Date();

const user = await User.findById(record.studentId);

if(user){

const today = new Date().toISOString().split("T")[0];

// close OJT history
const lastHistory = user.batchHistory[user.batchHistory.length - 1];

if(lastHistory && lastHistory.type === "OJT"){
lastHistory.to = today;
}

// push NORMAL again
user.batchHistory.push({
type: "NORMAL",
from: today,
to: null
});

user.batchType = "NORMAL";

await user.save();

}

}

await record.save();

res.json(record);

}catch(err){
console.error(err);
res.status(500).json({message:"update failed"});
}

};



export const getOjtDashboard = async(req,res)=>{

try{

const activeCount = await OjtRecord.countDocuments({
status:"ACTIVE"
});

const completedCount = await OjtRecord.countDocuments({
status:"COMPLETED"
});

const totalCount = await OjtRecord.countDocuments();

const list = await OjtRecord
.find({status:"ACTIVE"})
.populate("studentId","name division rollNo semester")
.sort({joiningDate:-1});

res.json({
activeCount,
completedCount,
totalCount,
list
});

}catch(err){
res.status(500).json({message:"dashboard error"});
}

};


export const getSingleOjt = async (req,res)=>{

try{

const data = await OjtRecord
.findById(req.params.id)
.populate("studentId","name email division rollNo semester");

if(!data){
return res.status(404).json({message:"OJT record not found"});
}

res.json(data);

}catch(err){
res.status(500).json({message:"server error"});
}

};