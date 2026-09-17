// One-way sync: copies every collection from the production database down into
// a local database, for local development/testing. Never writes to production.
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function main(): Promise<void> {
  const productionUri = process.env.MONGO_PRODUCTION_URI;
  const localUri = process.env.MONGO_LOCAL_URI || 'mongodb://localhost:27017';
  const productionDbName = process.env.MONGO_PRODUCTION_DB_NAME || 'test';
  const localDbName = process.env.MONGO_LOCAL_DB_NAME;

  if (!productionUri) {
    console.error('MONGO_PRODUCTION_URI environment variable is required');
    process.exit(1);
  }
  if (!localDbName) {
    console.error('MONGO_LOCAL_DB_NAME environment variable is required');
    process.exit(1);
  }

  console.log('Database Sync Utility');
  console.log('======================');
  console.log(`Production DB: ${productionDbName}`);
  console.log(`Local DB: ${localDbName}`);
  console.log('======================\n');

  const productionClient = new MongoClient(productionUri);
  const localClient = new MongoClient(localUri);

  try {
    await productionClient.connect();
    await localClient.connect();
    console.log('Connected to both databases');

    const productionDb = productionClient.db(productionDbName);
    const localDb = localClient.db(localDbName);

    const collections = await productionDb.listCollections().toArray();
    console.log(`Found ${collections.length} collections to sync:`, collections.map((c) => c.name));

    for (const { name } of collections) {
      const sourceCollection = productionDb.collection(name);
      const targetCollection = localDb.collection(name);

      const totalDocs = await sourceCollection.countDocuments();
      console.log(`Syncing collection: ${name} (${totalDocs} documents)`);

      if (totalDocs === 0) {
        console.log(`  Skipping empty collection: ${name}`);
        continue;
      }

      await targetCollection.deleteMany({});

      const batchSize = 1000;
      let processed = 0;
      let batch: Record<string, unknown>[] = [];

      const cursor = sourceCollection.find({}).batchSize(batchSize);
      for await (const doc of cursor) {
        batch.push(doc);
        if (batch.length === batchSize) {
          await targetCollection.insertMany(batch);
          processed += batch.length;
          console.log(`  Progress: ${processed}/${totalDocs}`);
          batch = [];
        }
      }
      if (batch.length > 0) {
        await targetCollection.insertMany(batch);
        processed += batch.length;
      }
      console.log(`  Done: ${processed}/${totalDocs} documents copied`);
    }

    console.log('\nDatabase synchronization completed successfully!');
  } catch (error) {
    console.error('Sync failed:', error);
    process.exitCode = 1;
  } finally {
    await productionClient.close();
    await localClient.close();
    console.log('Connections closed');
  }
}

main();
