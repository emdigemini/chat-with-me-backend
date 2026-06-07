import mongoose from "mongoose";

const CONNECT_DB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI!);
  } catch (err) {
    console.log("ERROR CONNECTING TO DATABSE", err);
    process.exit(1);
  }
}

export default CONNECT_DB;