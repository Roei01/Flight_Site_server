import { MongoClient } from 'mongodb';
import { expect } from 'chai';

describe('Database Connection Test', function () {
    let client;

    before(async function () {
        // MongoDB connection URI
        const uri = 'mongodb://localhost:27017';
        client = new MongoClient(uri);
        await client.connect(); // Establish the connection
    });

    after(async function () {
        // Close the database connection after the test
        await client.close();
    });

    it('should connect to the MongoDB server successfully', function () {
        // Check if the client is connected by ensuring the topology is not null
        expect(client.topology).to.not.be.null;
        expect(client.topology.isConnected()).to.be.true; // Ensure the topology is connected
    });
});
