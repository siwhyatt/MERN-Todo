const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();


// MongoDB Connection
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function initializeUserSettings() {
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME);

    const usersCollection = db.collection('users');
    const userSettingsCollection = db.collection('userSettings');

    const users = await usersCollection.find().toArray();

    const bulkOps = users.map((user) => ({
      updateOne: {
        filter: { userId: new ObjectId(user._id) },
        update: {
          $setOnInsert: {
            userId: new ObjectId(user._id),
            defaultTime: 15,
            defaultPriority: 'medium',
          },
        },
        upsert: true,
      },
    }));

    if (bulkOps.length > 0) {
      await userSettingsCollection.bulkWrite(bulkOps);
    }

    console.log(`Initialized user settings for ${bulkOps.length} users.`);
  } catch (error) {
    console.error('Error initializing user settings:', error);
  } finally {
    await client.close();
  }
}

initializeUserSettings();

