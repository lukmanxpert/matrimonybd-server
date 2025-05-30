import e from "express";
import { usersCollection } from "../index.js";
import { ObjectId } from "mongodb";
e.json();

export const addFavouriteBiodataController = async (req, res) => {
  try {
    const { biodataId, name, permanentAddress, occupation } = req.body;
    const favouriteData = {
      biodataId,
      name,
      permanentAddress,
      occupation,
    };
    const userEmail = req.userInfo.userEmail;
    const user = await usersCollection.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
        error: true,
      });
    }
    if (!user.favouriteBiodata) {
      user.favouriteBiodata = [];
    }
    const existingBiodata = user.favouriteBiodata.find(
      (item) => item.biodataId === biodataId
    );
    if (existingBiodata) {
      return res.status(400).json({
        message: "Biodata already exists in favourites",
        success: false,
        error: true,
      });
    }
    user.favouriteBiodata.push(favouriteData);
    const updatedUser = await usersCollection.updateOne(
      { email: userEmail },
      { $set: { favouriteBiodata: user.favouriteBiodata } }
    );
    if (updatedUser.modifiedCount === 0) {
      return res.status(500).json({
        message: "Failed to add biodata to favourites",
        success: false,
        error: true,
      });
    }
    return res.status(200).json({
      message: "Biodata added to favourites successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
};
