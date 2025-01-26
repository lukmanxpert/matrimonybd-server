const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const jwt = require("jsonwebtoken");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 9000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.mongo_user}:${process.env.mongo_pass}@cluster0.l73rt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const matrimonyBD = client.db("matrimonyBD");
    const usersCollection = matrimonyBD.collection("users");
    const biodataCollection = matrimonyBD.collection("biodata's");

    // initial api
    app.get("/", (req, res) => {
      res.send("hello world!!");
    });

    // jtw token generate
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.secret_key, {
        expiresIn: "1h",
      });
      res.send(token);
    });

    // middleware
    // verify token
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

    // isAdmin
    app.get("/isAdmin/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const filter = { email };
      const result = await usersCollection.findOne(filter);
      res.send(result.role);
    });

    // post user api
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const userExist = await usersCollection.findOne(query);
      if (userExist) {
        return res.send("user already exist");
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    app.post("/biodata", verifyToken, async (req, res) => {
      const data = req.body;
      const filter = { email: data.email };
      const options = { upsert: true };
      const updateDoc = {
        $set: { ...data },
      };

      try {
        const updatedResult = await biodataCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.send(updatedResult);
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`app is listening at port: ${port}`);
});
