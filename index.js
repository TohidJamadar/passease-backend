import express from "express";
import dotenv from "dotenv";
import UserRouter from "./routes/user.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

app.get('/', (req, res) => {
    res.send("hello world");
});

app.use('/api/user',UserRouter)

app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
});
