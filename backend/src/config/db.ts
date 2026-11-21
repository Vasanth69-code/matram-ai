import mongoose from "mongoose"

export async function connectMongoDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI || "mongodb+srv://hemavasanth69_db_user:Hema%402006@cluster0.zgnq98j.mongodb.net/matram_ai?retryWrites=true&w=majority&appName=Cluster0"

  try {
    console.log("Connecting to MongoDB Atlas Database...")
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000, // 3 second fast timeout
    })
    console.log("✅ Successfully connected to MongoDB Atlas Database!")
    return true
  } catch (atlasError: any) {
    if (!process.env.VERCEL) {
      console.warn("⚠️ Could not connect to MongoDB Atlas. Trying local MongoDB (mongodb://127.0.0.1:27017/matram_ai)...")
      try {
        await mongoose.connect("mongodb://127.0.0.1:27017/matram_ai", {
          serverSelectionTimeoutMS: 2000,
        })
        console.log("✅ Connected to Local MongoDB Database!")
        return true
      } catch (localError: any) {
        console.error("Local MongoDB also not reachable. Running in Local Memory Fallback Mode.")
      }
    }
    return false
  }
}



