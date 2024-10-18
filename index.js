const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const SECRET_KEY = 'secret key'; 
let users = []; 

function generateToken(user) {
    return jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
}

app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (users.some(user => user.username === username)) {
        return res.status(400).json({ message: 'User already exists' });
    }


    const newUser = { username, password };
    users.push(newUser);


    const token = generateToken(newUser);
    res.status(201).json({ message: 'User registered successfully', token });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(x => x.username === username && x.password === password);
    if (!user) {
        return res.status(400).json({ message: 'Invalid username or password' });
    }
    const token = generateToken(user);
    res.status(200).json({ message: 'Login successful', token });
});

app.get('/verify', (req, res) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    // Verify the token
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to authenticate token' });
        }

        res.status(200).json({ message: 'Access granted', username: decoded.username });
    });
});


// Start the server
app.listen(4000, () => {console.log('Server is running on port 4000');});
