// cloudinary.js
import axios from "axios";

export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "unsigned_electro");

  const res = await axios.post(
    "https://api.cloudinary.com/v1_1/dqp0mtqdn/image/upload",
    formData
  );

  return {
    url: res.data.secure_url,
    public_id: res.data.public_id,
  };
};
