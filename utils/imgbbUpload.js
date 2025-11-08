import axios from "axios";
import fs from "fs";

export const uploadToImgBB = async (filePath) => {
  try {
    const API_KEY = process.env.IMGBB_API_KEY;
    
    if (!API_KEY) {
      throw new Error("IMGBB_API_KEY is not configured in environment variables");
    }

    const imageBase64 = fs.readFileSync(filePath, { encoding: "base64" });

    const formData = new URLSearchParams();
    formData.append('image', imageBase64);

    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${API_KEY}`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    fs.unlinkSync(filePath);

    return response.data.data.url;
  } catch (err) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error(`ImgBB upload failed: ${err.message}`);
  }
};


export const uploadBase64ToImgBB = async (base64String) => {
  try {
    const API_KEY = process.env.IMGBB_API_KEY;
    
    if (!API_KEY) {
      throw new Error("IMGBB_API_KEY is not configured in environment variables");
    }
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');

    const formData = new URLSearchParams();
    formData.append('image', base64Data);

    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${API_KEY}`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data.data.url;
  } catch (err) {
    throw new Error(`ImgBB upload failed: ${err.message}`);
  }
};

export const uploadMultipleToImgBB = async (files) => {
  if (!files || files.length === 0) {
    return [];
  }

  const uploadPromises = files.map((file) => uploadToImgBB(file.path));
  return await Promise.all(uploadPromises);
};
export const processImageArray = async (images) => {
  if (!images || images.length === 0) {
    return [];
  }

  const processedImages = await Promise.all(
    images.map(async (img) => {
      if (img.startsWith('data:image') || (!img.startsWith('http') && img.length > 100)) {
        try {
          return await uploadBase64ToImgBB(img);
        } catch (err) {
          console.error('Failed to upload base64 image:', err.message);
          return null; // Skip failed uploads
        }
      }
      return img;
    })
  );

  return processedImages.filter(img => img !== null);
};
