const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 9000;
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

    // initial api
    app.get("/", (req, res) => {
      res.send("hello world!!");
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
