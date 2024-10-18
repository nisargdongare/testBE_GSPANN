import express, { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const app = express();
app.use(express.json());

const SECRET_KEY = 'secret key'; 
interface User {
    username: string;
    password: string;
}

let users: User[] = []; // Define users array with User type

function generateToken(user: User): string {
    return jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
}

app.get('/', (req: Request, res: Response): void => {
    res.send('Hello World!');
});

app.post('/register', (req: Request, res: Response): void => {
    const { username, password } = req.body as User; // Type assertion

    if (users.some(user => user.username === username)) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    const newUser: User = { username, password };
    users.push(newUser);

    const token = generateToken(newUser);
    res.status(201).json({ message: 'User registered successfully', token });
});

app.post('/login', (req: Request, res: Response): void => {
    const { username, password } = req.body as User; // Type assertion
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        res.status(400).json({ message: 'Invalid username or password' });
        return;
    }

    const token = generateToken(user);
    res.status(200).json({ message: 'Login successful', token });
});

app.get('/verify', (req: Request, res: Response): void => {
    const token = req.headers['authorization'];

    if (!token) {
        res.status(403).json({ message: 'No token provided' });
        return;
    }

    // Verify the token
    jwt.verify(token, SECRET_KEY, (err: any, decoded: any) => {
        if (err) {
            res.status(500).json({ message: 'Failed to authenticate token' });
            return;
        }

        res.status(200).json({ message: 'Access granted', username: decoded?.username });
    });
});

// Start the server
app.listen(4000, () => {
    console.log('Server is running on port 4000');
});
