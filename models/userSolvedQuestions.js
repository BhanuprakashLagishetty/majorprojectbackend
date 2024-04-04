const mongoose=require("mongoose")
const problemsSolved=new mongoose.Schema({
    userId:{
        type:String,
        require:true,
    },
    problemId:{
        type:String,
        require:true
    }
},{timestamps:true});
module.exports=mongoose.model("problemsSolved",problemSolved)