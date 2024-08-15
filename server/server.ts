import express, {Express, Request, Response} from "express";
import dotenv from "dotenv";

// add .env configuration
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000; // You can choose any port

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from the Node.js backend!');
});

app.listen(port, () => {
  console.log(`Server is running on port number ${port}`);
});