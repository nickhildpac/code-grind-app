import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';

dotenv.config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hellow elsomce 😂");
})

app.use("api/v1/auth", authRoutes);

app.listen(process.env.PORT || 8080, () => {
  console.log('Server is running on port', process.env.PORT || 8080);
})
