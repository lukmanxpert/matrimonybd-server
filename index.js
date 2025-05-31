import express from "express";
import cors from "cors";
import biodataRouter from "./routes/biodata.route.js";
import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";
import verifyToken from "./middleware/verifyToken.js";
import jwt from "jsonwebtoken";
dotenv.config();

const app = express();
const port = process.env.PORT || 9000;

export let usersCollection;
export let biodataCollection;
export let favouritesCollection;

// middleware
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use("/api/biodata", biodataRouter);
app.use("/api/users", userRouter);

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
    // await client.connect();
    const matrimonyBD = client.db("matrimonyBD");
    usersCollection = matrimonyBD.collection("users");
    biodataCollection = matrimonyBD.collection("biodata's");
    favouritesCollection = matrimonyBD.collection("favourites");

    // initial api
    app.get("/", (req, res) => {
      res.send("hello world!!");
    });

    // jtw token generate
    app.post("/jwt", async (req, res) => {
      const { userEmail } = req.body;
      const token = jwt.sign({ userEmail }, process.env.secret_key, {
        expiresIn: "1h",
      });
      res.send(token);
    });

    // isAdmin
    app.get("/isAdmin/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email };
      const result = await usersCollection.findOne(filter);
      res.send(result?.role);
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

      try {
        const existingBiodata = await biodataCollection.findOne(filter);

        let updateDoc;

        if (existingBiodata) {
          updateDoc = {
            $set: { ...data, biodataId: existingBiodata.biodataId },
          };
        } else {
          const lastBiodata = await biodataCollection.findOne(
            {},
            { sort: { biodataId: -1 } }
          );

          let newBiodataId = 1;

          if (lastBiodata && typeof lastBiodata.biodataId === "number") {
            newBiodataId = lastBiodata.biodataId + 1;
          }

          updateDoc = {
            $set: { ...data, biodataId: newBiodataId },
          };
        }

        const updatedResult = await biodataCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.send(updatedResult);
      } catch (error) {
        console.error("Error processing biodata:", error);
        res.status(500).send({ error: error.message });
      }
    });

    app.get("/biodata/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await biodataCollection.findOne(query);
      res.send(result);
    });

    // biodata premium request
    app.post("/biodata/premium-request", verifyToken, async (req, res) => {
      const data = req.body;
      const email = data.email;
      if (data.email !== req.user.email) {
        res.status(401).send("unauthorize access");
      }
      const filter = { email };
      const updateDoc = {
        $set: {
          premiumStatus: "pending",
        },
      };
      const result = await biodataCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // premium request
    app.get("/premiumRequests", verifyToken, async (req, res) => {
      const query = {
        premiumStatus: "pending",
      };
      const result = await biodataCollection.find(query).toArray();
      res.send(result);
    });
    // approved premium
    app.post("/approvePremium/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = {
        biodataId: parseInt(id),
      };
      const updateDoc = {
        $set: {
          premiumStatus: "premium",
        },
      };
      const result = await biodataCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // get all users
    app.get("/users", verifyToken, async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // users make admin
    app.put("/users/make-admin/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = {
        email,
      };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // make premium
    app.put("/users/make-premium/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const updateDoc = {
        $set: {
          isPremium: "premium",
        },
      };
      const result = await usersCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // is premium api
    app.get("/users/isPremium/:email", verifyToken, async (req, res) => {
      try {
        const email = req.params.email;
        const query = { email };
        const result = await usersCollection.findOne(query);

        if (!result) {
          return res.send(false);
        }

        const isPremium = result.isPremium === "premium";
        res.send(isPremium);
      } catch (error) {
        console.error("Error fetching premium status:", error);
        res.status(500).send({ error: error.message });
      }
    });

    // get all biodatas
    app.get("/biodatas", async (req, res) => {
      const result = await biodataCollection.find().toArray();
      res.send(result);
    });
    // get specific biodata
    app.get("/biodatas/:biodataId", verifyToken, async (req, res) => {
      const biodataId = parseInt(req.params.biodataId);
      const query = { biodataId };
      const result = await biodataCollection.findOne(query);
      res.send(result);
    });

    // get premiumMembers
    app.get("/premiumMembers", async (req, res) => {
      const query = { premiumStatus: "premium" };
      const result = await biodataCollection.find(query).limit(6).toArray();
      res.send(result);
    });

    // total biodata
    app.get("/totalBiodata", verifyToken, async (req, res) => {
      const result = await biodataCollection.find().toArray();
      res.send(result);
    });
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);
app.listen(port, () => {
  console.log(`app is listening at port: ${port}`);
});