import React from 'react';
import Web3 from 'web3';
import web3 from '../interface/web3';
import tokenSaleController from '../interface/tokenSaleController';


export default class Box1 extends React.Component {
  constructor() {
    super();
    this.state = {
      input1: '',
      input2: '',
      input3: ''
    };
    this.onInputChange = this.onInputChange.bind(this);
    this.onBuyClick = this.onBuyClick.bind(this);
  }

  async componentDidMount() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
        // Request account access if needed
        await window.ethereum.enable();
        // Acccounts now exposed
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      window.web3 = new Web3(this.web3.currentProvider);
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  onInputChange(e, num) {
    this.setState({ [`input${num}`]: e.target.value });
  }

  async onBuyClick() {
    const accounts = await web3.eth.getAccounts();
    let isOtherBenfificary ;
    if(this.state.input3 === ''){
       isOtherBenfificary = accounts[0]
    }else {
      isOtherBenfificary = this.state.input3;
    }

    let etherPrice = await tokenSaleController.methods.ETHUSD().call();
    console.log(etherPrice)
    let etherCost = parseInt(this.state.input2);
    etherCost = (etherCost*1000) / parseInt(etherPrice );
    etherCost+= 0.02;


    let that = this;
    await tokenSaleController.methods
        .buyToken( isOtherBenfificary, parseInt(this.state.input2) ,this.state.input1 ).send({
          from: accounts[0],
          value: web3.utils.toWei(etherCost.toString(), 'ether')
        }).on('transactionHash', (hash) => {
          that.setState({ transactionHash: 'https://rinkeby.etherscan.io/tx/' + hash })
        }).on('confirmation', function (confirmationNumber, receipt) {
          console.log(confirmationNumber + ' ' + receipt);
          console.log("Transaction confirmed");
          return true;
        })
    ;
  }

  render() {
    const { input1, input2, input3 } = this.state;
    console.log(this.state)

    return (
      <div>
        <div id="box-1">
          <div className="container-fluid col-md-6">
            <form>
              <div className="row">
                <div className="col">
                  <input
                    type="text"
                    value={input1}
                    className="form-control form-control-lg mb-4"
                    placeholder="Investor code"
                    onChange={e => this.onInputChange(e, '1')}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <input
                    type="text"
                    value={input2}
                    className="form-control form-control-lg mb-4"
                    placeholder="Number of tokens"
                    onChange={e => this.onInputChange(e, '2')}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <input
                    type="text"
                    value={input3}
                    className="form-control form-control-lg mb-4"
                    placeholder="Beneficiary address (optional)"
                    onChange={e => this.onInputChange(e, '3')}
                  />
                </div>
              </div>
              <div className="row mt-5 mb-2">
                <div className="col">
                  <h4 className="text-muted">Your investment amount</h4>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <h2>
                    <b>$100,000</b>
                  </h2>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <h6>ETH 50.1234</h6>
                </div>
              </div>
              <div className="row mt-5">
                <div className="col">
                  <button
                    id="buy"
                    style={{ width: 320 }}
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={this.onBuyClick}
                  >
                    BUY
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
