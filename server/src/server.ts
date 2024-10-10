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
    salt,
    iv
  } = req.body;
  console.log(req.body);
  try {
    const insertPassword = "INSERT INTO user_passwords (username, email, url, encrypted_password, salt, iv) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;";
    const newPassQueryObj = await pool.query(insertPassword, [username, email, url, password, salt, iv]);
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
    salt,
    iv,
    id
  } = req.body;
  console.log(req.body);

  const updateQuery = `UPDATE user_passwords 
    SET username = $1, email = $2, encrypted_password = $3, url = $4, salt = $5, iv = $6
    WHERE id = $7 RETURNING *;`

  pool.query(updateQuery, [username, email, password, url, salt, iv, id]).then(updatedPasswords => {
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
    return res.status(404).json({ error: "User not found."});
  }

  const challenge = crypto.randomBytes(32).toString("base64");
  
  const salt = users.rows[0].salt; // assumes unique usernames

  res.json({ challenge, salt });
})

app.post("/verify-challenge", async (req: Request, res: Response) => {
  const { username, response, challenge } = req.body;

  const userQuery = "SELECT * FROM users WHERE username = $1;"
  const users = await pool.query(userQuery, [username])
  if (!users) {
    return res.status(404).json({ error: "User not found."});
  }
  
  const user = users.rows[0] // assumes unique user

  const storedHash = user.hashkey;
  const salt = user.salt;
  console.log(username, challenge, storedHash, salt)
  //const challenge = req.body.challenge; // original challenge sent to client

  //const keyMaterial = crypto.pbkdf2Sync(storedHash, salt, 100000, 32, 'sha256');
  //console.log(crypto.createHmac("sha256", storedHash).digest("base64"));
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
      error: "Invalid Login"
    });
  }
}) 

app.post("/register", async (req: Request, res:Response) => {
  const { username, hashedKey, salt } = req.body;
  console.log(username, hashedKey, salt);

  try {
    const insertQuery = "INSERT INTO users (username, hashkey, salt) VALUES ($1, $2, $3);"
    await pool.query(insertQuery, [username, hashedKey, salt]);

    res.json({
      success: true,
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      error: "Unable to register",
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