const express = require('express');
const path = require('path');
const fs = require('fs');
const { MongoClient } = require('mongodb');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Local run: localhost. Docker/compose: set MONGO_URL=mongodb://admin:password@mongodb:27017
const mongoUrl = process.env.MONGO_URL || 'mongodb://admin:password@localhost:27017';
const databaseName = 'my-db';

// One shared client for the whole app instead of reconnecting on every request
const client = new MongoClient(mongoUrl);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/profile-picture', (req, res) => {
  res.sendFile(path.join(__dirname, 'images/profile-1.jpg'));
});

app.post('/update-profile', async (req, res) => {
  try {
    const userObj = { ...req.body, userid: 1 };
    await client.db(databaseName).collection('users')
      .updateOne({ userid: 1 }, { $set: userObj }, { upsert: true });
    res.send(userObj);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Failed to update profile' });
  }
});

app.get('/get-profile', async (req, res) => {
  try {
    const result = await client.db(databaseName).collection('users').findOne({ userid: 1 });
    res.send(result || {});
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Failed to load profile' });
  }
});

async function start() {
  await client.connect();
  app.listen(3000, () => console.log('app listening on port 3000!'));
}

start().catch((err) => {
  console.error('Failed to start', err);
  process.exit(1);
});