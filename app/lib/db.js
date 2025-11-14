import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let cached = global._mongoCache;

if (!cached) {
  cached = global._mongoCache = { client: null, db: null };
}

export async function ConnectToDatabase() {
  if (cached.db) {
    return cached.db;
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000, 
  });

  await client.connect();
  const db = client.db();

  cached.client = client;
  cached.db = db;

  return db;
}
