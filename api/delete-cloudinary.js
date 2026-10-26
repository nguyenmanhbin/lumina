const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  // Chỉ cho phép phương thức POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { publicIds } = req.body;

  if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
    return res.status(400).json({ error: "No public IDs provided" });
  }

  try {
    // Xóa hàng loạt ảnh trên Cloudinary dựa vào public_id
    const result = await cloudinary.api.delete_resources(publicIds);
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return res
      .status(500)
      .json({ error: "Failed to delete images from Cloudinary" });
  }
}
