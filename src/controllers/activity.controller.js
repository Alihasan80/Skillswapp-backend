import Activity from "../models/Activity.model.js";

export const getActivities = async (req,res)=>{

 try{

 const activities = await Activity.find({
  user:req.user.id
 }).sort({createdAt:-1});

 res.json(activities);

 }catch(error){

 res.status(500).json({
  message:"Failed to fetch activities"
 });

 }

};