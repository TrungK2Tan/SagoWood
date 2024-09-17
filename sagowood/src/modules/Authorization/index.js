import React from 'react'
import Form from './Form'

const Auth =()=>{
    const isSignInPage =window.location.pathname.includes('signin')
    return(
       <Form isSignInPage={isSignInPage}/>
    )
}
export default Auth