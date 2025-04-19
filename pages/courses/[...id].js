import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Link from "next/link";
import CreateLesson from "@/components/CreateLesson";
import Spinner from "@/components/Spinner";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
export default function CoursePage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || !userId) return;

    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses?courseId=${id}`);
        if (!response.ok) throw new Error("Failed to fetch course");
        const data = await response.json();
        setCourse(data);

        // ✅ Step 5: Call API to update last visited course
        await fetch(
          `/api/update-last-visited?userId=${userId}&courseId=${id}`,
          {
            method: "POST",
          }
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, userId]);

  const handleDeleteLesson = async (lessonId) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this lesson?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch("/api/lessons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, deleteLesson: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete lesson");
        return;
      }

      toast.success("Lesson deleted successfully!");

      // ✅ Remove the lesson from state
      setCourse((prev) => ({
        ...prev,
        lessons: prev.lessons.filter((lesson) => lesson._id !== lessonId),
      }));
    } catch (err) {
      alert("Error deleting lesson: " + err.message);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center w-screen h-screen">
        <Spinner className="w-16 h-16" />
      </div>
    );

  if (error) return <p className="text-red-500">{error}</p>;
  if (!course) return <p>Course not found</p>;

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <motion.header
        className="text-center max-w-3xl mx-auto mt-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.h1
          className="text-5xl font-bold text-gray-900 leading-tight sm:text-6xl"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          {course.title}
        </motion.h1>

        <motion.p
          className="mt-4 text-lg sm:text-xl text-gray-600 leading-relaxed text-justify whitespace-pre-line"
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.2,
            duration: 0.6,
          }}
        >
          {course.description}
        </motion.p>
      </motion.header>

      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Lessons</h2>
        {course.lessons.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {course.lessons.map((lesson) => (
              <div
                key={lesson._id}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h3 className="text-xl font-semibold text-gray-800">
                  {lesson.title}
                </h3>
                <div className="mt-4 space-y-2">
                  <Link
                    href={`/lessons/${lesson._id}`}
                    className="block text-blue-500 hover:underline"
                    onClick={async () => {
                      await fetch(
                        `/api/update-last-visited?userId=${userId}&lessonId=${lesson._id}`,
                        {
                          method: "POST",
                        }
                      );
                    }}
                  >
                    View Lesson Details
                  </Link>

                  <Link
                    href={`/quizzes/${lesson._id}`}
                    className="block text-green-500 hover:underline"
                  >
                    Go to Quiz for this Lesson
                  </Link>
                </div>
                <button
                  onClick={() => handleDeleteLesson(lesson._id)}
                  className="mt-4 w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors"
                >
                  Delete Lesson
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No lessons found. Create one below.
          </p>
        )}
      </div>

      <div className="flex justify-center">
        <CreateLesson courseId={id} />
      </div>
    </div>
  );
}
