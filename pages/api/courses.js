import { mongooseConnect } from "@/lib/mongoose";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson"; // <-- Import the missing Lesson model
import Quiz from "@/models/Quiz";
import Tab from "@/models/Tab";

export default async function handle(req, res) {
  const { method } = req;
  const {
    courseId,
    search = "",
    page = 1,
    isPaid,
    sort = "createdAt,DESC",
    suggest = false, // <-- check if it's a suggestion request
  } = req.query;

  await mongooseConnect();

  if (method === "GET") {
    try {
      if (courseId) {
        const course = await Course.findById(courseId)
          .populate({
            path: "lessons",
            model: Lesson,
            populate: { path: "quiz", model: Quiz },
          })
          .populate("teacher");

        if (!course) {
          return res.status(404).json({ error: "Course not found" });
        }
        return res.status(200).json(course);
      }

      const { published } = req.query;

      const query = {
        title: { $regex: search, $options: "i" },
      };

      if (published === "true") {
        query.isPublished = true;
      } else if (published === "false") {
        query.isPublished = false;
      }
      if (isPaid === "true") {
        query.isPaid = true;
      } else if (isPaid === "false") {
        query.isPaid = false;
      }

      // ✅ Handle suggestion-only queries
      if (suggest === "true") {
        const suggestions = await Course.find(query).select("title").limit(5);
        const titles = suggestions.map((c) => c.title);
        return res.status(200).json(titles);
      }

      // ✅ Full course query with pagination
      const perPage = 8;
      const skip = (parseInt(page) - 1) * perPage;

      const [sortField, sortOrder] = sort.split(",");
      const sortOptions = { [sortField]: sortOrder === "DESC" ? -1 : 1 };

      const courses = await Course.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(perPage)
        .populate("teacher");

      const total = await Course.countDocuments(query);

      return res.status(200).json({ courses, total });
    } catch (error) {
      console.error("Error fetching courses:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (method === "POST") {
    try {
      const {
        title,
        description,
        teacher,
        image,
        lessons,
        category,
        isPublished,
        isPaid, // ✅ Get 'isPaid' from the body
      } = req.body;

      console.log("Incoming POST body:", req.body); // ✅ Log entire body
      console.log("Received isPaid:", isPaid); // ✅ Specifically check the 'isPaid' value

      // Validate required fields
      if (!title || !description || !teacher) {
        return res.status(400).json({
          error: "Title, description, and teacher are required.",
        });
      }

      // Create a new course
      const newCourse = await Course.create({
        title,
        description,
        teacher,
        image,
        lessons,
        category,
        isPaid, // ✅ Ensure 'isPaid' is correctly passed here
        isPublished,
      });

      console.log("Created Course:", newCourse); // ✅ See what got saved, including 'isPaid'

      // Send response back
      return res.status(201).json({
        message: "Course created successfully!",
        course: newCourse,
      });
    } catch (error) {
      console.error("Error creating course:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // ✅ UPDATE COURSE
  if (method === "PUT") {
    try {
      const { _id, ...updateData } = req.body;

      if (!_id) {
        return res.status(400).json({ error: "Course ID is required" });
      }

      const updatedCourse = await Course.findByIdAndUpdate(_id, updateData, {
        new: true,
      });

      if (!updatedCourse) {
        return res.status(404).json({ error: "Course not found" });
      }

      return res.status(200).json({
        message: "Course updated successfully",
        course: updatedCourse,
      });
    } catch (error) {
      console.error("Error updating course:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // ✅ DELETE COURSE
  if (method === "DELETE") {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: "Course ID is required" });
      }

      // Find all lessons associated with this course
      const lessons = await Lesson.find({ course: id });

      // Extract all lesson IDs
      const lessonIds = lessons.map((lesson) => lesson._id);

      // Delete quizzes associated with each lesson
      await Quiz.deleteMany({ lesson: { $in: lessonIds } });

      // Delete tabs associated with each lesson
      await Tab.deleteMany({ lesson: { $in: lessonIds } });

      // Delete all lessons for the course
      await Lesson.deleteMany({ course: id });

      // Finally, delete the course itself
      const deletedCourse = await Course.findByIdAndDelete(id);

      if (!deletedCourse) {
        return res.status(404).json({ error: "Course not found" });
      }

      return res
        .status(200)
        .json({ message: "Course and related data deleted successfully" });
    } catch (error) {
      console.error("Error deleting course and related data:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["DELETE"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
