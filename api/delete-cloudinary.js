export default async function handler(req, res) {
  // Chỉ cho phép phương thức POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { publicIds } = req.body;

  if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
    return res.status(400).json({ error: "No public IDs provided" });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return res
      .status(500)
      .json({ error: "Missing Cloudinary environment variables" });
  }

  try {
    // Mã hóa thông tin xác thực Basic Auth từ API Key và API Secret
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

    // Tạo danh sách public_ids trên query string để gọi Cloudinary API
    const params = new URLSearchParams();
    publicIds.forEach((id) => params.append("public_ids", id));

    // Gọi trực tiếp Cloudinary REST API bằng fetch có sẵn trong Node.js
    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?${params.toString()}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${auth}`,
        },
      },
    );

    const data = await cloudinaryRes.json();

    if (!cloudinaryRes.ok) {
      throw new Error(
        data.error?.message || "Failed to delete from Cloudinary",
      );
    }

    return res.status(200).json({ success: true, result: data });
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return res
      .status(500)
      .json({
        error: error.message || "Failed to delete images from Cloudinary",
      });
  }
}
