const { buildSchema } = require('graphql');
const CryptoJS = require('crypto-js');
const express = require('express');
const graphqlHTTP = require('express-graphql');
const path = require('path');

const messageCache = {};

const schema = buildSchema(`
  type Message {
    name: String
    message: String
  }

  type Query {
    encrypt(text: String!, date: String!, name: String! ): String
    decrypt(text: String!): Message
  }
`);

class Message {
  constructor(name, message) {
    this.name = name;
    this.message = message;
  }
}

const root = {
  encrypt: ({ text, date, name }) => {
    const encryption = CryptoJS.AES.encrypt(text, 'secret');
    messageCache[encryption] = { date, name };
    return encryption;
  },
  decrypt: ({ text }) => {
    const { date, name } = messageCache[text];
    const expirationDate = date.slice(0, 10); //  slice at 10 to ignore time of day
    const currentDate = new Date().toISOString().slice(0, 10); // slice at 10 to ignore time of day
    const message = CryptoJS.AES.decrypt(text, 'secret').toString(CryptoJS.enc.Utf8);
    if (currentDate <= expirationDate) {
      return new Message(name, message);
    }

    return 'The message has either expired or the encryption was invalid.';
  },
};

const app = express();

app.use(express.static('static'));

app.use('/graphql', graphqlHTTP(() => ({
  schema,
  rootValue: root,
  graphiql: true,
})));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.listen(4000, () => {
  console.log('encryptor running @ localhost:4000')
});
