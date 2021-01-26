
import React, { Component } from 'react'
//import { Link } from 'react-router-dom'

class App extends Component {

  state = {address: '0x0000000000000000000', balance: 0}

  componentDidMount() {

    fetch(`${document.location.origin}/api/wallet-info`)
      .then(res => res.json())
      .then(json => {
        this.setState({address: json.address, balance: json.balance})
      })
      .catch(error => console.log(error))
      
  }

  render() {

    const { address, balance } = this.state
    console.log(address,balance)
    const logoURL               = 'https://res.cloudinary.com/matricksdecoder/image/upload/v1610988784/blockchain-3750157_1920_kxuz1o.jpg'

    return (
      <div className='App'>
        <img className='logo' src={logoURL}></img>
        <br />
        <div>
          Welcome to the blockchain...
        </div>
        <br />
        <br />
        <div className='WalletInfo'>
          <div>Address: {address}</div>
          <div>Balance: {balance}</div>
        </div>
      </div>
    );
  }
}

export default App;