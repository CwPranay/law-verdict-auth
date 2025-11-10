import {MongoClient} from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cachedClient = global._mongoClient;
let cachedDb = global._mongoDb;

export async function ConnectToDatabase(){
    if (cachedClient && cachedDb) {
        return cachedDb;
    }

    const client = new MongoClient(uri);

    await client.connect();
    const db = client.db();
    global._mongoClient = client;
    global._mongoDb = db;
    return db;
}