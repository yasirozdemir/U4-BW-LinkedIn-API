import mongoose from "mongoose";
const { Schema, model } = mongoose;

const experienceSchema = new Schema(
  {
    userId: { type: mongoose.Types.ObjectId },
    role: { type: String, required: true },
    company: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date || null, required: true },
    description: { type: String, required: true },
    area: { type: String, required: true },
    image: { type: String },
  },
  { timestamps: true }
);

export default model("Experience", experienceSchema);
