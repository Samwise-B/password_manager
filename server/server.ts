import express, {Express, Request, response, Response} from "express";
import { Pool } from "pg";
import dotenv from "dotenv";

// add .env configuration
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000; // You can choose any port

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
})

app.get('/getPasswords', async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM passwords ORDER BY id ASC");
    const passwords = result.rows;
    return res.json(passwords);
  } catch (err) {
    throw err;
  }
});

app.get('/addPassword', async (req: Request, res: Response) => {
  const {
    username,
    email,
    password,
    url,
  } = req.body;

  try {
    const insertPassword = "INSERT INTO passwords (username, email, password, url) VALUES ($1, $2, $3, $4) RETURNING *";
    const passwordList = await pool.query(insertPassword, [username, email, password, url]);

    return res.json(passwordList);
  } catch (err) {
    throw err;
  }
})

app.get("/updatePassword", async (req: Request, res: Response) => {
  return "TODO";
});

app.get("/deletePassword", async (req: Request, res: Response) => {
  return "TODO";
});

app.listen(port, () => {
  console.log(`Server is running on port number ${port}`);
});