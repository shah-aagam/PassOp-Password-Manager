import express from "express"
import cors from "cors"
import 'dotenv/config';
import helmet from "helmet"
import { connectDB } from "./config/db.js";
import rateLimit from "express-rate-limit";

import userRoutes from "./routes/userRoutes.js"
import passwordRoutes from "./routes/passwordRoutes.js"
import auditRoutes from "./routes/auditRoutes.js"

const app = express();
const PORT = process.env.PORT || 5000 ;

app.use(cors({
    origin: process.env.FRONTEND_URL , 
    credentials: true
}));
app.use(helmet());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // limit each IP to 100 requests per window
  standardHeaders: true,      
  legacyHeaders: false,
  message: "Too many requests, please try again later.",
});

app.use(limiter);

connectDB();


app.get('/' , (req , res) => {
    res.send( "<h1>HI</h1>" );
});

app.use('/api/user' , userRoutes);

app.use('/api/password' , passwordRoutes);

app.use('/api/audit' , auditRoutes);


app.listen(PORT , () => {
    console.log(`Server running on http://localhost:${PORT}`);
});