import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { MdPictureAsPdf, MdVideoLibrary } from "react-icons/md";
import Image from "next/image";
import CustomVideoPlayer from "@/components/CustomVideoPlayer";
import toast from "react-hot-toast";
import { SlArrowLeftCircle } from "react-icons/sl";
import Link from "next/link";
import Spinner from "@/components/Spinner";

export default function EditLesson() {
  const router = useRouter();
  const { id } = router.query;

  const [lesson, setLesson] = useState(null);
  const [tabs, setTabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [availableResources, setAvailableResources] = useState([]);

  useEffect(() => {
    if (!id) return;

    const fetchLessonAndTabs = async () => {
      try {
        const lessonRes = await axios.get(`/api/lessons?lessonId=${id}`);
        const lessonData = lessonRes.data;
        setLesson(lessonData);

        const tabRes = await axios.get(`/api/tab?lessonId=${id}`);
        const tabData = tabRes.data;
        setTabs(tabData);

        const allResources = [
          ...(lessonData.pdfResources || []),
          ...(lessonData.wordResources || []),
          ...(lessonData.imageResources || []),
          ...(lessonData.videoResources || []),
          ...(lessonData.txtResources || []),
          ...(lessonData.zipResources || []),
          ...(lessonData.pptResources || []),
        ];

        const assignedResources = tabData.flatMap((tab) => tab.resources);

        const unassignedResources = allResources.filter(
          (resource) =>
            !assignedResources.some((assigned) => assigned._id === resource._id)
        );

        setAvailableResources(unassignedResources);
      } catch (err) {
        console.error("Fetch failed:", err);
        setError("Failed to fetch lesson or tab data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLessonAndTabs();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLesson((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    if (!lesson) return;

    setSaving(true);
    try {
      await axios.put(`/api/lessons`, { ...lesson, lessonId: id });
      toast.success("Lesson updated successfully!");
      router.push(`/lessons/${id}`);
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update lesson.");
    }
    setSaving(false);
  };

  const handleResourceChange = (index, key, value) => {
    setAvailableResources((prev) => {
      const updated = [...prev];
      updated[index][key] = value;
      return updated;
    });
  };

  const removeResource = async (resource) => {
    if (!id || !resource) return;
    try {
      await axios.delete(`/api/lessons`, {
        data: {
          lessonId: id,
          resourceId: resource._id,
        },
      });

      // Refresh data
      const updatedLessonRes = await axios.get(`/api/lessons?lessonId=${id}`);
      const updatedTabsRes = await axios.get(`/api/tab?lessonId=${id}`);
      const updatedLesson = updatedLessonRes.data;
      const updatedTabs = updatedTabsRes.data;

      const allResources = [
        ...(updatedLesson.pdfResources || []),
        ...(updatedLesson.wordResources || []),
        ...(updatedLesson.imageResources || []),
        ...(updatedLesson.videoResources || []),
        ...(updatedLesson.txtResources || []),
        ...(updatedLesson.zipResources || []),
        ...(updatedLesson.pptResources || []),
      ];

      const assignedResources = updatedTabs.flatMap((tab) => tab.resources);

      const unassignedResources = allResources.filter(
        (resource) =>
          !assignedResources.some((assigned) => assigned._id === resource._id)
      );

      setLesson(updatedLesson);
      setTabs(updatedTabs);
      setAvailableResources(unassignedResources);
    } catch (err) {
      console.error("Failed to remove resource:", err);
      alert("Failed to remove resource.");
    }
  };

  const getFileCategory = (type) => {
    const fileTypes = {
      "application/pdf": "pdfResources",
      "application/msword": "wordResources",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "wordResources",
      "application/vnd.ms-powerpoint": "pptResources",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        "pptResources",
      "image/jpeg": "imageResources",
      "image/png": "imageResources",
      "image/gif": "imageResources",
      "image/svg+xml": "imageResources",
      "image/webp": "imageResources",
      "video/mp4": "videoResources",
      "video/mpeg": "videoResources",
      "video/ogg": "videoResources",
      "video/webm": "videoResources",
      "video/x-msvideo": "videoResources",
      "text/plain": "txtResources",
      "text/csv": "txtResources",
      "application/zip": "zipResources",
      "application/x-zip-compressed": "zipResources",
      "application/x-rar-compressed": "zipResources",
      "application/vnd.rar": "zipResources",
      "application/x-7z-compressed": "zipResources",
      "application/x-tar": "zipResources",
      "application/gzip": "zipResources",
    };
    return fileTypes[type] || null;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = null;

    const fileType = file.type;
    const category = getFileCategory(fileType);

    if (!category) {
      alert("Unsupported file type.");
      return;
    }

    if (!fileName.trim()) {
      alert("Please enter a file name before uploading.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.link) {
        const newResource = {
          name: fileName.trim(),
          url: data.link,
        };

        setLesson((prev) => ({
          ...prev,
          [category]: [...(prev[category] || []), newResource],
        }));

        setAvailableResources((prev) => [...prev, newResource]);
        setFileName("");
        alert("File uploaded successfully!");
      } else {
        alert("Upload failed.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed.");
    }

    setUploading(false);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center w-screen h-screen">
        <Spinner className="w-16 h-16" />
      </div>
    );
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between my-5">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          ✏️ Edit Lesson
        </h1>
        {lesson?.course && (
          <Link
            href={`/lessons/${id}`}
            className="group inline-flex items-center gap-3 rounded-lg border border-indigo-600 px-5 py-3 text-indigo-600 transition hover:bg-indigo-600 hover:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <span className="rounded-full bg-white p-1 transition group-hover:bg-emerald-600">
              <SlArrowLeftCircle className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
            </span>
            <span className="font-semibold">Back to Lesson</span>
          </Link>
        )}
      </div>

      {/* Form Container */}
      <div className="space-y-6 bg-white p-6 rounded-xl shadow-md border border-gray-200">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Lesson Title
          </label>
          <input
            type="text"
            name="title"
            value={lesson?.title || ""}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter lesson title"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Lesson Content
          </label>
          <textarea
            name="content"
            value={lesson?.content || ""}
            onChange={handleChange}
            rows={5}
            className="w-full p-3 border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write lesson content..."
          />
        </div>

        {/* Upload Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            📤 Upload New Resource
          </h2>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Enter file name"
            className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="file"
            onChange={handleFileUpload}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          {uploading && (
            <p className="text-sm text-gray-500 mt-1">Uploading...</p>
          )}
        </div>

        {/* Unassigned Resources */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            📁 Unassigned Resources
          </h2>
          {availableResources.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableResources.map((res, index) => (
                <div
                  key={res._id || index}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm"
                >
                  <label className="block text-xs font-semibold text-gray-600">
                    Resource Name
                  </label>
                  <input
                    type="text"
                    value={res.name}
                    onChange={(e) =>
                      handleResourceChange(index, "name", e.target.value)
                    }
                    className="w-full p-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />

                  {res.url.endsWith(".pdf") && (
                    <div className="mt-2">
                      <MdPictureAsPdf size={20} className="text-red-500 mb-1" />
                      <iframe src={res.url} className="w-full h-56 border" />
                    </div>
                  )}
                  {(res.url.endsWith(".docx") || res.url.endsWith(".pptx")) && (
                    <iframe
                      src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                        res.url
                      )}`}
                      className="w-full h-56 border mt-2"
                    />
                  )}
                  {res.url.endsWith(".txt") && (
                    <iframe src={res.url} className="w-full h-56 border mt-2" />
                  )}
                  {res.url.match(/\.(jpeg|jpg|png|gif)$/) && (
                    <Image
                      src={res.url}
                      alt={res.name}
                      width={800}
                      height={450}
                      className="w-full h-auto border mt-2 rounded-lg object-cover"
                    />
                  )}
                  {res.url.match(/\.(mp4|webm)$/) && (
                    <div className="mt-2">
                      <MdVideoLibrary
                        size={20}
                        className="text-blue-500 mb-1"
                      />
                      <CustomVideoPlayer file={{ url: res.url }} />
                    </div>
                  )}

                  <button
                    className="w-full mt-2 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                    onClick={() => removeResource(res)}
                  >
                    🗑 Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No unassigned resources available.</p>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
          <button
            onClick={handleUpdate}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            disabled={saving}
          >
            {saving ? "Saving..." : "💾 Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
