import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Spinner from "@/components/Spinner";
import toast from "react-hot-toast";
import Link from "next/link";
import { SlArrowLeftCircle } from "react-icons/sl";

export default function EditCourse() {
  const router = useRouter();
  const { id } = router.query;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    category: "",
    isPublished: false,
    isPaid: false,
  });

  useEffect(() => {
    const rawId = router.query.id;
    const courseId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (courseId) {
      axios
        .get(`/api/courses?courseId=${courseId}`)
        .then((res) => {
          setCourse(res.data);
          setForm({
            title: res.data.title,
            description: res.data.description,
            image: res.data.image || "",
            category: res.data.category || "",
            isPublished: res.data.isPublished || false,
            isPaid: res.data.isPaid || false,
          });
        })
        .catch((err) => {
          console.error("Failed to fetch course:", err);
        });
    }
  }, [router.query.id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);

    try {
      const res = await axios.post("/api/upload", formData);
      setForm({ ...form, image: res.data.link });
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const courseId = Array.isArray(id) ? id[0] : id;
      await axios.put("/api/courses", {
        _id: courseId,
        ...form,
      });
      toast.success("Course updated successfully!");
      router.push("/courses");
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!course)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <Spinner className="w-20 h-20" />
      </div>
    );

  return (
    <div className="">
      <Link
        className="m-10 group flex items-center justify-between gap-4 rounded-lg border border-current px-5 py-3 text-indigo-600 transition-colors hover:bg-indigo-600 focus:ring-3 focus:outline-hidden w-60"
        href="/courses"
      >
        <span className="shrink-0 rounded-full  bg-white">
          <SlArrowLeftCircle className="h-8 w-8" />
        </span>
        <span className="font-medium transition-colors group-hover:text-white">
          {" "}
          Back to courses{" "}
        </span>
      </Link>
      <div className="max-w-xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Edit Course</h2>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Course Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
            />
            {uploading && (
              <p className="text-sm text-gray-500 mt-1">Uploading image...</p>
            )}
            {form.image && (
              <Image
                src={form.image}
                alt="Course"
                width={500} // Provide an appropriate width
                height={300} // Provide an appropriate height
                className="w-full mt-2 rounded"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Published</label>
            <select
              name="isPublished"
              value={form.isPublished ? "true" : "false"}
              onChange={(e) =>
                setForm({ ...form, isPublished: e.target.value === "true" })
              }
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Paid</label>
            <select
              name="isPaid"
              value={form.isPaid ? "true" : "false"}
              onChange={(e) =>
                setForm({ ...form, isPaid: e.target.value === "true" })
              }
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? "Updating..." : "Update Course"}
          </button>
        </form>
      </div>
    </div>
  );
}
