import { MongoClient } from 'mongodb';
import { databaseName, databaseUrl, usersCollectionName } from './config';

export const client = new MongoClient(databaseUrl);
export const database = client.db(databaseName);

export const usersCollection = database.collection(usersCollectionName);

usersCollection.createIndex({ "contact.phone": 1 }, { unique: true });

export async function connectToDatabase() {
    await client.connect();
    console.log("Successfully connected to database!")
}