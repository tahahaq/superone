import React, { Component } from 'react';
import Loader from 'react-loader-spinner';

import './UserInfo.css';

class UserInfo extends Component {
  constructor(props) {
    super(props)
  }

  state = {
    loading: false
  }

  render() {
    // console.log("USER PROPS ARE: ", this.props);
    return (
      <div className="UserInfo">

        {
          this.props.user && this.props.user.image ?
          <div>
          <img class="avatar" src={this.props.user.image[0].contentUrl} />
          <h1>{this.props.user && this.props.user.name ? this.props.user.name : "User Name"}</h1>
          </div>
          :
          <div>
          <Loader 
          type="Triangle"
          color="#5cdb95"
          height="200"	
          width="200"
         />
         <p>Getting details...</p>
          </div>
        }
      </div>
    )
  }
}

export default UserInfo;



// "/noprofilepicture.png"

{/* <PushSpinner
size={30}
color="#686769"
loading={true} */}
