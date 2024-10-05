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
    const insertPassword = "INSERT INTO user_passwords (username, email, url, encrypted_password, salt, iv) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";
    const newPassQueryObj = await pool.query(insertPassword, [username, email, url, password, salt, iv]);
    const passwordList = await newPassQueryObj.rows[0];

    return res.json(passwordList); 
  } catch (err) {
    throw err;
  }
})
 
app.get("/updatePassword", async (req: Request, res: Response) => {
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
    SET (username = $1, email = $2, encrypted_password = $3, url = $4, salt = $5, iv = $6) 
    WHERE id = $7 RETURNING *`

  pool.query(updateQuery, [username, email, password, url, salt, iv, id]).then(updatedPasswords => {
    return res.json(updatedPasswords);
  }).catch(err => {
    throw err;
  })
});

app.get("/deletePassword", async (req: Request, res: Response) => {
  return "TODO";
});

app.listen(port, () => {
  console.log(`Server is running on port number ${port}`);
});