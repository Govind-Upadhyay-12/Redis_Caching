import express from "express";
import redis from "redis";
import axios from "axios";
const client = redis.createClient("redis://127.0.0.1:6379");
client.connect();
client.on("connect", function () {
  console.log("Connected to Redis");
});
const app = express();
app.use(express.json());
const PORT = 8080;
app.post("/", async (req, res) => {
  try {
    console.log("Data received");
    const { key, value } = req.body;
    const data = await client.set(key, value);
    console.log("data is set");
    res.json(data); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/", async (req, res) => {
  const { key } = req.body;
  try {
    const getdata = await client.get(key);
    return res.json(getdata);
  } catch (error) {
    console.log(error);
  }
});
app.get("/post/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const cachedPost = await client.get(`post-${id}`);
    if (cachedPost) {
      return res.json(JSON.parse(cachedPost));
    }
    const response = await axios.get(`https://dummyjson.com/products/${id}`);
    await client.set(`post-${id}`, JSON.stringify(response.data),"EX",10);
    return res.json(response.data);
  } catch (error) {
    console.log(error);
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
