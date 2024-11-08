import express, { Express, Request, response, Response } from "express";
import crypto from "crypto";
import { Pool } from "pg";
import dotenv from "dotenv";
import cors from 'cors';
import { isAuthenticated } from "./utils";
import { AuthenticatedRequest, getEnvVariable } from "./utils";
import https from "https";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";

// add .env configuration
dotenv.config();

//const KnexSessionStore = require("connect-session-knex")(session);

const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, '/../certs/live/oceans-end.com/privkey.pem')),
  cert: fs.readFileSync(path.join(__dirname, '/../certs/live/oceans-end.com/fullchain.pem'))
};

const corsOptions = {
  origin: ["https://oceans-end.com", "https://localhost:5432", "https://oceans-end.com:3001/"],
  optionsSuccessStatus: 200,
  credentials: true,
}

const config = {
  JWT_SECRET: getEnvVariable("JWT_SECRET")
}

const endpoints = {
  getList: getEnvVariable("API_GET_LIST_ENDPOINT"),
  addPass: getEnvVariable("API_ADD_PASS_ENDPOINT"),
  updatePass: getEnvVariable("API_UPDATE_PASS_ENDPOINT"),
  deletePass: getEnvVariable("API_DELETE_PASS_ENDPOINT"),
  loginChallenge: getEnvVariable("API_LOGIN_CHALLENGE_ENDPOINT"),
  verifyChallenge: getEnvVariable("API_LOGIN_VERIFY_ENDPOINT"),
  register: getEnvVariable("API_REGISTER_ENDPOINT"),
  logout: getEnvVariable("API_LOGOUT_ENDPOINT"),
}

const app: Express = express();
const port = getEnvVariable("PORT"); // You can choose any port

console.log(endpoints);
app.use(cors(corsOptions));
app.use(express.json());
app.options('*', cors());
app.set('trust proxy', 1)

const pool = new Pool({
  user: getEnvVariable("POSTGRES_USER"),
  host: getEnvVariable("PGHOST"),
  database: getEnvVariable("POSTGRES_DB"),
  password: getEnvVariable("POSTGRES_PASSWORD"),
  port: parseInt(getEnvVariable("POSTGRES_PORT")),
})

const session = require("express-session");
const pgSession = require('connect-pg-simple')(session);

app.use(
  session({
    store: new pgSession({
      pool: pool,                // Connection pool
      tableName: 'sessions',     // Use another table-name than the default "session" one
      // You can also define other options such as expiration time and session id column
    }),
    secret: getEnvVariable("JWT_SECRET"), // Use a secure, random secret in production
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: getEnvVariable("NODE_ENV") === "deployment", // Set secure cookies in production for HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: "none",
    },
  })
);

app.get(`/${endpoints.getList}`, isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    console.log(userId);
    const passQuery = "SELECT * FROM user_passwords WHERE user_id = $1 ORDER BY id ASC"
    const result = await pool.query(passQuery, [userId]);
    const passwords = result.rows;
    res.json(passwords);
  } catch (err) {
    res.status(500).json({ error: "Unable to fetch passwords. Please try again later" });
    //throw err;
  }
});

app.post(`/${endpoints.addPass}`, isAuthenticated, async (req: Request, res: Response) => {
  try {
    const {
      username,
      email,
      password,
      url,
      label,
      salt,
      iv
    } = req.body;
    const userId = req.session.userId;
    console.log(userId);

    const insertPassword = "INSERT INTO user_passwords (user_id, username, email, url, label, encrypted_pass, salt, iv) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;";
    const newPassQueryObj = await pool.query(insertPassword, [userId, username, email, url, label, password, salt, iv]);
    const passwordList = await newPassQueryObj.rows[0];

    res.json(passwordList);
  } catch (err) {
    console.log(`Unable to add password: ${err}`);
    res.status(500).json({ error: "Unable to add password. Please try again later" })
  }
})

app.post(`/${endpoints.updatePass}`, isAuthenticated, async (req: Request, res: Response) => {
  const {
    username,
    email,
    password,
    url,
    label,
    salt,
    iv,
    id
  } = req.body;
  console.log(req.body);

  const userId = req.session.userId;

  const updateQuery = `UPDATE user_passwords 
    SET username = $1, email = $2, encrypted_pass = $3, 
      url = $4, label = $5, salt = $6, iv = $7, last_modified = CURRENT_TIMESTAMP
    WHERE id = $8 AND user_id = $9 RETURNING *;`

  pool.query(updateQuery, [username, email, password, url, label, salt, iv, id, userId]).then(updatedPasswords => {
    return res.json(updatedPasswords.rows[0]);
  }).catch(err => {
    console.log(`${err}: Unable to update password`);
    return res.status(500).json({ error: err.message })
  })
});

