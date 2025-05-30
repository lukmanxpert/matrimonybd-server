import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const data = req.headers.authorization;
  const token = data && data.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "unauthorize access",
      success: false,
      error: true,
    });
  }
  jwt.verify(token, process.env.secret_key, function (err, decoded) {
    if (err) {
      return res.status(401).send("unauthorize access");
    }
    req.userInfo = decoded;
    next();
  });
};

export default verifyToken;
