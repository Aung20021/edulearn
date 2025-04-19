import { mongooseConnect } from "@/lib/mongoose";
import Lesson from "@/models/Lesson";
import Course from "@/models/Course";
import Quiz from "@/models/Quiz"; // Ensure correct path to your Quiz model
import Tab from "@/models/Tab";
const getFileCategory = (type) => {
  const fileTypes = {
    "application/pdf": "pdfResources",

    // Word Documents
    "application/msword": "wordResources",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "wordResources",

    // PowerPoint Presentations
    "application/vnd.ms-powerpoint": "pptResources",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "pptResources",

    // Images
    "image/jpeg": "imageResources",
    "image/png": "imageResources",
    "image/gif": "imageResources",
    "image/svg+xml": "imageResources",
    "image/webp": "imageResources",

    // Videos
    "video/mp4": "videoResources",
    "video/mpeg": "videoResources",
    "video/ogg": "videoResources",
    "video/webm": "videoResources",
    "video/x-msvideo": "videoResources",

    // Text Files
    "text/plain": "txtResources",
    "text/csv": "txtResources",

    // Compressed Files (ZIP, RAR, TAR, 7z, GZ)
    "application/zip": "zipResources",
    "application/x-zip-compressed": "zipResources",
    "application/x-rar-compressed": "zipResources",
    "application/vnd.rar": "zipResources",
    "application/x-7z-compressed": "zipResources",
    "application/x-tar": "zipResources",
    "application/gzip": "zipResources",
  };

  return fileTypes[type] || null; // Return null for unsupported types
};

export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();

  if (req.method === "GET") {
    try {
      const { courseId, lessonId } = req.query;

      if (!courseId && !lessonId) {
        return res
          .status(400)
          .json({ error: "Course ID or Lesson ID is required." });
      }

      let lessons;

      if (lessonId) {
        // Fetch single lesson by ID
        lessons = await Lesson.findById(lessonId).populate("course");
        if (!lessons) {
          return res.status(404).json({ error: "Lesson not found." });
        }
      } else {
        // Fetch all lessons for a given course
        lessons = await Lesson.find({ course: courseId }).populate("course");
      }

      return res.status(200).json(lessons);
    } catch (error) {
      console.error("❌ Error fetching lessons:", error.message);
      return res.status(500).json({ error: "Failed to retrieve lessons." });
    }
  }

  if (method === "POST") {
    try {
      console.log("🔍 Incoming POST request:", req.body); // Debugging

      const {
        courseId: courseIdRaw,
        title,
        content,
        pdfResources = [],
        wordResources = [],
        pptResources = [],
        imageResources = [],
        videoResources = [],
        txtResources = [],
        zipResources = [],
      } = req.body;

      const courseId = Array.isArray(courseIdRaw)
        ? courseIdRaw[0]
        : courseIdRaw;

      // Validate required fields
      if (!courseId || !title || !content) {
        console.error("❌ Missing required fields:", {
          courseId,
          title,
          content,
        });
        return res
          .status(400)
          .json({ error: "Course ID, title, and content are required." });
      }

      // Check if at least one file is provided
      // const hasFiles =
      //   pdfResources.length > 0 ||
      //   wordResources.length > 0 ||
      //   pptResources.length > 0 ||
      //   imageResources.length > 0 ||
      //   videoResources.length > 0 ||
      //   txtResources.length > 0 ||
      //   zipResources.length > 0;

      // if (!hasFiles) {
      //   console.error("❌ No files uploaded.");
      //   return res
      //     .status(400)
      //     .json({ error: "At least one file must be uploaded." });
      // }

      // Check if course exists
      const course = await Course.findById(courseId);
      if (!course) {
        console.error("❌ Course not found:", courseId);
        return res.status(404).json({ error: "Course not found." });
      }

      // Create lesson data
      const lessonData = {
        course: courseId,
        title,
        content,
        pdfResources,
        wordResources,
        pptResources,
        imageResources,
        videoResources,
        txtResources,
        zipResources,
      };

      // Create a new lesson
      const newLesson = await Lesson.create(lessonData);

      // Add lesson to course
      course.lessons.push(newLesson._id);
      await course.save();

      return res.status(201).json({
        message: "✅ Lesson created successfully!",
        lesson: newLesson,
      });
    } catch (error) {
      console.error("❌ Error creating lesson:", error.message);
      return res.status(500).json({ error: "Failed to create lesson." });
    }
  }

  // ✅ PUT Method for Editing Lessons
  if (method === "PUT") {
    try {
      console.log("✏️ Incoming PUT request:", req.body);

      const {
        lessonId,
        title,
        content,
        pdfResources,
        wordResources,
        pptResources,
        imageResources,
        videoResources,
        txtResources,
        zipResources,
      } = req.body;

      if (!lessonId) {
        return res
          .status(400)
          .json({ error: "Lesson ID is required for updating." });
      }

      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found." });
      }

      // Update only the provided fields
      if (title) lesson.title = title;
      if (content) lesson.content = content;
      if (pdfResources) lesson.pdfResources = pdfResources;
      if (wordResources) lesson.wordResources = wordResources;
      if (pptResources) lesson.pptResources = pptResources;
      if (imageResources) lesson.imageResources = imageResources;
      if (videoResources) lesson.videoResources = videoResources;
      if (txtResources) lesson.txtResources = txtResources;
      if (zipResources) lesson.zipResources = zipResources;

      // Save updated lesson
      await lesson.save();

      return res.status(200).json({
        message: "✅ Lesson updated successfully!",
        lesson,
      });
    } catch (error) {
      console.error("❌ Error updating lesson:", error.message);
      return res.status(500).json({ error: "Failed to update lesson." });
    }
  }

  // Inside your `handle` function
  if (method === "DELETE") {
    try {
      const { lessonId, resourceId, deleteLesson } = req.body;

      // ✅ Handle full lesson deletion
      if (deleteLesson && lessonId) {
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
          return res.status(404).json({ error: "Lesson not found." });
        }

        // Delete quizzes associated with the lesson
        await Quiz.deleteMany({ lesson: lessonId });

        // Delete tabs associated with the lesson
        await Tab.deleteMany({ lesson: lessonId });

        // Delete the lesson itself
        await Lesson.findByIdAndDelete(lessonId);

        return res
          .status(200)
          .json({ message: "✅ Lesson, quizzes, and tabs deleted." });
      }

      // ✅ Handle resource removal inside a lesson
      if (!lessonId || !resourceId) {
        return res
          .status(400)
          .json({ error: "Lesson ID and Resource ID are required." });
      }

      const lesson = await Lesson.findById(lessonId);
      if (!lesson) return res.status(404).json({ error: "Lesson not found." });

      const resourceTypes = [
        "pdfResources",
        "wordResources",
        "pptResources",
        "imageResources",
        "videoResources",
        "txtResources",
        "zipResources",
      ];

      let resourceRemoved = false;

      for (const type of resourceTypes) {
        const originalLength = lesson[type]?.length || 0;
        lesson[type] = lesson[type]?.filter(
          (res) => res._id.toString() !== resourceId
        );
        if (lesson[type].length !== originalLength) {
          resourceRemoved = true;
        }
      }

      if (!resourceRemoved) {
        return res.status(404).json({ error: "Resource not found in lesson." });
      }

      await lesson.save();
      return res
        .status(200)
        .json({ message: "✅ Resource removed from lesson." });
    } catch (error) {
      console.error("❌ Error deleting resource or lesson:", error.message);
      return res
        .status(500)
        .json({ error: "Failed to process delete request." });
    }
  }

  return res.status(405).json({ error: "Method not allowed." });
}
