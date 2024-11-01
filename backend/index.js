require('dotenv').config()


const express = require('express');
const cors = require('cors')
const mongoose = require('mongoose')
const authRoute = require('./routes/authRoute');
const productRoute = require('./routes/productRoute'); 

// initialize a new express application instance
const app = express();

// middlewares
app.use(express.json())
app.use(cors())


// routes
app.use("/api/auth/", authRoute);
app.use('/api/products/', productRoute);


// connect to DataBase (MONGODB)
const PORT = process.env.PORT // http://localhost:4000/api/auth/  -> POST
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
.then(() => app.listen(PORT, () => console.log(`Connected to DB, and running on http://localhost:${PORT}/`)))
.catch((error) => console.log(`Error:`, error.message))
