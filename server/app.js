const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Setup MySQL database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root_prasad',
    password: 'prasad@123',
    database: 'xenonstack',
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to MySQL');
});

// Setup session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Middleware to check if the user is logged in
const checkLoggedIn = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    } else {
        res.redirect('/login.html');
    }
};

// Login Route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check the credentials in the database
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) {
            throw err;
        }

        if (results.length > 0) {
            const user = results[0];

            // Compare the hashed password
            bcrypt.compare(password, user.password, (err, passwordMatch) => {
                if (err) {
                    throw err;
                }

                if (passwordMatch) {
                    // Store user information in the session
                    req.session.user = {
                        id: user.id,
                        username: user.username,
                        email: user.email
                    };

                    res.json({ success: true, message: 'Login successful' });
                } else {
                    res.json({ success: false, message: 'Invalid credentials' });
                }
            });
        } else {
            res.json({ success: false, message: 'Invalid credentials' });
        }
    });
});

// Register Route
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    // Hash the password before storing it
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            throw err;
        }

        // Insert user data into the database
        const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.query(sql, [username, email, hashedPassword], (err, result) => {
            if (err) {
                throw err;
            }

            res.json({ success: true, message: 'Registration successful' });
        });
    });
});

// Contact Form Submission Route
app.post('/contact', checkLoggedIn, (req, res) => {
    const { name, email, message } = req.body;

    const sql = 'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)';
    db.query(sql, [name, email, message], (err, result) => {
        if (err) {
            throw err;
        }
        console.log('Contact form data inserted');
        res.json({ success: true, message: 'Form submitted successfully' });
    });
});

// Logout Route
app.get('/logout', (req, res) => {
    if (req.session && req.session.user) {
        req.session.destroy((err) => {
            if (err) {
                throw err;
            }
            res.json({ success: true, message: 'Logout successful' });
        });
    } else {
        res.json({ success: false, message: 'No active session' });
    }
});

// Homepage Route (requires login)
app.get('/home', checkLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/dashboard', checkLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});