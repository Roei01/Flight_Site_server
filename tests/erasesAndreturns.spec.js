import { MongoClient } from 'mongodb';
import { expect } from 'chai';

describe('Database Delete and Retrieve Test', function () {
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
        // Cleanup: Close the database connection
        await client.close();
    });

    it('should insert, delete, and verify deletion of a document', async function () {
        const collection = db.collection('testCollection'); // Replace 'testCollection' with your collection name

        // Step 1: Insert a test document
        const testDocument = { name: 'Test Flight', status: 'On Time' };
        const insertResult = await collection.insertOne(testDocument);
        expect(insertResult.insertedId).to.not.be.undefined; // Ensure the document was inserted

        // Step 2: Verify the document exists
        const savedDocument = await collection.findOne({ _id: insertResult.insertedId });
        expect(savedDocument).to.deep.equal(testDocument); // Ensure the saved document matches

        // Step 3: Delete the document
        const deleteResult = await collection.deleteOne({ _id: insertResult.insertedId });
        expect(deleteResult.deletedCount).to.equal(1); // Ensure one document was deleted

        // Step 4: Verify the document no longer exists
        const deletedDocument = await collection.findOne({ _id: insertResult.insertedId });
        expect(deletedDocument).to.be.null; // Confirm the document was deleted
    });
});
