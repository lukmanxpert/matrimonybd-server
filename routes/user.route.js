import { Router } from "express";
import {
  addFavouriteBiodataController,
  getFavouriteBiodataController,
  removeFavouriteBiodataController,
} from "../controllers/user.controller.js";
import verifyToken from "../middleware/verifyToken.js";

const userRouter = Router();

userRouter.post(
  "/addFavouriteBiodata",
  verifyToken,
  addFavouriteBiodataController
);
userRouter.get(
  "/favouriteBiodatas",
  verifyToken,
  getFavouriteBiodataController
);
userRouter.put(
  "/deleteFavouriteBiodata",
  verifyToken,
  removeFavouriteBiodataController
);

export default userRouter;
