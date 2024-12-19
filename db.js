const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();

const client = new MongoClient(process.env.CONNECTION);

async function run() {
  await client.connect().then(function () {
    console.log("Connected to MongoDB");
  });
  module.exports = client;
  const app = require("./server");
  app.listen(process.env.PORT, () => {
    console.log("Server is running on port 3000");
  });
}
run();
