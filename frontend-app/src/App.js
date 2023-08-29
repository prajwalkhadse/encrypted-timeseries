import React, { useEffect, useState } from 'react';
import './App.css';
import io from 'socket.io-client';

const socket = io('http://localhost:3001', {
  transports: ['websocket'], // Use websocket transport
  cors: {
    origin: 'http://localhost:3000', // Replace with the origin of your frontend
    methods: ['GET', 'POST'],
  },
});

function App() {
  const [messages, setMessages] = useState([]);
  const [successRate, setSuccessRate] = useState(0);

  useEffect(() => {
    // Function to calculate success rate
    const calculateSuccessRate = (data) => {
      const successfulMessages = data.filter((message) => message.success === true);

      const rate = (successfulMessages.length / data.length) * 100;
      setSuccessRate(rate.toFixed(2)); // Set success rate with 2 decimal places
    };

    // Add your WebSocket event listeners here
    socket.on('message', (data) => {
      // Handle incoming messages from the server
      console.log('Received message:', data);

      // Update success rate
      calculateSuccessRate([...messages, data]);
    });

    fetch('http://localhost:3001/messages') // Replace with your backend URL
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Fetched data:', data);
        setMessages(data);
        // Calculate success rate based on fetched data
        calculateSuccessRate(data);
      })
      .catch((error) => {
        console.error('Fetch error:', error);
      });

    // Clean up the event listener when the component unmounts
    return () => {
      socket.off('message');
    };
  }, [messages]);

  return (
    <div className="App">
      <h1 className="title">Message List</h1>
      {/* <div className="success-rate">Success Rate: {successRate}%</div> */}
      <ul className="message-list">
        {messages.map((message, index) => (
          <li key={index} className="message-item">
            <span className="message-field">Name: {message.name}</span>
            <span className="message-field">Origin: {message.origin}</span>
            <span className="message-field">Destination: {message.destination}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
