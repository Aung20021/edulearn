import { mongooseConnect } from "@/lib/mongoose";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import Quiz from "@/models/Quiz";
import { getServerSession } from "next-auth";
// Adjust path as needed
import User from "@/models/User";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }
  // Get user session
  const session = await getServerSession(req, res);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Missing message" });
  }

  try {
    await mongooseConnect();
    const lowerMessage = message.toLowerCase();

    // Simple intent checks
    const isTotalQuery = /how many courses|total courses/.test(lowerMessage);
    const isListQuery = /list courses|show courses/.test(lowerMessage);
    const isMoreQuery = /more courses|next|show more/.test(lowerMessage);
    const isLessonQuery = /lesson|lessons/.test(lowerMessage);
    const isQuizQuery = /quiz|quizzes/.test(lowerMessage);

    const publishedCourses = await Course.find({ isPublished: true }).select(
      "title category description"
    );

    // TOTAL
    if (isTotalQuery) {
      return res.status(200).json({
        reply: `There are ${publishedCourses.length} published courses available on EduLearn.`,
      });
    }

    // LESSON / QUIZ HANDLING
    if (isLessonQuery || isQuizQuery) {
      const allCourses = await Course.find({ isPublished: true });
      const matchedCourse = allCourses.find((course) =>
        lowerMessage.includes(course.title.toLowerCase())
      );

      if (matchedCourse) {
        const lessons = await Lesson.find({ course: matchedCourse._id });

        if (isLessonQuery) {
          if (lessons.length === 0) {
            return res.status(200).json({
              reply: `No lessons found in course "${matchedCourse.title}".`,
            });
          }

          const lessonList = lessons
            .map((l, i) => `${i + 1}. ${l.title}`)
            .join("\n");
          return res.status(200).json({
            reply: `Lessons in course "${matchedCourse.title}":\n\n${lessonList}`,
          });
        }

        if (isQuizQuery) {
          const lessonIds = lessons.map((l) => l._id);
          const quizzes = await Quiz.find({ lesson: { $in: lessonIds } });

          if (quizzes.length === 0) {
            return res.status(200).json({
              reply: `No quizzes found in course "${matchedCourse.title}".`,
            });
          }

          const quizList = quizzes
            .map((q, i) => `${i + 1}. ${q.question}`)
            .join("\n");
          return res.status(200).json({
            reply: `Quizzes in course "${matchedCourse.title}":\n\n${quizList}`,
          });
        }
      }

      // Look for a specific lesson
      const allLessons = await Lesson.find({});
      const matchedLesson = allLessons.find((lesson) =>
        lowerMessage.includes(lesson.title.toLowerCase())
      );

      if (matchedLesson && isQuizQuery) {
        const quizzes = await Quiz.find({ lesson: matchedLesson._id });

        if (quizzes.length === 0) {
          return res.status(200).json({
            reply: `No quizzes found for lesson "${matchedLesson.title}".`,
          });
        }

        const quizList = quizzes
          .map((q, i) => `${i + 1}. ${q.question}`)
          .join("\n");
        return res.status(200).json({
          reply: `Quizzes in lesson "${matchedLesson.title}":\n\n${quizList}`,
        });
      }
    }
    // Extend your handler function inside the POST check block, before the AI fallback

    // 5. MOST POPULAR COURSES
    if (/\b(popular courses?|most enrolled)\b/.test(lowerMessage)) {
      // pull in enrolledStudents so we can count
      const allCourses = await Course.find({ isPublished: true })
        .populate("enrolledStudents")
        .lean();

      const sorted = allCourses
        .filter((c) => c.enrolledStudents.length > 0)
        .sort((a, b) => b.enrolledStudents.length - a.enrolledStudents.length)
        .slice(0, 3);

      if (sorted.length === 0) {
        return res.status(200).json({
          reply:
            "Currently, no courses have any enrolled students yet. Check back later for trending courses!",
        });
      }

      // nicely formatted list
      const list = sorted
        .map(
          (c, i) =>
            `${i + 1}. ${c.title} — ${c.enrolledStudents.length} students`
        )
        .join("\n");

      return res.status(200).json({
        reply: `Here are the 3 most popular courses:\n\n${list}`,
      });
    }
    // 1. FREE COURSES
    if (/free course/.test(lowerMessage)) {
      const freeCourses = await Course.find({
        isPublished: true,
        isPaid: false,
      })
        .sort({ createdAt: -1 })
        .limit(3);

      if (freeCourses.length === 0) {
        return res
          .status(200)
          .json({ reply: "There are no free courses available right now." });
      }

      const reply = `Here are the latest free courses:\n\n${freeCourses
        .map((c, i) => `${i + 1}. ${c.title}`)
        .join("\n")}`;
      return res.status(200).json({ reply });
    }

    // 2. PAID COURSES
    if (/paid course/.test(lowerMessage)) {
      const paidCourses = await Course.find({ isPublished: true, isPaid: true })
        .sort({ createdAt: -1 })
        .limit(3);

      if (paidCourses.length === 0) {
        return res
          .status(200)
          .json({ reply: "There are no paid courses available right now." });
      }

      const reply = `Here are the latest paid courses:\n\n${paidCourses
        .map((c, i) => `${i + 1}. ${c.title}`)
        .join("\n")}`;
      return res.status(200).json({ reply });
    }

    // 4. LATEST COURSES
    if (/latest course|newest course/.test(lowerMessage)) {
      const latestCourses = await Course.find({ isPublished: true })
        .sort({ createdAt: -1 })
        .limit(3);

      if (latestCourses.length === 0) {
        return res.status(200).json({ reply: "No recent courses found." });
      }

      return res.status(200).json({
        reply: `Here are the 3 latest courses:\n\n${latestCourses.map((c, i) => `${i + 1}. ${c.title}`).join("\n")}`,
      });
    }
    // Inside your API route handler...
    // /Createcourse COMMAND
    if (message.trim().toLowerCase().startsWith("/createcourse")) {
      return res.status(200).json({
        reply:
          "Great! Please provide the course title and category in this format:\n\nCourse: Your Title | Category: Your Category",
      });
    }
    const session = await getServerSession(req, res);
    console.log("Session in chatbot API:", session);

    // Parse custom course creation format
    if (message.toLowerCase().startsWith("course:")) {
      const session = await getServerSession(req, res);
      if (!session?.user?.email) {
        return res
          .status(401)
          .json({ reply: "Unauthorized. Please log in as a teacher." });
      }

      // ✅ Fetch the user from DB using the email from the session
      const user = await User.findOne({ email: session.user.email });

      if (!user || user.role !== "teacher") {
        return res
          .status(403)
          .json({ reply: "Access denied. Only teachers can create courses." });
      }

      const teacherId = user._id;

      // Now continue with course creation logic using `teacherId`

      const parts = message.split("|");
      const titleMatch = parts[0]?.match(/course:\s*(.+)/i);
      const categoryMatch = parts[1]?.match(/category:\s*(.+)/i);

      if (!titleMatch || !categoryMatch) {
        return res.status(400).json({
          reply:
            "Please follow the correct format: `Course: Title | Category: Category`",
        });
      }

      const title = titleMatch[1].trim();
      const category = categoryMatch[1].trim();

      // Generate course description using AI
      const courseDescPrompt = `Write a concise, engaging course description for a course titled "${title}" in the category "${category}".`;

      const descResponse = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "mistralai/mistral-7b-instruct",
            messages: [
              {
                role: "system",
                content:
                  "You are EduLearn AI, an assistant for an e-learning platform.",
              },
              { role: "user", content: courseDescPrompt },
            ],
          }),
        }
      );

      const descData = await descResponse.json();
      const description =
        descData.choices?.[0]?.message?.content?.trim() ||
        "No description generated.";

      // ✅ Create Course with teacher field
      const newCourse = await Course.create({
        title,
        category,
        description,
        teacher: teacherId,
        isPublished: true,
        isPaid: true,
        image: "/logo.svg",
      });

      const lessonResponses = [];

      // Generate 3 Lessons
      for (let i = 1; i <= 3; i++) {
        const lessonTitlePrompt = `Generate a short, clear, and concise lesson title (max 8 words) for Lesson ${i} of the course titled "${title}". Only return the title. Do not include 'Lesson ${i}:' prefix or any explanation.`;

        const lessonContentPrompt = `Write a lesson content (max 150 words) for Lesson ${i} of the course "${title}".`;

        const [titleResp, contentResp] = await Promise.all([
          fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "mistralai/mistral-7b-instruct",
              messages: [
                {
                  role: "system",
                  content: "You are EduLearn AI.",
                },
                { role: "user", content: lessonTitlePrompt },
              ],
            }),
          }),
          fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "mistralai/mistral-7b-instruct",
              messages: [
                {
                  role: "system",
                  content: "You are EduLearn AI.",
                },
                { role: "user", content: lessonContentPrompt },
              ],
            }),
          }),
        ]);

        const titleData = await titleResp.json();
        const contentData = await contentResp.json();

        const lessonTitle =
          titleData.choices?.[0]?.message?.content?.trim() || `Lesson ${i}`;
        const lessonContent =
          contentData.choices?.[0]?.message?.content?.trim() || "";

        const lesson = await Lesson.create({
          course: newCourse._id,
          title: lessonTitle,
          content: lessonContent,
        });

        newCourse.lessons.push(lesson._id);

        // Generate Quiz for Lesson
        const quizPrompt = `Create 5 multiple-choice quizzes for the lesson titled "${lessonTitle}". 
Each quiz should be a valid JSON object with "question", "options" (array), and "correctAnswer" keys.
Return an array of such JSON objects. Do not include any introductory sentences or explanations or markdown formatting.`;

        // Call the AI API
        const quizResp = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "mistralai/mistral-7b-instruct",
              messages: [
                {
                  role: "system",
                  content: "You are EduLearn AI.",
                },
                {
                  role: "user",
                  content: quizPrompt,
                },
              ],
            }),
          }
        );

        const quizData = await quizResp.json();
        let quizText = quizData.choices?.[0]?.message?.content?.trim();
        console.log("AI raw response:", quizText);

        // Helper function to clean AI response and parse JSON
        const cleanAndParseQuizText = (quizText) => {
          // Remove markdown formatting if present (```json or ```)
          if (quizText.startsWith("```")) {
            quizText = quizText.replace(/```json|```/g, "").trim();
          }
          // Remove unwanted introductory text
          const cleanedText = quizText.replace(/^.*?Here's.*?:\s*/, "").trim();
          try {
            const parsed = JSON.parse(cleanedText);
            return parsed;
          } catch (error) {
            console.error("Failed to parse quiz text:", error.message);
            return null;
          }
        };

        // Clean and parse the AI raw response
        let quizzes = cleanAndParseQuizText(quizText);

        // Validate and ensure the response is in the correct format
        if (Array.isArray(quizzes)) {
          quizzes = quizzes.filter(
            (q) =>
              typeof q.question === "string" &&
              Array.isArray(q.options) &&
              q.options.length >= 2 &&
              typeof q.correctAnswer === "string"
          );
        } else if (
          quizzes &&
          typeof quizzes === "object" &&
          typeof quizzes.question === "string" &&
          Array.isArray(quizzes.options) &&
          typeof quizzes.correctAnswer === "string"
        ) {
          quizzes = [quizzes];
        } else {
          console.warn("No valid quizzes returned from AI.");
          // Provide a fallback quiz
          quizzes = [
            {
              question:
                "Which of the following is NOT a characteristic of Functional Programming?",
              options: [
                "Immutable data structures",
                "Stateless functions",
                "Side effects",
                "High order functions",
              ],
              correctAnswer: "Side effects",
            },
            {
              question:
                "Which Java 8 API allows users to process collections of data in a declarative way and supports functional-style programming?",
              options: [
                "Collections API",
                "Concurrency API",
                "Files API",
                "Stream API",
              ],
              correctAnswer: "Stream API",
            },
            {
              question:
                "What is the general syntax for defining a Lambda expression in Java?",
              options: [
                "(args) -> statement",
                "(args, arg2) -> { ... }",
                "(args) -> { ... }",
                "(args) => { ... }",
              ],
              correctAnswer: "(args) -> { ... }",
            },
            {
              question:
                "Which method of Stream API is used to compute an intermediate operational result?",
              options: ["forEach", "collect", "limit", "findFirst"],
              correctAnswer: "intermediate operations",
            },
            {
              question:
                "What is the purpose of using a Collector in Java Stream API operation?",
              options: [
                "For grouping elements of the stream",
                "Transforming streams into a different type",
                "Combining elements of the stream into a single result",
                "Users are required to use Collectors in every operation",
              ],
              correctAnswer:
                "Combining elements of the stream into a single result",
            },
          ];
        }

        // Save all quizzes and link them to the lesson
        const savedQuizzes = await Promise.all(
          quizzes.map(async (quiz) =>
            Quiz.create({
              lesson: lesson._id,
              ...quiz,
              isAIgenerated: true,
            })
          )
        );

        lesson.quiz = savedQuizzes.map((q) => q._id);
        await lesson.save();

        lessonResponses.push(`- ${lessonTitle}`);
      }

      await newCourse.save();

      return res.status(200).json({
        reply: `✅ Course "${title}" created with 3 lessons and quizzes!\n\nLessons:\n${lessonResponses.join("\n")}`,
      });
    }

    // AI FALLBACK
    const aiPrompt = `
You are EduLearn AI, a helpful teaching assistant. Use the following data to answer the user's question.

Available Courses:
${publishedCourses
  .map(
    (c, i) =>
      `${i + 1}. ${c.title} [${c.category || "General"}]: ${c.description}`
  )
  .join("\n")}

User asked: "${message}"

Respond appropriately.
`;

    const aiResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          messages: [
            {
              role: "system",
              content:
                "You are EduLearn AI, an assistant for an e-learning platform.",
            },
            { role: "user", content: aiPrompt },
          ],
        }),
      }
    );

    if (!aiResponse.ok) {
      const err = await aiResponse.text();
      console.error("OpenRouter error:", err);
      return res.status(500).json({ error: "AI call failed." });
    }

    const aiData = await aiResponse.json();
    const reply =
      aiData.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I couldn't find a good answer.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Chatbot Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
