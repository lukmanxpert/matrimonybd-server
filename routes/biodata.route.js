import { Router } from "express";
import { getSimilarBiodataController } from "../controllers/biodata.controller.js";

const biodataRouter = Router();

biodataRouter.post("/similar-biodata", getSimilarBiodataController);
export default biodataRouter;
