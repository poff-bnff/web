async function loginViaCognito(){

    let loginUsername = document.getElementById('loginUsername').value;
    let loginPassword = document.getElementById('loginPassword').value;


// Amazon Cognito creates a session which includes the id, access, and refresh tokens of an authenticated user.

    let authenticationData = {
            Username : loginUsername,
            Password : loginPassword
    };

    let authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    let poolData = {
            UserPoolId : 'eu-central-1_ockBtdcsP',
            ClientId : 'le8630imjv6fcffqqt0ugpm5s'
    };

    let userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    let userData = {
            Username : loginUsername,
            Pool : userPool
    };

    let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: async function (result) {

            localStorage.setItem('ACCESS_TOKEN', result.accessToken.jwtToken);
            localStorage.setItem('REFRESH_TOKEN', result.refreshToken.token);
            localStorage.setItem('ID_TOKEN', result.idToken.jwtToken);
            location.reload();

            /* Use the idToken for Logins Map when Federating User Pools with identity pools or when passing through an Authorization Header to an API Gateway Authorizer */
            let idToken = result.idToken.jwtToken;

        },

        onFailure: function(err) {
            alert(JSON.stringify(err));
        },
    });
}


// async function loadUserProfile(){
//     console.log('loadUserProfile');
//     let response = await fetch(`https://api.poff.ee/profile`, {
//             method: 'GET',
//             headers: {
//                 Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN')}
//         });
//         const USER_PROFILE = await response.json()
//         console.log(USER_PROFILE)
//         CheckIfProfFilled(USER_PROFILE)


//         if (USER_PROFILE){
//             hello.innerHTML = 'Hello, ' + USER_PROFILE.name

//         } else {
//             hello.innerHTML = 'Not logged in'
//         }
// }




// function doSignUp(){
//     console.log("Sign up function");
//     signUpPassword2.innerHTML = `<label for'signUpPasswordRepeat' style="color:red;">Password 2x:</label><input type="signUpPasswordRepeat" id="signUpPasswordRepeat">`;
//     //- <label for="loginPassword">Password:</label>
//     //- <input type="password" id="loginPassword">

//     let password2 = document.getElementById('signUpPasswordRepeat').value;
//     console.log(password2);
//     doSignUp.innerHTML = `<button>doSignUp</button>`;
// }
