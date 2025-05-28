import { Router } from "express";
import { getSimilarBiodataController } from "../controllers/biodata.controller.js";

const biodataRouter = Router();

biodataRouter.post("/similar-biodata/:biodataType", getSimilarBiodataController);
export default biodataRouter;
