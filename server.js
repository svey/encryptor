var { buildSchema, GraphQLObjectType, GraphQLString } = require('graphql');
var CryptoJS = require("crypto-js");
var express = require('express');
var graphqlHTTP = require('express-graphql');
var path = require('path')

var messageCache = {};

// var MessageType = new GraphQLObjectType({
//   name: 'Message',
//   fields: {
//     name: { type: GraphQLString },
//     message: { type: GraphQLString }
//   }
// })

class Message {
  constructor(name, message) {
    this.name = name;
    this.message = message;
  }
}

var schema = buildSchema(`
  type Message {
    name: String
    message: String
  }

  type Query {
    encrypt(text: String!, date: String!, name: String! ): String
    decrypt(text: String!): Message
  }
`);

var root = {
  encrypt: ({ text, date, name }) => {
    var encryption = CryptoJS.AES.encrypt(text, 'secret');
    messageCache[encryption] = { date, name };
    return encryption;
  },
  decrypt: ({ text }) => {
    var { date, name } = messageCache[text];

    var expirationDate = date.slice(0, 10); //slice at 10 to ignore time of day
    var currentDate = new Date().toISOString().slice(0, 10); //slice at 10 to ignore time of day
    var message = CryptoJS.AES.decrypt(text, 'secret').toString(CryptoJS.enc.Utf8)
    console.log(name, message, date)
    if(currentDate <= expirationDate) {
      return new Message(name, message);
    }

    return 'The message has either expired or the encryption was invalid.'
  }
};

var app = express();

app.use(express.static('static')) 

app.use('/graphql', graphqlHTTP((req, res, graphqlParams) => ({
  schema: schema,
  rootValue: root,
  graphiql: true
})));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.listen(4000);
