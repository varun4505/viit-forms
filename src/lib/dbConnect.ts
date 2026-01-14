import mongoose, { Connection, Mongoose } from 'mongoose';

// Define proper types for our cached mongoose instance
interface MongooseCache {
  conn: Connection | null;
  promise: Promise<Mongoose> | null;
}

// Extend the NodeJS global type correctly
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Initialize the cached connection object
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

// Update the global mongoose object
if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Connect to MongoDB using mongoose
 * @returns A Promise that resolves to the mongoose connection
 */
async function dbConnect(): Promise<Connection> {
  // If the connection is already established, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If the connection promise doesn't exist, create a new connection
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => {
      return mongoose;
    });
  }

  // Wait for the connection to be established
  try {
    const mongooseInstance = await cached.promise;
    cached.conn = mongooseInstance.connection;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default dbConnect;