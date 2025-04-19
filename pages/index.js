import Spinner from "@/components/Spinner";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Sparkles,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Lightbulb,
} from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastVisitedCourse, setLastVisitedCourse] = useState(null);
  const [lastVisitedLesson, setLastVisitedLesson] = useState(null);
  const { data: session, status } = useSession();
  const isLoadingSession = status === "loading";
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.id) {
      // Fetch last visited course and lesson
      fetch(`/api/update-last-visited?userId=${session.user.id}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Fetched data:", data); // Debugging line
          setLastVisitedCourse(data.lastVisitedCourse);
          setLastVisitedLesson(data.lastVisitedLesson);

          // Store the last visited course in sessionStorage for later use
          if (data.lastVisitedCourse) {
            sessionStorage.setItem(
              "lastVisitedCourse",
              data.lastVisitedCourse._id
            );
          }
        })
        .catch((err) =>
          console.error("Error fetching last visited data:", err)
        );
    }
  }, [session]);

  const handleContinueLearning = () => {
    const lastVisitedCourseId = sessionStorage.getItem("lastVisitedCourse");
    console.log("Last visited course ID:", lastVisitedCourseId); // Debugging line

    if (lastVisitedCourseId) {
      // Redirect to the last visited course page
      router.push(`/courses/${lastVisitedCourseId}`);
    } else {
      // Handle the case when there is no last visited course
      console.log("No last visited course found.");
    }
  };

  if (isLoadingSession) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (session) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 py-16 px-4">
        <motion.section
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-3xl mx-auto space-y-10"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold">
              {session.user?.image ? (
                <Image
                  className="rounded-full w-14 h-14"
                  src={session.user.image}
                  alt={session.user.email}
                  width={48}
                  height={48}
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-10 h-10"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-3xl font-semibold text-gray-800">
                Welcome back 👋
              </h2>
              <p className="text-sm text-gray-500">
                {session.user?.name || session.user?.email}
              </p>
            </div>
          </motion.div>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 text-blue-900 rounded-lg flex items-center gap-2 text-sm font-medium"
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            You&apos;re signed in and ready to explore EduLearn!
          </motion.div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="px-6 py-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
            >
              <Link
                href="/archived"
                className="flex items-center gap-2 text-gray-700 font-medium hover:underline"
              >
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                Go to Archived
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="px-6 py-4 bg-green-50 rounded-lg hover:bg-green-100 transition"
            >
              <Link
                href="/courses"
                className="flex items-center gap-2 text-gray-700 font-medium hover:underline"
              >
                <BookOpen className="w-5 h-5 text-green-600" />
                Browse Courses
              </Link>
            </motion.div>
          </div>

          {/* Progress */}
          <div className="text-gray-800 text-sm space-y-2">
            <h4 className="text-base font-semibold">📚 Your Progress</h4>
            <p>
              Last visited course:{" "}
              <strong>{lastVisitedCourse?.title || "Not available"}</strong>
            </p>
            <p>
              Last lesson:{" "}
              <strong>{lastVisitedLesson?.title || "Not available"}</strong>
            </p>
            <button
              onClick={handleContinueLearning}
              className="inline-flex items-center gap-1 text-indigo-600 hover:underline text-sm"
            >
              Continue learning <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Tip Section */}
          <div className="flex gap-3 items-start text-sm bg-yellow-100 px-4 py-3 rounded-lg text-yellow-800">
            <Lightbulb className="w-5 h-5 mt-1 text-yellow-500" />
            <p>
              <strong>Tip:</strong> Take 10 minutes each day to review what you
              learned — it&apos;s better than cramming!
            </p>
          </div>

          {/* Sign Out */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => signOut()}
            className="w-full rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold py-2 transition"
          >
            Sign Out
          </motion.button>
        </motion.section>
      </main>
    );
  }

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white p-5 text-center">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl font-bold text-gray-800 sm:text-5xl mb-4">
            Empower Your Learning with AI
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            EduLearn creates personalized paths, delivers instant feedback, and
            helps you learn smarter — not harder.
          </p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-full max-w-xl"
        >
          <Image
            src="/learning-illustration.jpg"
            alt="AI Learning Illustration"
            width={600}
            height={400}
            className="mx-auto"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-6"
        >
          <button
            disabled={isLoading}
            onClick={() => {
              setIsLoading(true);
              signIn();
            }}
            className="inline-block shrink-0 rounded-md border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-blue-500"
          >
            Sign In to Get Started
          </button>
        </motion.div>
      </main>
    </>
  );
}
