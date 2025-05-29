import { ObjectId } from "mongodb";
import { biodataCollection } from "../index.js";

export const getSimilarBiodataController = async (req, res) => {
  try {
    const { biodataType } = req.params;
    if (!biodataType) {
      return res.status(400).json({
        message: "Biodata type is required",
        success: false,
        error: true,
      });
    }
    if (biodataType !== "Male" && biodataType !== "Female") {
      return res.status(400).json({
        message: "Invalid biodata type.",
        success: false,
        error: true,
      });
    }
    const query = { biodataType };
    const excludedId = req.query.excludeId; // or get it from req.params or req.body
    if (excludedId) {
      query._id = { $ne: new ObjectId(excludedId) };
    }
    const biodata = await biodataCollection.find(query).limit(3).toArray();
    if (biodata.length === 0) {
      return res.status(404).json({
        message: "No biodata found for the specified type",
        success: false,
        error: true,
      });
    }
    return res.json({
      message: "Similar biodata fetched successfully",
      success: true,
      data: biodata,
    });
    console.log(biodataType);
  } catch (error) {
    return res.json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
};
