var { buildSchema } = require('graphql');
var CryptoJS = require("crypto-js");
var express = require('express');
var graphqlHTTP = require('express-graphql');
var path = require('path')

var schema = buildSchema(`
  type Query {
    encrypt(text: String!): String
    decrypt(text: String!): String
  }
`);

var root = {
  encrypt: ({ text }) => {
    return CryptoJS.AES.encrypt(text, "Secret Passphrase");
  },
  decrypt: ({ text }) => {
    return CryptoJS.AES.decrypt(text, "Secret Passphrase").toString(CryptoJS.enc.Utf8);

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
