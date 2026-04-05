// External Dependencies
import * as mongoDB from "mongodb";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();
// Global Variables
export const collections: { sushiMenu?: mongoDB.Collection } = {};
// Initialize Connection
export async function connectToDatabase() {
  dotenv.config();

  const connString = process.env.DB_CONN_STRING;
  if (!connString) {
    throw new Error("DB_CONN_STRING is not defined in environment variables");
  }

  const dbName = process.env.DB_NAME;
  if (!dbName) {
    throw new Error("DB_NAME is not defined in environment variables");
  }

  // Connect Mongoose (for User authentication)
  const mongooseUri = `${connString}${dbName}`;
  await mongoose.connect(mongooseUri);
  console.log(`Mongoose connected to database: ${dbName}`);

  // Connect native MongoDB driver (for Sushi operations)
  const client: mongoDB.MongoClient = new mongoDB.MongoClient(connString);
  await client.connect();
  const db: mongoDB.Db = client.db(dbName);

  const collectionName = process.env.COLLECTION_NAME;
  if (!collectionName) {
    throw new Error("COLLECTION_NAME is not defined in environment variables");
  }

  const sushiCollection: mongoDB.Collection = db.collection(collectionName);
  collections.sushiMenu = sushiCollection;

  console.log(
    `MongoDB native driver connected to database: ${db.databaseName} and collection: ${sushiCollection.collectionName}`,
  );
}
