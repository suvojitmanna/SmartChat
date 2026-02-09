import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    planId:{type:String,required:true},
    amount:{type:Number,required:true},
    credits:{type:Number,required:true},
    isPaid:{type:Boolean,required:false}
},{timestamps:true})

const Transition =mongoose.model('Transition',transactionSchema)
export default Transition;