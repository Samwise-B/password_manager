import express, {Express, Request, response, Response} from "express";
import crypto from "crypto";
import { Pool } from "pg";
import dotenv from "dotenv";
import cors from 'cors';
import { verifyToken } from "./utils";

const corsOptions = {
  origin: ["http://localhost:8080", "http://localhost:5432"],
  optionsSuccessStatus:200
}
// add .env configuration
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000; // You can choose any port
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.use(cors(corsOptions));
app.use(express.json())

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT): undefined,
})

app.get('/getPasswords', verifyToken, async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM user_passwords ORDER BY id ASC");
    const passwords = result.rows;
    return res.json(passwords);
  } catch (err) {
    throw err;
  }
});

app.post('/addPassword', verifyToken, async (req: Request, res: Response) => {
  const {
    username,
    email,
    password,
    url,
    label,
    salt,
    iv
  } = req.body;
  console.log(req.body);
  try {
    const insertPassword = "INSERT INTO user_passwords (username, email, url, label, encrypted_password, salt, iv) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;";
    const newPassQueryObj = await pool.query(insertPassword, [username, email, url, label, password, salt, iv]);
    const passwordList = await newPassQueryObj.rows[0];

    return res.json(passwordList); 
  } catch (err) {
    throw err; 
  }
})
 
app.post("/updatePassword", verifyToken, async (req: Request, res: Response) => {
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

  const updateQuery = `UPDATE user_passwords 
    SET username = $1, email = $2, encrypted_password = $3, url = $4, label = $5, salt = $6, iv = $7
    WHERE id = $8 RETURNING *;`

  pool.query(updateQuery, [username, email, password, url, label, salt, iv, id]).then(updatedPasswords => {
    return res.json(updatedPasswords.rows[0]);
  }).catch(err => {
    throw err;
  })
});

app.post("/deletePassword", verifyToken, async (req: Request, res: Response) => {
  const { id } = req.body;

  const deleteQuery = `DELETE FROM user_passwords WHERE id = $1 RETURNING *;`

  pool.query(deleteQuery, [id]).then(deletedPasswords => {
    if (deletedPasswords) {
      console.log('Deleted row:', deletedPasswords.rows[0]);
      return res.json(deletedPasswords.rows[0]);
    } else {
      console.log('No row with that id');
    }
  })
});

app.post("/login-challenge", async (req: Request, res: Response) => {
  const { username } = req.body;

  const userQuery = "SELECT * FROM users WHERE username = $1;"
  const users = await pool.query(userQuery, [username])
  console.log(users)
  if (users.rowCount == 0) {
    return res.status(404).json({ success: false, error: "Incorrect username or password."});
  }

  // generate and store challenge temporarily
  const challenge = crypto.randomBytes(32).toString("base64");
  const challengeQuery = "UPDATE users SET challenge = $1 WHERE id=$2;"
  await pool.query(challengeQuery, [challenge, users.rows[0].id]);

  const salt = users.rows[0].salt; // assumes unique usernames

  res.json({ success: true, challenge, salt });
})

app.post("/verify-challenge", async (req: Request, res: Response) => {
  const { username, response } = req.body;

  const userQuery = "SELECT * FROM users WHERE username = $1;"
  const users = await pool.query(userQuery, [username])
  if (!users) {
    return res.status(401).json({ error: "Incorrect username or password."});
  }
  
  const user = users.rows[0] // assumes unique user
  const storedHash = user.hashkey;
  const salt = user.salt;
  const challenge = user.challenge;
  console.log(username, challenge, storedHash, salt)

  const hmac = crypto.createHmac('sha256', Buffer.from(storedHash, "base64"));
  //console.log("hmac storedHash:", hmac.digest("base64"));
  const expectedResponse = hmac.update(challenge).digest('base64');
  console.log(expectedResponse, response)

  if (expectedResponse === response) {
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '14d' });

    return res.json({
      success: true,
      token: token,
      user: user.username
    })
  } else {
    return res.status(401).json({ 
      success:false,
      error: "Incorrect username or password"
    });
  }
}) 

app.post("/register", async (req: Request, res:Response) => {
  const { username, hashedKey, salt } = req.body;
  console.log(username, hashedKey, salt);

  try {
    const usernameQuery = "SELECT * FROM users WHERE username = $1;"
    const usernameResult = await pool.query(usernameQuery, [username]);

    if (usernameResult.rows.length != 0) {
      return res.status(400).json({
        error: "Username already taken"
      });
    }

    const insertQuery = "INSERT INTO users (username, hashkey, salt) VALUES ($1, $2, $3);"
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

app.listen(port, () => {
  console.log(`Server is running on port number ${port}`);
  console.log({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT): undefined,
  })
});