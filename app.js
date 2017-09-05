import React from 'react';
import ReactDOM from 'react-dom';
import Avatar from 'react-toolbox/lib/avatar';
import {Button} from 'react-toolbox/lib/button';
import { Card, CardMedia, CardTitle, CardText, CardActions } from 'react-toolbox/lib/card';
import DatePicker from 'react-toolbox/lib/date_picker';
import Dialog from 'react-toolbox/lib/dialog';
import Input from 'react-toolbox/lib/input';

var date = new Date();

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date,
      name: null,
      message: null,
      encrypt: null,
      decrypt: null
    };
  }

  encrypt(text, date, name) {
    var url = 'http://localhost:4000/graphql'
    var query = `query Encrypt($text: String!, $date: String!, $name: String!) {
      encrypt(text: $text, date: $date, name: $name)
    }`

    date = date.toISOString()

    return fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { text, date, name }
      })
    })
    .then(res => res.json())
    .then(({ data }) => {
      var { encrypt } = data;
      this.setState({ ...this.state, encrypt, active: 'encrypt' })
    })
    .catch(err => console.log(err))
  }

  decrypt(text) {
    var url = 'http://localhost:4000/graphql'
    var query = `query Decrypt($text: String!) {
      decrypt(text: $text) {
        name,
        message
      }
    }`

    return fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { text }
      })
    })
    .then(res => res.json())
    .then(({ data }) => {
      var { message, name } = data.decrypt;
      this.setState({ ...this.state, message, name, active: false })
    })
    .catch(err => console.log(err))
  }

  handleChange(prop, value) {
    this.setState({ ...this.state, [prop]: value });
  };

  render() {
    var { active, name, message, encrypt, decrypt } = this.state;
    return (
      <Card style={{ width: '350px', padding: '10px' }}>
        <CardTitle
          title='Encrypt'
        />
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around'}}>
          <Avatar
            title={name}
          />
          <Input
            type='text'
            label='Name *'
            value={name}
            onChange={this.handleChange.bind(this, 'name')}
            maxLength={16}
          />
          </div>
          <Input
            type='text'
            label='Message *'
            value={message}
            onChange={this.handleChange.bind(this, 'message')}
            maxLength={120}
          />
          <DatePicker
            label='Expiration date'
            minDate={date}
            onChange={this.handleChange.bind(this, 'date')}
            sundayFirstDayOfWeek
            value={date}
          />
        </section>
        <CardActions>
          <Button label='Encrypt' onClick={this.encrypt.bind(this, message, date, name)} />
          <Button label='Decrypt' onClick={this.handleChange.bind(this, 'active', 'decrypt')} />
          <Dialog
            actions={[{ label: "Close", onClick: this.handleChange.bind(this, 'active', false) }]}
            active={active === 'encrypt'}
            onEscKeyDown={this.handleChange.bind(this, 'active', false)}
            onOverlayClick={this.handleChange.bind(this, 'active', false)}
            title='De/Encrypt'
            type='large'
          >
            <p>{encrypt}</p>
          </Dialog>
          <Dialog
            actions={[{ label: "Decrypt", onClick: this.decrypt.bind(this, decrypt) }, { label: "Close", onClick: this.handleChange.bind(this, 'active', false) }]}
            active={active === 'decrypt'}
            onEscKeyDown={this.handleChange.bind(this, 'active', false)}
            onOverlayClick={this.handleChange.bind(this, 'active', false)}
            title='De/Encrypt'
            type='large'
          >
            <Input
              type='text'
              label='Encryption String *'
              value={decrypt}
              onChange={this.handleChange.bind(this, 'decrypt')}
            />
          </Dialog>
        </CardActions>
      </Card>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
