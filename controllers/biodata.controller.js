export const getSimilarBiodataController = async (req, res) => {
  try {
    const data = req.body;
    // if (!biodataType) {
    //     return res.json({
    //         message: "Biodata type not found!"
    //     })
    // }

    return res.json({
      data: data,
    });
  } catch (error) {
    return res.json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
};
