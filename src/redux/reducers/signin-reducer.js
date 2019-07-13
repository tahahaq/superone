import { USER_LOGIN_DATA, CERT_DATA } from "../actions/signin-action";

const INITIAL_STATE = {
user_data : {},
certificate_data:{}
}

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case USER_LOGIN_DATA : 
        // console.log(action.payload)
        return({
            user_data : action.payload
        })
        case CERT_DATA : 
        // console.log(action.payload)
        return({
            certificate_data : action.payload
        })
        default: 
        return state
    }
}
