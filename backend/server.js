const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client } = require('pg');
const app = express();
app.use(bodyParser.json());
app.use(cors()); //cord for connecting front and back


//db
const client = new Client({
  user: 'team_1g',
  host: 'csce-315-db.engr.tamu.edu',
  database: 'team_1g_db',
  password: 'woobat',
  port: 5432,
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL server'))
  .catch(err => console.error('Connection error', err.stack));

app.post('/customer-login', async (req, res) => {
  const { login, password } = req.body;

  try {
    const result = await client.query('SELECT * FROM users WHERE login = $1;', [login]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid login or password' });
    }

    const user = result.rows[0];
    if (user.type !== 'customer') {
      return res.status(400).json({ error: 'Invalid..log in on the right page' });
    }

    const isMatch = password === user.password;

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid login or password' });
    }

    const message = 'Customer login successful';
    res.json({ message, name: user.name }); 
  } catch (err) {
    console.error('login error', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/cashier-login', async (req, res) => {
  const { login, password } = req.body;

  try {
    const result = await client.query('SELECT * FROM users WHERE login = $1;', [login]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid login or password' });
    }

    const user = result.rows[0];
    if (user.type !== 'cashier') {
      return res.status(400).json({ error: 'Invalid..log in on the right page' });
    }

    const isMatch = password === user.password;

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid login or password' });
    }

    const message = 'Cashier login successful';
    res.json({ message, name: user.name }); 
  } catch (err) {
    console.error('login error', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/manager-login', async (req, res) => {
  const { login, password } = req.body;

  try {
    const result = await client.query('SELECT * FROM users WHERE login = $1;', [login]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid login or password' });
    }

    const user = result.rows[0];
    if (user.type !== 'manager') {
      return res.status(400).json({ error: 'Invalid..log in on the right page' });
    }

    const isMatch = password === user.password;

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid login or password' });
    }

    const message = 'Manager login successful';
    res.json({ message, name: user.name }); 
  } catch (err) {
    console.error('login error', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/manager-view', async (req, res) => {
  
});



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


process.on('exit', () => {
  client.end();
});
