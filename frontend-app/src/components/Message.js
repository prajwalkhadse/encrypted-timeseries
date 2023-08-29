// src/components/Message.js
import React from 'react';

function Message({ message }) {
  return (
    <div className="message">
      <p>Name: {message.name}</p>
      <p>Origin: {message.origin}</p>
      <p>Destination: {message.destination}</p>
      <p>Secret Key: {message.secret_key}</p>
      <p>Timestamp: {message.timestamp}</p>
    </div>
  );
}

export default Message;
