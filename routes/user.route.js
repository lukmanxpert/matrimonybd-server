import { Router } from "express";
import { addFavouriteBiodataController } from "../controllers/user.controller.js";
import verifyToken from "../middleware/verifyToken.js";

const userRouter = Router();

userRouter.post("/addFavouriteBiodata", verifyToken, addFavouriteBiodataController);

export default userRouter;