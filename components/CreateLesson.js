"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaCloudUploadAlt, FaTrash } from "react-icons/fa";

export default function CreateLesson({ courseId }) {
  const [lessonData, setLessonData] = useState({
    title: "",
    content: "",
    pdfResources: [],
    wordResources: [],
    imageResources: [],
    videoResources: [],
    txtResources: [],
    zipResources: [],
    pptResources: [],
  });

  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleChange = (e) => {
    setLessonData({ ...lessonData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.type;
    const category = getFileCategory(fileType);

    if (!category) {
      toast.error("Invalid file type.");
      return;
    }

    if (!fileName.trim()) {
      toast.error("Please provide a file name before uploading.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("📤 Upload Response:", data); // Debugging

      if (response.ok && data.link) {
        setLessonData((prev) => ({
          ...prev,
          [category]: [
            ...prev[category],
            { name: fileName.trim(), url: data.link },
          ],
        }));
        setSelectedFiles((prev) => [
          ...prev,
          { name: fileName.trim(), url: data.link, category },
        ]);

        setFileName("");
        toast.success("File uploaded successfully!");
      } else {
        toast.error("Upload failed: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      toast.error("File upload failed. Try again.");
      console.error("❌ Upload error:", error);
    }

    setUploading(false);
  };

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
      "text/csv": "txtResources", // ✅ Added CSV support

      // Compressed Files (ZIP, RAR, TAR, 7z, GZ)
      "application/zip": "zipResources",
      "application/x-zip-compressed": "zipResources",
      "application/x-rar-compressed": "zipResources",
      "application/vnd.rar": "zipResources", // ✅ Added missing RAR type
      "application/x-7z-compressed": "zipResources",
      "application/x-tar": "zipResources",
      "application/gzip": "zipResources",
    };

    return fileTypes[type] || null; // Return null for unsupported types
  };

  const handleRemoveFile = (fileUrl, category) => {
    setLessonData((prev) => ({
      ...prev,
      [category]: prev[category].filter((file) => file.url !== fileUrl),
    }));
    setSelectedFiles((prev) => prev.filter((file) => file.url !== fileUrl));
    toast.success("File removed.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(
      "📤 Submitting lessonData:",
      JSON.stringify(lessonData, null, 2)
    ); // Debugging

    try {
      const formattedData = {
        ...lessonData,
        courseId,
        pdfResources: lessonData.pdfResources || [],
        wordResources: lessonData.wordResources || [],
        imageResources: lessonData.imageResources || [],
        videoResources: lessonData.videoResources || [],
        txtResources: lessonData.txtResources || [],
        zipResources: lessonData.zipResources || [],
        pptResources: lessonData.pptResources || [],
      };

      const response = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      if (response.ok) {
        toast.success("Lesson created successfully!");
        setLessonData({
          title: "",
          content: "",
          pdfResources: [],
          wordResources: [],
          imageResources: [],
          videoResources: [],
          txtResources: [],
          zipResources: [],
          pptResources: [],
        });
        setSelectedFiles([]);
      } else {
        const errorData = await response.json();
        toast.error("Error: " + errorData.error);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error("❌ Error:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Create Lesson
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Lesson Title
          </label>
          <input
            type="text"
            name="title"
            value={lessonData.title}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Content
          </label>
          <textarea
            name="content"
            value={lessonData.content}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            File Name
          </label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Enter file name"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Upload Resources
          </label>
          <input
            type="file"
            onChange={handleFileUpload}
            className="w-full p-3 border rounded-lg"
          />
          {uploading && <p className="text-gray-500 mt-2">Uploading...</p>}
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Uploaded Files
            </h3>
            <ul className="mt-2 space-y-2">
              {selectedFiles.map((file, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-100 rounded-lg"
                >
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 font-medium hover:underline"
                  >
                    {file.name}
                  </a>
                  <button
                    onClick={() => handleRemoveFile(file.url, file.category)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-3 rounded-lg font-medium hover:bg-blue-600"
        >
          Create Lesson
        </button>
      </form>
    </div>
  );
}
