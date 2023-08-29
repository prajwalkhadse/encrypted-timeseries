// In your backend (src/listener.js)

const crypto = require('crypto');
const express = require('express'); // Import Express
const http = require('http'); // Import HTTP module
const socketIo = require('socket.io');
const mongoose = require('mongoose');
// const { createHash } = require('./emitter'); // Replace with the correct path to emitter.js

const cors = require('cors');

const app = express(); // Create an Express app
const server = http.createServer(app); // Create an HTTP server using Express

app.use(cors()); // Enable CORS for all routes (you can also configure it for specific routes)

// 
// function createHash(data) {
//   const hash = crypto.createHash('sha256');
//   hash.update(JSON.stringify(data));
//   return hash.digest('hex');
// }
// Use server for socket.io
const io = socketIo(server);

const messageSchema = new mongoose.Schema({
  name: String,
  origin: String,
  destination: String,
  secret_key: String,
  timestamp: Date, // Add a timestamp field
});

const Message = mongoose.model('Message', messageSchema);

io.on('connection', (socket) => {
  console.log("connected to user");
  const iv = crypto.randomBytes(16);
  socket.on('message', async (message) => {
    console.log('Received a message:', message);
    try {
      const { iv, encryptedMessage, secret_key } = message;
  
      // Convert the IV from hex to a Buffer
      const ivBuffer = Buffer.from(iv, 'hex');
  
      // Decrypt the message using the IV from the message
      const decipher = crypto.createDecipheriv('aes-256-ctr', Buffer.from(secret_key, 'hex'), ivBuffer);
      let decryptedMessage = decipher.update(encryptedMessage, 'hex', 'utf8');
      decryptedMessage += decipher.final('utf8');
  
      // Verify the secret_key
      // if (secret_key !== createHash(JSON.parse(decryptedMessage))) {
      //   console.error('Data integrity compromised. Message discarded.');
      //   return;
      // }
  
      // Add a timestamp
      const timestamp = new Date();
      const messageWithTimestamp = {
        ...JSON.parse(decryptedMessage),
        timestamp,
      };
  
      // Save the message to MongoDB
      const messageModel = new Message(messageWithTimestamp);
      await messageModel.save();
  
      console.log('Message saved:', messageWithTimestamp);
    } catch (error) {
      // Handle decryption and database errors
      console.error('Error processing message:', error);
    }
  });
  
  
});


mongoose.connect('mongodb+srv://prajwalkhadse75:rZ3sVzL6ohPLEPt6@cluster0.q3t0jzb.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// password:----  rZ3sVzL6ohPLEPt6
// 'mongodb://127.0.0.1:27017/socketappdb'

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});


// Define a route to handle GET requests to '/messages'
app.get('/messages', async (req, res) => {
  try {
    // Fetch messages from your MongoDB database
    const messages = await Message.find(); // Adjust this query as needed

    // Return the messages as JSON
    res.json(messages);
  } catch (error) {
    // Handle errors appropriately
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ... (your existing code)

// In your listener service (src/listener.js)

// ... (previous code)

io.on('connection', (socket) => {
  console.log('A user connected'); // Debug log

  socket.on('message', async (encryptedMessage) => {
    console.log('Received a message:', encryptedMessage);
    try {
      console.log('Received message:', encryptedMessage); // Debug log

      // Decrypt the message here using aes-256-ctr (replace 'YOUR_PASSKEY' with your actual passkey)
      const decipher = crypto.createDecipheriv('aes-256-ctr', 'YOUR_PASSKEY', Buffer.from('YOUR_IV', 'hex'));
      let decryptedMessage = decipher.update(encryptedMessage, 'hex', 'utf8');
      decryptedMessage += decipher.final('utf8');

      // Verify the secret_key (replace 'YOUR_PASSKEY' with your actual passkey)
      const secretKey = createHash(JSON.parse(decryptedMessage));
      if (secretKey !== JSON.parse(decryptedMessage).secret_key) {
        console.error('Data integrity compromised. Message discarded.');
        return;
      }

      // Add a timestamp
      const timestamp = new Date();
      const messageWithTimestamp = {
        ...JSON.parse(decryptedMessage),
        timestamp,
      };

      // Save the message to MongoDB
      const messageModel = new Message(messageWithTimestamp);
      await messageModel.save();

      console.log('Message saved:', messageWithTimestamp); // Debug log
    } catch (error) {
      // Handle decryption and database errors
      console.error('Error processing message:', error);
    }
  });
});

// ... (rest of your code)


// ... (the rest of your code)


server.listen(3001, () => {
  console.log('Server is running on port 3001');
});
