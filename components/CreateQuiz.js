"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineDelete, AiOutlinePlus } from "react-icons/ai";

export default function CreateQuiz({ lessonId }) {
  const [quizData, setQuizData] = useState({
    question: "",
    options: [],
    correctAnswer: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ Prevent double submit

  const handleChange = (e, index) => {
    if (index !== undefined) {
      const newOptions = [...quizData.options];
      newOptions[index] = e.target.value;
      setQuizData({ ...quizData, options: newOptions });
    } else {
      setQuizData({ ...quizData, [e.target.name]: e.target.value });
    }
  };

  const addOption = () => {
    setQuizData({ ...quizData, options: [...quizData.options, ""] });
  };

  const removeOption = (index) => {
    const newOptions = quizData.options.filter((_, i) => i !== index);
    const updatedQuizData = { ...quizData, options: newOptions };

    // Reset correct answer if the removed option was selected
    if (quizData.correctAnswer === quizData.options[index]) {
      updatedQuizData.correctAnswer = "";
    }

    setQuizData(updatedQuizData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent multiple clicks

    setIsSubmitting(true); // ✅ Disable button temporarily

    try {
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...quizData, lessonId }),
      });

      if (response.ok) {
        toast.success("Quiz created successfully!");
        setTimeout(() => window.location.reload(), 1000); // ✅ Refresh page
      } else {
        const errorData = await response.json();
        toast.error("Error: " + errorData.error);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error("Error:", error);
    } finally {
      setTimeout(() => setIsSubmitting(false), 3000); // ✅ Delay re-enabling submit
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 border rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Create Quiz</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Question Input */}
        <div>
          <label className="block mb-1">Question</label>
          <input
            type="text"
            name="question"
            value={quizData.question}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Options Input (Dynamic) */}
        {quizData.options.map((option, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              type="text"
              value={option}
              onChange={(e) => handleChange(e, index)}
              className="w-full p-2 border rounded"
            />
            <button
              type="button"
              onClick={() => removeOption(index)}
              className="bg-red-500 text-white p-2 rounded hover:bg-red-600 flex items-center"
            >
              <AiOutlineDelete size={20} />
            </button>
          </div>
        ))}

        {/* Add Option Button */}
        <button
          type="button"
          onClick={addOption}
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600 w-full flex justify-center items-center gap-2"
        >
          <AiOutlinePlus size={20} /> Add Option
        </button>

        {/* Correct Answer */}
        <div>
          <label className="block mb-1">Correct Answer</label>
          {quizData.options.length > 0 ? (
            <select
              name="correctAnswer"
              value={quizData.correctAnswer}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select an answer</option>
              {quizData.options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              name="correctAnswer"
              value={quizData.correctAnswer}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full p-2 rounded text-white ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isSubmitting ? "Submitting..." : "Create Quiz"}
        </button>
      </form>
    </div>
  );
}
