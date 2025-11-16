import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DOCDB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      tls: true,
      tlsCAFile: "./rds-combined-ca-bundle.pem"   // required for DocumentDB
    });

    console.log("Connected to AWS DocumentDB");
  } catch (error) {
    console.error("Database connection error:", error);
  }
};
