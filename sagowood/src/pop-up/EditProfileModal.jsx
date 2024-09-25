import React, { useState } from "react";
import Input from "../components/input";

const EditProfileModal = ({ isOpen, onClose, user, onSave }) => {
  const [username, setUsername] = useState(user.username || "");
  const [email, setEmail] = useState(user.email || "");
  const [image, setImage] = useState(user.image || "");
  const [imageFile, setImageFile] = useState(null);

  // Hàm tải ảnh lên Cloudinary
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "sagowood_network"); // Thay bằng preset của bạn
    formData.append("cloud_name", "dvnsihl8y"); // Thay bằng cloud name của bạn

    const res = await fetch("https://api.cloudinary.com/v1_1/dvnsihl8y/upload", {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      return data.secure_url;
    } else {
      console.error("Failed to upload image");
      return null;
    }
  };

  const handleSave = async () => {
    try {
      let imageUrl = image;

      if (imageFile) {
        // Tải ảnh lên Cloudinary và lấy URL
        imageUrl = await uploadImage(imageFile);
      }

      const response = await fetch("http://localhost:8000/api/edit-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("user:token")}`,
        },
        body: JSON.stringify({ username, email, image: imageUrl }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        onSave(updatedUser);
        onClose();
      } else {
        console.error("Failed to save profile");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-black p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
        <label className="block mb-2">
          UserName
          <input
            type="text"
            value={user.username||"Username"}
            onChange={(e) => setUsername(e.target.value)}
            className="block w-full p-2 border rounded dark:text-white dark:bg-black"
          />
        </label>
        <label className="block mb-2">
          Email
          <input
            type="email"
            value={user.email||"Email"}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full p-2 border rounded dark:text-white dark:bg-black"
          />
        </label>
        <Input
          type="file"
          name="image"
          className="py-4 hidden"
          onChange={(e) => {
            setImageFile(e.target.files[0]);
            setImage(e.target.files[0]?.name || "");
          }}
          isRequired={false}
        />
        <label
          htmlFor="image"
          className="cursor-pointer p-4 border shadow w-full"
        >
          {image || "Upload Image"}
        </label>
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="ml-4 bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
