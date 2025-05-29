import { Router } from "express";
import { addFavouriteBiodataController } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.post("/addFavouriteBiodata", addFavouriteBiodataController);

export default userRouter;