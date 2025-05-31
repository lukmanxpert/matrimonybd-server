import e from "express";
import { usersCollection } from "../index.js"; 
e.json();

// add favourite biodata
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
      return res.json({
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

// get favourite biodata
export const getFavouriteBiodataController = async (req, res) => {
  try {
    const userEmail = req.userInfo.userEmail;
    const user = await usersCollection.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
        error: true,
      });
    }
    if (!user.favouriteBiodata || user.favouriteBiodata.length === 0) {
      return res.status(200).json({
        message: "No favourite biodata found",
        success: true,
        error: false,
        data: [],
      });
    }
    return res.status(200).json({
      message: "Favourite biodata retrieved successfully",
      success: true,
      error: false,
      data: user.favouriteBiodata,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
};

// remove favourite biodata
export const removeFavouriteBiodataController = async (req, res) => {
  try {
    const { biodataId } = req.body;
    const userEmail = req.userInfo.userEmail;
    const user = await usersCollection.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
        error: true,
      });
    }
    if (!user.favouriteBiodata || user.favouriteBiodata.length === 0) {
      return res.status(200).json({
        message: "No favourite biodata found",
        success: true,
        error: false,
      });
    }
    user.favouriteBiodata = user.favouriteBiodata.filter(
      (item) => item.biodataId !== biodataId
    );
    const updatedUser = await usersCollection.updateOne(
      { email: userEmail },
      { $set: { favouriteBiodata: user.favouriteBiodata } }
    );
    if (updatedUser.modifiedCount === 0) {
      return res.status(500).json({
        message: "Failed to remove biodata from favourites",
        success: false,
        error: true,
      });
    }
    return res.status(200).json({
      message: "Biodata removed from favourites successfully",
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