app.post(`/${endpoints.deletePass}`, isAuthenticated, async (req: Request, res: Response) => {
  const passId = req.body.id;
  const userId = req.session.userId;

  const deleteQuery = `DELETE FROM user_passwords WHERE id = $1 AND user_id = $2 RETURNING *;`

  pool.query(deleteQuery, [passId, userId]).then(deletedPasswords => {
    if (deletedPasswords) {
      console.log('Deleted row:', deletedPasswords.rows[0]);
      return res.json(deletedPasswords.rows[0]);
    } else {
      console.log('No password with that id');
      return res.status(400).json({ error: "No id associated with that user" })
    }
  })
});

app.post(`/${endpoints.loginChallenge}`, async (req: Request, res: Response) => {
  const { username } = req.body;

  const userQuery = "SELECT * FROM users WHERE username = $1;"
  const users = await pool.query(userQuery, [username])
  console.log(users)
  if (users.rowCount == 0) {
    res.status(404).json({ success: false, error: "Incorrect username or password." });
  }

  // generate and store challenge temporarily
  const challenge = crypto.randomBytes(32).toString("base64");
  const challengeQuery = "UPDATE users SET challenge = $1 WHERE id=$2;"
  await pool.query(challengeQuery, [challenge, users.rows[0].id]);

  const salt = users.rows[0].salt; // assumes unique usernames

  res.json({ success: true, challenge, salt });
})

app.post(`/${endpoints.verifyChallenge}`, async (req: Request, res: Response) => {
  const { username, response } = req.body;

  const userQuery = "SELECT * FROM users WHERE username = $1;"
  const users = await pool.query(userQuery, [username])
  if (!users) {
    res.status(401).json({ error: "Incorrect username or password." });
  }

  const user = users.rows[0] // assumes unique user
  const storedHash = user.key_hash;
  const salt = user.salt;
  const challenge = user.challenge;
  console.log(username, challenge, storedHash, salt)

  const hmac = crypto.createHmac('sha256', Buffer.from(storedHash, "base64"));
  //console.log("hmac storedHash:", hmac.digest("base64"));
  const expectedResponse = hmac.update(challenge).digest('base64');
  console.log(expectedResponse, response)

  if (expectedResponse === response) {
    //const token = jwt.sign({ userId: user.id }, config.JWT_SECRET, { expiresIn: '14d' });
    console.log("signing for:", user.id)
    req.session.userId = user.username;
    // res.setHeader('Access-Control-Allow-Credentials', "true");
    // res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    // res.setHeader('Access-Control-Allow-Origin', 'https://oceans-end.com');

    res.json({
      success: true,
      //token: token,
      user: user.username,
      salt: salt,
    })
  } else {
    res.status(401).json({
      success: false,
      error: "Incorrect username or password"
    });
  }
})

app.post(`/${endpoints.register}`, async (req: Request, res: Response) => {
  const { username, hashedKey, salt } = req.body;
  console.log(username, hashedKey, salt);

  try {
    const usernameQuery = "SELECT * FROM users WHERE username = $1;"
    const usernameResult = await pool.query(usernameQuery, [username]);

    if (usernameResult.rows.length != 0) {
      res.status(400).json({
        error: "Username already taken"
      });
    }

    const insertQuery = "INSERT INTO users (username, key_hash, salt) VALUES ($1, $2, $3);"
    await pool.query(insertQuery, [username, hashedKey, salt]);

    res.json({
      success: true,
    });
  } catch (err) {
    res.status(400).json({
      error: "Unable to register, please try again later",
    })
  }
});

// app.use((error: any, req: Request, res: Response, next: NextFunction) => {
//   console.error("Error:", error);
//   res.status(500).json({ message: "An error occurred", error: error.message });
// });

// app.listen(port, () => {
//   console.log(`Server is running on port number ${port}`);
//   console.log({
//     user: process.env.POSTGRES_USER,
//     host: process.env.PGHOST,
//     database: process.env.POSTGRES_DB,
//     password: process.env.POSTGRES_PASSWORD,
//     port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT): undefined,
//   })
// });

https.createServer(sslOptions, app).listen(3001, () => {
  console.log("Server running on https://oceans-end.com");
});