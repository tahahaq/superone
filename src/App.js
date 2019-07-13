import React, { Component } from 'react';
import UserInfo from './components/UserInfo';

import { Card, Icon, Avatar, Modal, Button, Input, message } from 'antd';

import './App.css';

import { connect } from 'react-redux';
import { USER_DATA, CERTIFICATE_DATA } from './redux/actions/signin-action';
import 'antd/dist/antd.css'
import Logo from './assets/logo2.png'
import blockstackLogo from './assets/blockstack-icon.svg'
import encertLogo from './assets/logo-blackweb.png'
import inventLogo from './assets/invent.png'
import { Container, Row, Col } from 'react-grid-system';
import {
  Link  
} from 'react-router-dom';


const blockstack = require('blockstack');
const { Meta } = Card;
const axios = require('axios');


class App extends Component {
  constructor(props) {
    super(props)

    let isSignedIn = this.checkSignedInStatus();

    this.state = {
      certificates: [],
      isSignedIn,
      person: undefined,
      revokedIsVisible: false,
      blockStackModalIsVisible: false,
      userIdentity: false,
      blockstackIdentity: "",
      blockStackEmail: "",
      blockStackName: "",
      displayCertificates: null,
      clickedCertificate: {
        ID: "",
        achievementTitle: "",
        domain: "",
        coverImage: "",
        receiverName: "",
        blockstackID: "",
        issuerName: "",
        description: "",
        issueDate: "",
        revokedDate: "",
        reason: "",
        expirationDate: ''
      },
    };

    if (isSignedIn) {
      this.loadPerson();
    }

    this.handleSignIn = this.handleSignIn.bind(this)
    this.handleSignOut = this.handleSignOut.bind(this)
  }


  checkSignedInStatus() {
    if (blockstack.isUserSignedIn()) {
      return true;
    } else if (blockstack.isSignInPending()) {
      blockstack.handlePendingSignIn().then(function (userData) {
        window.location = window.location.origin
      });
      return false;
    }
  }

