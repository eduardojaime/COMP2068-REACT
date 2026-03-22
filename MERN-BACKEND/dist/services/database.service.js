// External Dependencies
import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";
dotenv.config();
// Global Variables
export const collections = {};
// Initialize Connection
export async function connectToDatabase() {
    dotenv.config();
    const connString = process.env.DB_CONN_STRING;
    if (!connString) {
        throw new Error("DB_CONN_STRING is not defined in environment variables");
    }
    const client = new mongoDB.MongoClient(connString);
    await client.connect();
    const db = client.db(process.env.DB_NAME);
    const collectionName = process.env.COLLECTION_NAME;
    if (!collectionName) {
        throw new Error("COLLECTION_NAME is not defined in environment variables");
    }
    const sushiCollection = db.collection(collectionName);
    collections.sushiMenu = sushiCollection;
    console.log(`Successfully connected to database: ${db.databaseName} and collection: ${sushiCollection.collectionName}`);
}
//# sourceMappingURL=database.service.js.map