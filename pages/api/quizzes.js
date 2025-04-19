import { mongooseConnect } from "@/lib/mongoose";
import Quiz from "@/models/Quiz";
import Lesson from "@/models/Lesson";

export default async function handle(req, res) {
  const { method, query } = req;

  await mongooseConnect();

  if (method === "GET") {
    try {
      const { lessonId } = query;

      if (lessonId) {
        // Ensure lessonId is valid before querying
        const lessonExists = await Lesson.findById(lessonId);
        if (!lessonExists) {
          return res.status(404).json({ error: "Lesson not found." });
        }

        // Fetch quizzes related to the specific lesson
        const quizzes = await Quiz.find({ lesson: lessonId });

        if (!quizzes.length) {
          return res.status(200).json([]); // Return empty array instead of an error
        }

        return res.status(200).json(quizzes);
      }

      // If no lessonId is provided, return all quizzes
      const quizzes = await Quiz.find().populate("lesson");
      return res.status(200).json(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (method === "POST") {
    try {
      const { lessonId, question, options, correctAnswer } = req.body;

      if (!lessonId || !question || !options || !correctAnswer) {
        return res.status(400).json({ error: "All fields are required." });
      }

      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found." });
      }

      const newQuiz = await Quiz.create({
        lesson: lessonId,
        question,
        options,
        correctAnswer,
      });

      lesson.quiz.push(newQuiz._id);
      await lesson.save();

      return res.status(201).json({
        message: "Quiz created successfully!",
        quiz: newQuiz,
      });
    } catch (error) {
      console.error("Error creating quiz:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
  if (method === "DELETE") {
    try {
      const { id } = query;

      if (!id) {
        return res.status(400).json({ error: "Quiz ID is required." });
      }

      const quiz = await Quiz.findById(id);
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found." });
      }

      // Remove quiz reference from the lesson
      await Lesson.updateOne({ _id: quiz.lesson }, { $pull: { quiz: id } });

      await Quiz.findByIdAndDelete(id);

      return res.status(200).json({ message: "Quiz deleted successfully!" });
    } catch (error) {
      console.error("Error deleting quiz:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
