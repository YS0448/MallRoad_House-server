const express = require('express');
const app = express();
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler')
const routes = require('./routes/index');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const path = require('path');

require('dotenv').config();

app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL,  
    methods: ['GET','POST', 'PUT', 'DELETE', 'PATCH' ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// File upload middleware
app.use(fileUpload());

app.use(session({
  secret: process.env.SESSION_SECRET_KEY, // keep this secret and strong
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 5 * 60 * 1000 } // 5 minutes
}));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(routes)
app.get('/', (req,res) =>{        
    res.send('Welcome to Mallroad House Backend');
})

app.use(errorHandler)


const PORT = process.env.PORT || 7000;
app.listen(PORT, () =>{
    console.log('Server is running on port ' , PORT);
})