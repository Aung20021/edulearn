"use client";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import Spinner from "@/components/Spinner"; // Import the Spinner component
import { toast } from "react-hot-toast"; // Import toast
import { motion } from "framer-motion";
export default function Settings() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [name, setName] = useState(session?.user?.name || "");
  const [image, setImage] = useState(session?.user?.image || "");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  async function logout() {
    await router.push("/");
    await signOut();
  }

  // Handle image selection and preview
  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImage(URL.createObjectURL(file)); // Local preview
    }
  }

  // Upload image to Cloudinary
  async function uploadImage() {
    if (!imageFile) return image; // Return current image if no new file

    const formData = new FormData();
    formData.append("file", imageFile);

    try {
      const { data } = await axios.post("/api/upload", formData);
      return data.link; // Return uploaded image URL
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload image");
      return image; // Return current image in case of error
    }
  }

  // Save updated profile (name + image)

  async function handleSave() {
    setLoading(true);

    try {
      const imageUrl = await uploadImage(); // Upload and get the image URL

      // Update user profile in the database
      const response = await axios.put("/api/user", {
        name,
        image: imageUrl,
        email: session.user.email,
      });

      // Check if the user was successfully updated
      if (response.data.success) {
        // Update the session with new data
        await update({ name, image: imageUrl });

        toast.success("Profile updated successfully!"); // Success toast

        // Redirect to the home page
        router.push("/"); // Navigate to the home page ("/")
      } else {
        toast.error("Failed to update profile"); // Error toast
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile"); // Error toast
    } finally {
      setLoading(false);
    }
  }

  if (!session) return null; // Ensure user is logged in before rendering

  return (
    <>
      <div className="relative">
        {/* Full-page spinner overlay */}
        {loading && (
          <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-70 z-50">
            <Spinner />
          </div>
        )}

        <motion.div
          className="my-10 w-full max-w-5xl mx-auto p-4 sm:p-8 bg-white shadow-lg rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <motion.h2
            className="text-2xl font-bold text-gray-800 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Profile Settings
          </motion.h2>

          {/* Name Input */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <label className="block font-medium text-gray-700">Name</label>
            <input
              type="text"
              className="w-full mt-2 p-2 border rounded-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={name === "" ? session?.user?.email : ""}
            />
          </motion.div>

          {/* Profile Image Upload */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <label className="block font-medium text-gray-700">Photo</label>
            <div className="flex items-center gap-4 mt-2 flex-wrap sm:flex-nowrap">
              {!image ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="w-10 h-10 rounded-full border border-gray-300"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              ) : (
                <Image
                  className="w-10 h-10 rounded-full border border-gray-300"
                  src={image}
                  alt={session?.user?.email}
                  width={40}
                  height={40}
                />
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </motion.div>

          {/* Save & Logout Buttons */}
          <motion.div
            className="flex justify-between flex-wrap mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <button
              onClick={logout}
              className="px-6 py-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-400 w-full sm:w-auto mb-4 sm:mb-0"
            >
              Logout
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
