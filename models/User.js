import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['owner', 'realtor', 'admin'] },
  password_hash: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
},
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
