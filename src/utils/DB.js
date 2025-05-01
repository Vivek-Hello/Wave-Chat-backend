import mongoose from "mongoose";


export const DB =async()=>{ try {
    const connect = await mongoose.connect(process.env.DB_URL)
    console.log("connected to DB");
    
} catch (error) {
    console.log(error);
}}

