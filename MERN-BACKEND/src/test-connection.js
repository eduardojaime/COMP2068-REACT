import { MongoClient } from "mongodb";

// REPLACE THIS with your actual connection string
// (Rule out .env issues by hardcoding it here for the test)
const uri =
  "mongodb+srv://username:password@benscluster.lh9npfd.mongodb.net/?appName=BensCluster";

const client = new MongoClient(uri);

async function run() {
  try {
    console.log("Attempting to connect to MongoDB Atlas...");
    await client.connect();

    // This command "pings" the database to see if we are actually authenticated
    await client.db("admin").command({ ping: 1 });

    console.log("✅ SUCCESS! You are connected and authenticated.");
  } catch (error) {
    console.error("❌ CONNECTION FAILED:");
    console.error(error.message);
  } finally {
    await client.close();
  }
}

run();
