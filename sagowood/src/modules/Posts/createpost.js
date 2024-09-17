import React, { useState } from "react";
import Input from "../../components/input"; // Corrected import path for Input component
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";

const CreatePost = () => {
  const [data, setData] = useState({
    caption: "",
    desc: "",
    img: "",
  });
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  // save tren cloudinary
  const uploadImage = async () => {
    const formData = new FormData();
    formData.append("file", data.img);
    formData.append("upload_preset", "sagowood_network");
    formData.append("cloud_name", "dvnsihl8y");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/dvnsihl8y/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    if (res.status === 200) {
      return await res.json();
    } else {
      return "Error";
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const uploadResponse = await uploadImage();
      if (uploadResponse === "Error") {
        console.error("Image upload failed.");
        return;
      }

      const secureUrl = uploadResponse.secure_url; // Ensure you're getting the secure_url

      const response = await fetch("http://localhost:8000/api/createpost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("user:token")}`, // Correctly include the token
        },
        body: JSON.stringify({
          caption: data.caption,
          desc: data.desc,
          url: secureUrl, 
        }),
      });

      if (response.ok) {
        navigate("/");
      } else {
        console.log("Error:", await response.text());
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-[800px] h-[600px] p-6">
        <form onSubmit={handleSubmit}>
          <Input
            placeholder="Caption..."
            name="caption"
            className="py-4"
            value={data.caption}
            onChange={(e) => setData({ ...data, caption: e.target.value })}
            isRequired={true}
          />
          <textarea
            rows={10}
            className="w-full border shadow p-4 resize-none"
            placeholder="Description..."
            value={data.desc}
            onChange={(e) => setData({ ...data, desc: e.target.value })}
            required
          />
          <Input
            type="file"
            name="image"
            className="py-4 hidden"
            onChange={(e) => setData({ ...data, img: e.target.files[0] })}
            isRequired={false}
          />
          <label
            htmlFor="image"
            className="cursor-pointer p-4 border shadow w-full"
          >
            {data?.img?.name || "Upload Image"}
          </label>
          <Button label="Create Post" type="submit" className=" float-right" />
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