  loadPerson() {
    let username = blockstack.loadUserData().username
    // console.log(blockstack.loadUserData().profile.image[0].contentUrl, "user data");
    let userData = blockstack.loadUserData();
    // history.push('/home');

    if (userData.identityAddress) {
      // alert("Identity exists in server. ", userData.identityAddress);
      let that = this;
      this.props.USER_DATA(userData);
      console.log("Identity exists in server. ", userData.identityAddress);
      axios.get(`https://encert-server.herokuapp.com/issuer/participant/exist/${userData.identityAddress}`, {
      })
      .then(function (response) {
        console.log("Response for id check is: ", response);
        // console.log("Data exists for blockstack ID in server : ", response.data.data.result);
        if (!response.data.data.result) {
          that.setState({ blockStackModalIsVisible: true });
          }


          blockstack.lookupProfile(username).then((person) => {
            that.setState({ person });
            // console.log("LOOKUP RETURNS: ", person);
          })

          axios.get("https://encert-server.herokuapp.com/issuer/certificate/blockstack/" + userData.identityAddress)
            .then(function (response) {
              // console.log(blockstack.loadUserData().profile.image[0],"image")
             console.log("Certificate Array is: ", response.data.data.results);
              // console.log("CERTIFICATES: " + response.data.data.results);
              let arr = response.data.data.results
              let displayCerts = arr.map((cert, i) => {
                console.log(cert,"certificate data")
                return (
                  <Col style={{marginBottom: '20px'}} md={3} sm={12}>
                  <Link to={{ pathname: "/Certificate", search: "?"+cert._id }} target="_blank" onClick={() => that.showModal(cert)} >
                    <Card                    
                      style={{ boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)' }}
                      cover={<img alt="example" src={inventLogo} />}
                    // actions={[<Icon type="setting" />, <Icon type="edit" />, <Icon type="ellipsis" />]}
                    >
                      <Meta
                        // avatar={<Avatar src={(blockstack.loadUserData().profile.imag=='undefined')?(inventLogo):(blockstack.loadUserData().profile.image[0].contentUrl)} />}
                        title={cert.achievement_title}
                        description={cert.event_name}
                      />
                    </Card>
                  </Link>
                  </Col>
                );
              });
              that.setState({
                certificates: arr,
                displayCertificates: displayCerts
              })
              console.log(that.state)
            })

            .catch(function (error) {
              console.log(error);
            });
          // console.log(that.state, "state");

          that.setState({
            userIdentity: true,
            blockstackIdentity: userData.identityAddress
          })
        })
        .catch(function (error) {
          console.log("Error while fetching identity from server. ", error);
        });
    }
    else {
      alert("No identity found in server.");
    }
  }

  handleSignIn(event) {
    event.preventDefault();
    blockstack.redirectToSignIn()
  }

  handleSignOut(event) {
    event.preventDefault();
    blockstack.signUserOut(window.location.href)

  }
  handleOk = () => {
    this.setState({ loading: false, revokedIsVisible: false });
  }
  handleCancel = () => {
    this.setState({ revokedIsVisible: false });
  }
  showRevokeModal = () => {
    this.setState({
      revokeCertificateIsVisible: true,
    });
  }

  showBlockStackModal = () => {
    this.setState({
      blockStackModalIsVisible: true
    })
  }

  handleblockStackModalOk = () => {
    this.setState({ loading: true });
    let that = this;
    axios.put("https://encert-server.herokuapp.com/issuer/participant/", {
      blockstack_id: this.state.blockstackIdentity,
      email: this.state.blockStackEmail
    })
      .then(function (response) {
        console.log("Server returned response for info insertion: ", response.data);
        // that.showMessage("Data submitted. Redirecting...", "success");
        that.showMessage("Data submitted. Redirecting...", "success")
        that.setState({ loading: false, blockStackModalIsVisible: false });
      })
      .catch(function (error) {
        console.log("Error inserting data: ", error);
        // that.showMessage("Error submitting data. Please check your information and retry.", "error");
        that.showMessage("This email address has already been registered.", "error")
        that.setState({ loading: false });
      });

  }

  handleblockStackModalCancel = () => {
    this.setState({ blockStackModalIsVisible: false });
  }

  onBlockStackModalNameChange = (event) => {
    console.log("Received Input: ", event.target.value);
    this.setState({
      blockStackName: event.target.value
    })
  }

  onBlockStackModalEmailChange = (event) => {
    console.log("Received Input: ", event.target.value);
    this.setState({
      blockStackEmail: event.target.value
    })
  }

  handleBlockStackModalSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
      else {
        console.log("Validation succeeded! Submitting form.");
      }
    });
  }

  showMessage = (text, type) => {

    if (type == "success") {
      message.success(text, 1);
    }
    else if (type == "warning") {
      message.warning(text, 2.5);
    }
    else if (type == "error") {
      message.error(text, 2.5);
    }
    // else
    // {
    //   message.warning(text, 5000);
    // }
  };

  showModal = (cert) => {
    // alert("Modal is working.");
    // window.open('https://xord.one/');
    // this.props.history.push('/showCertificate');
    // <Link to="route" target="_blank" onClick={(event) => {event.preventDefault(); window.open(this.makeHref("route"));}} />

    console.log("Received certificate details: ", cert);
    this.props.CERTIFICATE_DATA(cert)
  }


  detectmob() { 
    if( navigator.userAgent.match(/Android/i)
    || navigator.userAgent.match(/webOS/i)
    || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPod/i)
    || navigator.userAgent.match(/BlackBerry/i)
    || navigator.userAgent.match(/Windows Phone/i)
    ){
       return true;
     }
    else {
      return false;
    }
  }

  render() {
    let myPersonName = null;
    let myPersonImage = null;
    if (this.state.person) {
      myPersonName = this.state.person.name;
      if (this.state.person.image) {
        myPersonImage = this.state.person.image[0].contentUrl;
      }
    }
    // const { getFieldDecorator } = this.props.form;
    // console.log("PERSON: ", this.state.person);
    console.log("Is mobile? ", this.detectmob())
    let myPerson = null;
    if(this.state.person)
    {
      // console.log("PERSON: ", this.state.person.name);
      myPerson = this.state.person.name;
    }

    return (
      <div className="App">

        {/* <header className="App-header">
          <h1 className="App-title">Encert</h1>
        </header> */}
        <div style={{ display: this.state.isSignedIn ? 'block' : '' }}>
          <header className="App-header">
            <div className="headerlogo">
              <img src={Logo} style={{ width: '100%', heigh: 'auto' }}></img>
            </div>
            <div className="header-elements">
              <h4 style={{ display: this.detectmob() ? 'none' : 'inline-block' }}>{myPersonName}</h4>
              <img className="avatar-header" src={myPersonImage}></img>

              <a className="link-signout" onClick={this.handleSignOut}>
                    Log out
                  </a>
            </div>
            

          </header>
        </div>

        {/* <div className="signin-container" style={{ display: this.state.isSignedIn ? 'none' : 'block' }}>
          <div>
            <img className="logo" src={encertLogo} />
          </div>
          <Button className="signin-btn" onClick={this.handleSignIn}>
            <img className="blockstack-logo" src={blockstackLogo} />
            <span className="signin-btn-text">
              Sign-in with Blockstack
          </span>
          </Button>
        </div> */}

        <div style={{ display: !this.state.isSignedIn ? 'none' : 'absolute' }}>
          {
            !this.state.blockStackModalIsVisible ?
              <div>
                <div>
                  <UserInfo user={this.state.person} />
                </div>
                <div className="separator"/>
                <div>
                  <h1>Your Certifications</h1>
                </div>
                <br />
                <Container>
                  <Row>
                    {this.state.displayCertificates}
                  </Row>
                </Container>
                <br />
              </div>
              :
              <div className="email-form">
                <Input
                  style={{ marginBottom: "10px" }}
                  placeholder="Enter your email address"
                  prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  onChange={this.onBlockStackModalEmailChange}
                />
                <Button className="signin-btn" loading={this.state.loading} onClick={this.handleblockStackModalOk}>
                  <span style={{ marginLeft: '0px' }} className="signin-btn-text">Submit</span>
                </Button>
                {/* <br /><br /> */}
              </div>
          }
        </div>


        <div>
          <Modal
            visible={this.state.revokedIsVisible}
            title="Revoked Certificate Details"
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            footer={[
              <Button key="submit" type="primary" onClick={this.handleOk}>
                OK
              </Button>,
            ]}
          >
            <p>{`ID: ${this.state.clickedCertificate.ID}`}</p>
            <p>{`Achievement Title:  ${this.state.clickedCertificate.achievementTitle}`}</p>
            <p>{`Domain:  ${this.state.clickedCertificate.domain}`}</p>
            <p>{`Cover Image: ${this.state.clickedCertificate.coverImage}`}</p>
            <p>{`Receiver Name: ${this.state.clickedCertificate.receiverName}`}</p>
            <p>{`Blockstack ID: ${this.state.clickedCertificate.blockstackID}`}</p>
            <p>{`Issuer Name: ${this.state.clickedCertificate.issuerName}`}</p>
            <p>{`Description: ${this.state.clickedCertificate.description}`}</p>
            <p>{`Issue Date: ${this.state.clickedCertificate.issueDate}`}</p>
            <p>{`Expiration Date: ${this.state.clickedCertificate.expirationDate}`}</p>
          </Modal>
        </div>
      </div>
    )
  }
}

//asd


function mapDispatchToProp(dispatch) {
  return ({
    USER_DATA: (user) => {
      dispatch(USER_DATA(user))
    },
    CERTIFICATE_DATA: (certData) => {
      dispatch(CERTIFICATE_DATA(certData))
    },
  })
}


export default connect(null, mapDispatchToProp)(App);

// export default App;
