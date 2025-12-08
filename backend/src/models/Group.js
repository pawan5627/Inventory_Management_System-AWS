const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
  companyId: { type: String } // optional multi-company support
}, { timestamps: true });

module.exports = mongoose.model("Group", groupSchema);
