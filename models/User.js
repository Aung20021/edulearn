import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Only required for email/password sign-in
  role: { type: String, enum: ["teacher", "student"], default: "teacher" }, // Default to "teacher"
  provider: { type: String, enum: ["google", "email"], required: true }, // Track auth method
  image: { type: String }, // Store profile picture URL
  lastVisitedCourse: { type: mongoose.Schema.Types.ObjectId, ref: "Course" }, // Store last visited course
  lastVisitedLesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }, // Store last visited lesson
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
