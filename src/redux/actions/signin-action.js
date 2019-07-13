
export const USER_LOGIN_DATA='USER_LOGIN_DATA';
export const CERT_DATA='CERT_DATA';

export function USER_DATA(data) {
  
  console.log(data)
return { type: USER_LOGIN_DATA, payload : data }
}


export function CERTIFICATE_DATA(data) {
  console.log("======")
  console.log("cert data",data)
return { type: CERT_DATA, payload : data }
}
