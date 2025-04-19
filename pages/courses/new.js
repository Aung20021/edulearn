import { useSession } from "next-auth/react";
import Course from "@/components/Course";

export default function NewCourse() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p className="text-center mt-10">Loading session...</p>;
  }

  if (!session) {
    return (
      <p className="text-center mt-10 text-red-500">
        Please log in to create a course.
      </p>
    );
  }

  return (
    <>
      <div className="p-4 text-center max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="mt-1.5 text-md text-gray-500 max-w-lg">
          Let&apos;s create your new course.
        </p>
      </div>

      <hr className="h-px border-0 bg-gray-300" />
      <div className="my-10">
        <Course session={session} />
      </div>
    </>
  );
}
