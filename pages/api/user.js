import { mongooseConnect } from "@/lib/mongoose";
import User from "@/models/User";

export default async function handle(req, res) {
  await mongooseConnect();
  const { method } = req;

  switch (method) {
    // Update last visited course AND lesson
    case "POST": {
      const { userId, courseId, lessonId } = req.query;

      if (!userId || !courseId || !lessonId) {
        return res.status(400).json({
          error: "Missing userId, courseId, or lessonId",
        });
      }

      try {
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          {
            $set: {
              lastVisitedCourse: courseId,
              lastVisitedLesson: lessonId,
            },
          },
          { new: true } // Return updated document
        );

        if (!updatedUser) {
          return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({
          success: true,
          message: "Last visited course and lesson updated",
          user: updatedUser,
        });
      } catch (err) {
        console.error("Error updating last visited course and lesson:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
    }

    // Update only last visited course (optional PATCH)
    case "PATCH": {
      const { userId, courseId } = req.query;

      if (!userId || !courseId) {
        return res.status(400).json({ error: "Missing userId or courseId" });
      }

      try {
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          {
            $set: { lastVisitedCourse: courseId },
          },
          { new: true }
        );

        if (!updatedUser) {
          return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({
          success: true,
          message: "Last visited course updated",
          user: updatedUser,
        });
      } catch (err) {
        console.error("Error updating course:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
    }

    // Update user profile
    case "PUT": {
      const { name, image, email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      try {
        const updatedUser = await User.findOneAndUpdate(
          { email },
          { $set: { name, image } },
          { new: true }
        );

        if (!updatedUser) {
          return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({
          success: true,
          message: "User updated successfully",
          user: updatedUser,
        });
      } catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
    }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}
