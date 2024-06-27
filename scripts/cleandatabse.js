const { MongoClient } = require('mongodb');
require('dotenv').config();

async function removeCompletedField() {
  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db(process.env.DB_NAME);
    const todos = database.collection("todos");

    const result = await todos.updateMany({}, { $unset: { completed: "" } });
    console.log(`${result.modifiedCount} document(s) were updated`);
  } finally {
    await client.close();
  }
}

removeCompletedField().catch(console.error);
