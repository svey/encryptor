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

  encrypt(text) {
    const url = 'http://localhost:4000/graphql'
    const query = `query Encrypt($text: String!) {
      encrypt(text: $text)
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
      const { encrypt } = data;
      this.setState({ ...this.state, encrypt, active: 'encrypt' })
    })
    .catch(err => console.log(err))
  }

  decrypt(text) {
    const url = 'http://localhost:4000/graphql'
    const query = `query Decrypt($text: String!) {
      decrypt(text: $text)
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
      const { decrypt } = data;
      console.log(data);
      this.setState({ ...this.state, message: decrypt, active: false })
    })
    .catch(err => console.log(err))
  }

  handleChange(prop, value) {
    this.setState({ ...this.state, [prop]: value });
  };

  render() {
    return (
      <Card style={{ width: '350px', padding: '10px' }}>
        <CardTitle
          title='Encrypt'
        />
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around'}}>
          <Avatar
            title={this.state.name}
          />
          <Input
            type='text'
            label='Name *'
            value={this.state.name}
            onChange={this.handleChange.bind(this, 'name')}
            maxLength={16}
          />
          </div>
          <Input
            type='text'
            label='Message *'
            value={this.state.message}
            onChange={this.handleChange.bind(this, 'message')}
            maxLength={120}
          />
          <DatePicker
            label='Expiration date'
            minDate={date}
            onChange={this.handleChange.bind(this, 'date')}
            sundayFirstDayOfWeek
            value={this.state.date}
          />
        </section>
        <CardActions>
          <Button label='Encrypt' onClick={this.encrypt.bind(this, this.state.message)} />
          <Button label='Decrypt' onClick={this.handleChange.bind(this, 'active', 'decrypt')} />
          <Dialog
            actions={[{ label: "Close", onClick: this.handleChange.bind(this, 'active', false) }]}
            active={this.state.active === 'encrypt'}
            onEscKeyDown={this.handleChange.bind(this, 'active', false)}
            onOverlayClick={this.handleChange.bind(this, 'active', false)}
            title='De/Encrypt'
            type='large'
          >
            <p>{this.state.encrypt}</p>
          </Dialog>
          <Dialog
            actions={[{ label: "Decrypt", onClick: this.decrypt.bind(this, this.state.decrypt) }, { label: "Close", onClick: this.handleChange.bind(this, 'active', false) }]}
            active={this.state.active === 'decrypt'}
            onEscKeyDown={this.handleChange.bind(this, 'active', false)}
            onOverlayClick={this.handleChange.bind(this, 'active', false)}
            title='De/Encrypt'
            type='large'
          >
            <Input
              type='text'
              label='Encryption String *'
              value={this.state.decrypt}
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