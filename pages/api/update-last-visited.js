import { mongooseConnect } from "@/lib/mongoose";
import User from "@/models/User"; // Import your User model
import Course from "@/models/Course"; // Import Course model
import Lesson from "@/models/Lesson"; // Import Lesson model

export default async function handle(req, res) {
  const { method } = req;
  const { userId, courseId, lessonId } = req.query;

  await mongooseConnect();

  if (method === "POST") {
    try {
      // Validate user ID
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      // Find the user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update last visited course and lesson
      if (courseId) {
        const course = await Course.findById(courseId);
        if (!course) {
          return res.status(404).json({ error: "Course not found" });
        }
        user.lastVisitedCourse = course._id; // Track last visited course
      }

      if (lessonId) {
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
          return res.status(404).json({ error: "Lesson not found" });
        }
        user.lastVisitedLesson = lesson._id; // Track last visited lesson
      }

      await user.save(); // Save the updated user data

      return res.status(200).json({
        message: "Last visited course and lesson updated successfully",
        user,
      });
    } catch (error) {
      console.error("Error updating last visited:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  if (method === "GET") {
    try {
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const user = await User.findById(userId)
        .populate("lastVisitedCourse")
        .populate("lastVisitedLesson");

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({
        lastVisitedCourse: user.lastVisitedCourse || null,
        lastVisitedLesson: user.lastVisitedLesson || null,
      });
    } catch (error) {
      console.error("Error retrieving last visited data:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
