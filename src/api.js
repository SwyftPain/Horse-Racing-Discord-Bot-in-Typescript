const express = require('express');
const app = express();
const { QuickDB } = require('quick.db');

const db = new QuickDB();

app.get('/horse/:id', async (req, res) => {
  const userId = req.params.id;
  const horse = await db.get(`${userId}_horse`);
  const profile = await db.get(`${userId}_profile`);
  const races = await db.get(`${userId}_races`);
  const data = {
    horse,
    profile,
    races
  };
  res.send(data);
});

app.listen(3000, () => {
  console.log('API listening on port 3000');
});
