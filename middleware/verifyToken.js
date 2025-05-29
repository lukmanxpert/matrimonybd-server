import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const data = req.headers.authorization;
  const token = data && data.split(" ")[1];
  if (!token) {
    return res.status(401).send(["unauthorize access"]);
  }
  jwt.verify(token, process.env.secret_key, function (err, decoded) {
    if (err) {
      return res.status(401).send("unauthorize access");
    }
    req.user = decoded;
    next();
  });
};

export default verifyToken;
