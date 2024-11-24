const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cookieparser = require('cookie-parser');
const bodyParser = require('body-parser');
const { connectDB } = require('./db/dbConnection');
const cors = require('cors');
const auth = require('./middleware/auth.js');
const userRouter = require('./src/routes/user.js');
dotenv.config();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3001",
  "http://localhost:3000",
  "*"
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log('Requested Origin:', origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Enable CORS
app.use(cors(corsOptions));

// CORS preflight
app.options('*', cors(corsOptions));

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
