const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const connectDB = async () => {
  try {
    const uri = process.env.DOCDB_URI;
    if (!uri) throw new Error("DOCDB_URI is not defined in env");

    // path to CA bundle in project root
    const caPath = path.resolve(__dirname, "../../rds-combined-ca-bundle.pem");
    const tlsCAFile = fs.existsSync(caPath) ? caPath : undefined;

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      tls: !!tlsCAFile,
      tlsCAFile,
      retryWrites: false
    });

    console.log("Connected to DocumentDB / MongoDB");
  } catch (err) {
    console.error("DB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
