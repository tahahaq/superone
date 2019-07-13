import React, { Component } from 'react';
import Logo from '../assets/logo2.png'
import { connect } from 'react-redux';
import { USER_DATA, CERTIFICATE_DATA } from '../redux/actions/signin-action';
import { Container, Row, Col } from 'react-grid-system';
import {
  Link
} from 'react-router-dom';
import inventLogo from '../assets/invent.png'
import { Card, Input, Icon, Button, message } from 'antd';
import UserInfo from './UserInfo';
import './AdjustedDashboard.css';
import 'tachyons';
import UserModal from './UserModal';


const blockstack = require('blockstack');
const axios = require('axios');
const { Meta } = Card;
const Search = Input.Search;

class AdjustedDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      emailNotRegistered: true,
      isSignedIn: false,
      blockStackEmail: "",
      blockstackIdentity: "",
      displayCertificates: [],
      userProfile: "",
      modalopen:false,
    }
  }

  handleSignOut = (event) => {
    event.preventDefault();
    this.props.history.push("/");
    blockstack.signUserOut(window.location.href);
  }

  onClickSingleCertificate = (cert) => {
    console.log("Received certificate details: ", cert);
    this.props.CERTIFICATE_DATA(cert)
  }


  loadPerson() {
    let userData = blockstack.loadUserData();
    let profile = userData.profile;
    let username = userData.username;
    let that = this;
    let thisPerson = {};
    if (username.length > 0) {
      blockstack.lookupProfile(username).then((person) => {
        thisPerson = ({ person });
      })
    }

    if (userData.identityAddress) {
      // alert("Identity exists in server. ", userData.identityAddress);
      this.props.USER_DATA(userData);
      console.log("Identity exists in server. ", userData.identityAddress);

      axios.get(`https://encert-server.herokuapp.com/issuer/participant/exist/${userData.identityAddress}`, {
      })
        .then(function (response) {
          console.log("Response for id check is: ", response);
          console.log("Data exists for blockstack ID in server : ", response.data.data.result);

          if (!response.data.data.result) {
            that.setState({ emailNotRegistered: true });
          }

          axios.get("https://encert-server.herokuapp.com/issuer/certificate/blockstack/" + userData.identityAddress)
            .then(function (response) {
              // console.log(blockstack.loadUserData().profile.image[0],"image")
              console.log("Certificate Array is: ", response.data.data.results);
              // console.log("CERTIFICATES: " + response.data.data.results);
              let arr = response.data.data.results
              let displayCerts = arr.map((cert, i) => {
                console.log(cert, "certificate data")
                return (
                  <Col key={i} style={{ marginBottom: '20px' }} md={3} sm={12}>
                    <Link to={{ pathname: "/certificate", search: "?" + cert._id }} target="_blank" onClick={() => that.onClickSingleCertificate(cert)} >
                      <Card
                      className='grow card'
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
                displayCertificates: displayCerts,
                person: ({ thisPerson }),
                userProfile: profile,
                userIdentity: true,
                isSignedIn: true,
                blockstackIdentity: userData.identityAddress
              })
              console.log("states is ", that.state);
            })

            .catch(function (error) {
              console.log(error);
            });
        })
        .catch(function (error) {
          console.log("Error while fetching identity from server. ", error);
        });
    }
    else {
      alert("No identity found in server.");
    }
  }


  detectmob() {
    if (navigator.userAgent.match(/Android/i)
      || navigator.userAgent.match(/webOS/i)
      || navigator.userAgent.match(/iPhone/i)
      || navigator.userAgent.match(/iPod/i)
      || navigator.userAgent.match(/BlackBerry/i)
      || navigator.userAgent.match(/Windows Phone/i)
    ) {
      return true;
    }
    else {
      return false;
    }
  }

  componentDidMount() {
    if (blockstack.isUserSignedIn()) {
      this.loadPerson();
    }
    else {
      this.props.history.push("/");
    }
  }

  onEmailChange = (event) => {
    console.log("Received Input: ", event.target.value);
    this.setState({
      blockStackEmail: event.target.value
    })
  }

  handleEmailSubmit = () => {
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
        that.setState({ loading: false, emailNotRegistered: false });
      })
      .catch(function (error) {
        console.log("Error inserting data: ", error);
        // that.showMessage("Error submitting data. Please check your information and retry.", "error");
        that.showMessage("This email address has already been registered.", "error")
        that.setState({ loading: false });
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
  };

  filterCertificates = (value) => {
    let searchValue = '';

    if(typeof value !== undefined)
    {
      if(value.target)
      {
        if(value.target.value)
        {
          searchValue = value.target.value;
        }  
      }
      else if(value.length)
      {
        searchValue = value;
      }
    }

    let that = this;
    let ourCertificates = this.state.certificates;
    let myDisplayCerts = [];
    let displayCerts = ourCertificates.filter((current, index) => {
      console.log(current, "certificate data")
      if (current.achievement_title.toLowerCase().includes(searchValue.toLowerCase())) {
        console.log(current, "certificate data")
        myDisplayCerts.push(
          <Col key={index} style={{ marginBottom: '20px' }} md={3} sm={12}>
            <Link to={{ pathname: "/certificate", search: "?" + current._id }} target="_blank" onClick={() => that.onClickSingleCertificate(current)} >
                <Card
                      className='grow card'
                        style={{ boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)' }}
                        cover={<img alt="example" src={inventLogo} />}
                      // actions={[<Icon type="setting" />, <Icon type="edit" />, <Icon type="ellipsis" />]}
                      >
                <Meta
                  // avatar={<Avatar src={(blockstack.loadUserData().profile.imag=='undefined')?(inventLogo):(blockstack.loadUserData().profile.image[0].contentUrl)} />}
                  title={current.achievement_title}
                  description={current.event_name}
                />
              </Card>
            </Link>
          </Col>
        );
        return (
          <Col style={{ marginBottom: '20px' }}  className="card" md={3} sm={12}>
            <Link to={{ pathname: "/certificate", search: "?" + current._id }} target="_blank" onClick={() => that.onClickSingleCertificate(current)} >
                  <Card
                    className='grow card'
                    style={{ boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)' }}
                    cover={<img alt="example" src={inventLogo} />}
                    // actions={[<Icon type="setting" />, <Icon type="edit" />, <Icon type="ellipsis" />]}
                  >
                <Meta
                  // avatar={<Avatar src={(blockstack.loadUserData().profile.imag=='undefined')?(inventLogo):(blockstack.loadUserData().profile.image[0].contentUrl)} />}
                  title={current.achievement_title}
                  description={current.event_name}
                />
              </Card>
            </Link>
          </Col>
        );
      }
      else
      {
        return <h1>No certificates found for this search. Please re-check your entry.</h1>
      }
    }
    )
    if(myDisplayCerts.length < 1)
    {
      myDisplayCerts[myDisplayCerts.length] = (<h2>No certificates found for this search. Please re-check your entry.</h2>);
    }
    console.log("New certificates are: ", myDisplayCerts);
    that.setState({
      displayCertificates: myDisplayCerts
    });
    // let displayCerts = ourCertificates.map((cert, i) => {
    //   console.log(cert,"certificate data")
    //   return (
    //     <Col style={{marginBottom: '20px'}} md={3} sm={12}>
    //     <Link to={{ pathname: "/certificate", search: "?"+cert._id }} target="_blank" onClick={() => that.onClickSingleCertificate(cert)} >
    //       <Card                    
    //         style={{ boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)' }}
    //         cover={<img alt="example" src={inventLogo} />}
    //       // actions={[<Icon type="setting" />, <Icon type="edit" />, <Icon type="ellipsis" />]}
    //       >
    //         <Meta
    //           // avatar={<Avatar src={(blockstack.loadUserData().profile.imag=='undefined')?(inventLogo):(blockstack.loadUserData().profile.image[0].contentUrl)} />}
    //           title={cert.achievement_title}
    //           description={cert.event_name}
    //         />
    //       </Card>
    //     </Link>
    //     </Col>
    //   );
    // });

  }

  modaluser=()=>{
this.setState({modalopen:!this.state.modalopen});
console.log("wow");
  }

  render() {



    console.log("State is : ", this.state);
    let displayData = [];
    let userNameAndImage = {
      name: "",
      imageURL: ""
    }
    if(this.state.userProfile.image)
    {
      userNameAndImage.name = this.state.userProfile.name;
      userNameAndImage.imageURL = this.state.userProfile.image[0].contentUrl;
    }
    if (this.state.displayCertificates.length) {
      displayData = this.state.displayCertificates;
    }
    if (blockstack.isUserSignedIn()) {
      return (
        // <div>User is Signed in.</div>
        <div>
{
  (this.state.modalopen===true)
  ? <UserModal/>
  :console.log("no modal")
}

          <div style={{ display: 'block'}}>
                    <header className="App-header">
                    <div className="headerlogo">
                        <img src={Logo} style={{ width: '100%', heigh: 'auto' }}></img>
                    </div>
                    <div className="header-elements">
                        <h4 style={{ display: this.detectmob() ? 'none' : 'inline-block' }}>{userNameAndImage.name}</h4>
                        <img className="avatar-header" src={userNameAndImage.imageURL} onClick={this.modaluser}></img>
        
                        <a className="link-signout" onClick={this.handleSignOut}>
                            Log out
                        </a>
                    </div>
                    
        
                    </header>
                </div>

          {/* <div style={{ display: 'absolute' }}> */}
          {
            this.state.emailNotRegistered ?
              <div>

        <div className="search">
              <div>
              <Search
                placeholder="input a rank"
                onSearch={value => this.filterCertificates(value)}
                onChange={value => this.filterCertificates(value)}
                enterButton
                
              />
              
              </div>
        </div>
              {/* <div>
                  <UserInfo user={this.state.userProfile} />
              </div> */}
            <div className="search">
              <div className="separator" style={{marginTop:'5vh'}}/>
            
                  <h1>Your Certifications</h1>
              </div>
              <br />
             
              <Container >
                  <Row style={{textAlign:'center', justifyContent: 'center'}}>
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
                  onChange={this.onEmailChange}
                />
                <Button className="signin-btn" loading={this.state.loading} onClick={this.handleEmailSubmit}>
                  <span style={{ marginLeft: '0px' }} className="signin-btn-text">Submit</span>
                </Button>
                {/* <br /><br /> */}
              </div>
          }

        </div>
        // </div>
      );
    }
    else {
      this.props.history.push("/");
      return (
        <div>User is NOT Signed in.</div>
      );
    }
  }

}

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

export default connect(null, mapDispatchToProp)(AdjustedDashboard);
