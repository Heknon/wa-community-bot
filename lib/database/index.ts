import { MongoClient } from 'mongodb';
import { databaseName, databaseUrl, groupsCollectionName, usersCollectionName } from './config';

export const client = new MongoClient(databaseUrl);
export const database = client.db(databaseName);

export const usersCollection = database.collection(usersCollectionName);
export const groupsCollection = database.collection(groupsCollectionName);

usersCollection.createIndex({ "jid": 1 }, { unique: true });
groupsCollection.createIndex({ "jid": 1 }, { unique: true });

export async function connectToDatabase() {
    await client.connect();
    console.log("Successfully connected to database!")
}