import express, {Express, Request, response, Response} from "express";
import { Pool } from "pg";
import dotenv from "dotenv";
import cors from 'cors';

const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5432"],
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

console.log({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT): undefined,
})

app.get('/getPasswords', async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM user_passwords ORDER BY id ASC");
    const passwords = result.rows;
    return res.json(passwords);
  } catch (err) {
    throw err;
  }
});

app.post('/addPassword', async (req: Request, res: Response) => {
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
 
app.post("/updatePassword", async (req: Request, res: Response) => {
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

app.post("/deletePassword", async (req: Request, res: Response) => {
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

app.post("/login", async (req: Request, res: Response) => {
  const {username, password} = req.body;

  const userQuery = "SELECT * FROM users WHERE username = $1;"
  const results = await pool.query(userQuery, [username])
  if (!results || !await bcrypt.compare(password, results.rows[0].password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const user = results.rows[0];

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({ token, user: { username: user.username } });
})

app.listen(port, () => {
  console.log(`Server is running on port number ${port}`);
});