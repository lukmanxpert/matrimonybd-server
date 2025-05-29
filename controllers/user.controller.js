import e from "express";
e.json();

export const addFavouriteBiodataController = async (req, res) => {
  try {
    const { userId, biodataId } = req.body;
    if (!userId || !biodataId) {
      return res.status(400).json({
        message: "User ID and Biodata ID are required",
        success: false,
        error: true,
      });
    }
    console.log(req.body);
    return res.status(200).json({
      data: req.body,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
};
