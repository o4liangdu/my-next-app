import { MongoClient } from 'mongodb';

async function initializeDatabase() {
  // Get MongoDB URI from environment variables
  const uri = process.env.MONGODB_URI || '';
  
  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');

    // Get the database
    const db = client.db('video_app');

    // Create the video_ratings collection
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (!collectionNames.includes('video_ratings')) {
      await db.createCollection('video_ratings');
      console.log('Created video_ratings collection');
    } else {
      console.log('video_ratings collection already exists');
    }

    // Get the video_ratings collection
    const collection = db.collection('video_ratings');

    // Create index on videoId for faster queries
    await collection.createIndex({ videoId: 1 }, { unique: true });
    console.log('Created unique index on videoId');

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the initialization
initializeDatabase().catch(console.error);