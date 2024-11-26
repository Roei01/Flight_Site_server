import { MongoClient } from 'mongodb';
import { expect } from 'chai';

describe('Database Save Data Test', function () {
    let client;
    let db;

    before(async function () {
        // MongoDB connection URI
        const uri = 'mongodb://localhost:27017';
        client = new MongoClient(uri);
        await client.connect(); // Establish the connection

        // Connect to the test database
        db = client.db('testDB'); // Replace 'testDB' with your database name
    });

    after(async function () {
        // Cleanup: Close the database connection and delete test data
        await db.collection('testCollection').deleteMany({}); // Replace 'testCollection' with your collection name
        await client.close();
    });

    it('should save a document to the database', async function () {
        const collection = db.collection('testCollection'); // Replace 'testCollection' with your collection name

        // Insert a test document
        const testDocument = { name: 'Test Flight', status: 'On Time' };
        const result = await collection.insertOne(testDocument);

        // Verify the document was inserted
        expect(result.insertedId).to.not.be.undefined; // Check if an ID was generated

        // Retrieve the inserted document
        const savedDocument = await collection.findOne({ _id: result.insertedId });
        expect(savedDocument).to.deep.equal(testDocument); // Ensure the saved document matches the input
    });
});
