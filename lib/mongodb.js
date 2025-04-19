// lib/db.js
import { MongoClient, ServerApiVersion } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri, options);
    global._mongoClient.connect(); // Ensure connection in development
  }
  client = global._mongoClient;
} else {
  client = new MongoClient(uri, options);
  client.connect(); // Connect once in production
}

export default client;
