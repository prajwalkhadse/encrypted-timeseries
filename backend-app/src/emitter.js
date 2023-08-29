const crypto = require('crypto');
const io = require('socket.io-client');
const socket = io('http://localhost:3001'); // Change the URL as needed
const data = require('../data.json'); // Load data from data.json

// Function to create a sha-256 hash
function createHash(data) {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(data));
  return hash.digest('hex');
}

// Function to generate random data from your JSON
function generateRandomData() {
  const randomName = data.names[Math.floor(Math.random() * data.names.length)];
  const randomOrigin = data.cities[Math.floor(Math.random() * data.cities.length)];
  const randomDestination = data.cities[Math.floor(Math.random() * data.cities.length)];

  return {
    name: randomName,
    origin: randomOrigin,
    destination: randomDestination,
  };
}

// Function to generate and emit messages
function emitMessages() {
  console.log("inside emitter");
  setInterval(() => {
    const originalMessage = generateRandomData();
    const secretKeyHex = createHash(originalMessage);

    // Convert the secretKeyHex to a Buffer
    const secretKey = Buffer.from(secretKeyHex, 'hex');

    // Generate a random IV
    const iv = crypto.randomBytes(16);

    // Encrypt the message with IV
    const cipher = crypto.createCipheriv('aes-256-ctr', secretKey, iv);
    let encryptedMessage = cipher.update(JSON.stringify(originalMessage), 'utf8', 'hex');
    encryptedMessage += cipher.final('hex');

    const message = {
      iv: iv.toString('hex'),
      encryptedMessage,
      secret_key: secretKeyHex, // Include the hash of the secret key
    };

    socket.emit('message', message);
  }, 10000); // Emit every 2 seconds
}
emitMessages();
