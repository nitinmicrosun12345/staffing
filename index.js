const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cookieparser = require('cookie-parser');
const bodyParser = require('body-parser');
const { connectDB } = require('./db/dbConnection');
dotenv.config();

app.use(express.json());
app.use(cookieparser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Staffing Backend is up. 😊');
});

app.use('/api/v1', require('./src/routes/index.js'));

connectDB();

const port = process.env.PORT;
const host = process.env.HOST;

app.listen(port, () => {
  console.log(
    `App listening on port ${host} on ${process.env.ENVIRONMENT}`
  );
});
