const Category = require("../Models/CategoryModel");
const { supabase } = require("../supabaseConfig");

module.exports.registerCategory = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    const { category, description } = req.body;
    const image = req.file;

    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }

    const { data, error } = await supabase
      .storage
      .from('canteenz')
      .upload(Date.now() + "-" + image.originalname, image.buffer, {
        contentType: image.mimetype
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }

    console.log('Supabase upload data:', data);

    const imageName = data.path;
    console.log('Image Name:', imageName);

    const newCategory = new Category({ category, image: imageName, description });
    await newCategory.save();
    res.status(201).json({ message: "Category registered successfully", success: true });
  } catch (error) {
    console.error('Catch block error:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};