let url = window.location;

const ACCESS_TOKEN = "ACCESS_TOKEN";
const ID_TOKEN = "ID_TOKEN";
const REFRESH_TOKEN = "REFRESH_TOKEN";

//- let userProfile = loadInfoFromIdtkn();
//- console.log(userProfile);

if (localStorage.getItem('ID_TOKEN')){
    hello.innerHTML = 'Hello, ' + name;
    favoritefilm.innerHTML = '<button onclick="addFavoriteFilm()">Add film to favorites</button>';

} else {
    hello.innerHTML = 'Not logged in'
}

let tokens = (window.location.hash.substr(1)).split('&');
console.log(tokens);
if (tokens[3]) {
    storeAuthentication(tokens);
} else {
    console.log('Not sent ')
}

async function storeAuthentication(tokens) {
    console.log('storeauth');
    localStorage.setItem(ACCESS_TOKEN, tokens[0].substr(13));
    localStorage.setItem(ID_TOKEN, tokens[1].substr(9));
    window.location.hash = '';
    loadInfoFromIdtkn();
    // location.reload();
}

function getAccessToken() {
    token.innerHTML = localStorage.getItem(`ACCESS_TOKEN`);
    return localStorage.getItem(`ACCESS_TOKEN`);
}

function logOut() {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    localStorage.removeItem(ID_TOKEN);
    console.log('LOGITUD VÄLJA');
    location.reload();
}







async function loadCognitoUser(){
    console.log(localStorage.getItem(ACCESS_TOKEN));
    let myHeaders = new Headers();

    myHeaders.append('Authorization', `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`);

    let requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    console.log(requestOptions.headers);

    await fetch("https://pfftestdom1.auth.eu-central-1.amazoncognito.com/oauth2/userInfo", requestOptions)
        .then(response => response.text())
        .then(result => {
            console.log(result);
            const JSONresult = JSON.parse(result);
            console.log(JSONresult.name);
            hello.innerHTML = 'Hello1, ' + JSONresult.name + '(token+userInfo request)';
        })
        .catch(error => console.log('error', error));
}




async function login(){

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
            //- var accessToken = result.getAccessToken().getJwtToken();
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


async function showUserInfo(){

    console.log(userProfile);
    //- var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({region: 'eu-central-1'});

    //- var params = {
    //-     AccessToken: localStorage.getItem('ACCESS_TOKEN') /* required */
    //- };
    //- cognitoidentityserviceprovider.getUser(params, function(err, data) {
    //-     if (err) console.log(err, err.stack); // an error occurred
    //- else     console.log(data);           // successful response
    //- });
}


async function loadInfoFromIdtkn(){
    console.log('loadInfoFromIdtk');
    let response = await fetch(`https://api.poff.ee/prod-poff-api-tkns`, {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('ID_TOKEN')}

        });
        return response.json();

}


async function addFavoriteFilm(){
    console.log('addFavoriteFilm');

    let favoriteEntry = {
        user: 'test123',
        film: 'funnyFilm'
    }


    let response = await fetch(`https://api.poff.ee/prod-poff-api-tkns`, {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('ID_TOKEN')},
                body: JSON.stringify(favoriteEntry)
                //- body: JSON.stringify(data)
        });
        console.log(await response.json());
}


function doSignUp(){
    console.log("Sign up function");
    signUpPassword2.innerHTML = `<label for'signUpPasswordRepeat' style="color:red;">Password 2x:</label><input type="signUpPasswordRepeat" id="signUpPasswordRepeat">`;
    //- <label for="loginPassword">Password:</label>
    //- <input type="password" id="loginPassword">

    let password2 = document.getElementById('signUpPasswordRepeat').value;
    console.log(password2);
    doSignUp.innerHTML = `<button>doSignUp</button>`;
}





// HISTORY:


//- async function loginWithCode(code) {
//-             console.log('Code sent: ' + code);

//-             var myHeaders = new Headers();

//-             myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
//-             myHeaders.append("Authorization", "Basic [clientId:clientSecret base64");
//-             myHeaders.append("Cookie", "XSRF-TOKEN=85d4e10e-24b4-4b63-90ff-f7d791471e38");

//-             var urlencoded = new URLSearchParams();
//-             urlencoded.append("grant_type", "authorization_code");
//-             urlencoded.append("redirect_uri", "https://dev.inscaping.eu/login/");
//-             urlencoded.append("code", code);

//-             var requestOptions = {
//-                 method: 'POST',
//-                 headers: myHeaders,
//-                 body: urlencoded,
//-                 redirect: 'follow'
//-             };

//-             await fetch("https://pfftestdom1.auth.eu-central-1.amazoncognito.com/oauth2/token", requestOptions)
//-                 .then(response => response.text())
//-                 .then(result => {
//-                     console.log(result);
//-                     const JSONresult = JSON.parse(result);
//-                     console.log(JSONresult.access_token);
//-                     if (JSONresult.access_token && JSONresult.refresh_token) {
//-                         storeAuthentication(JSONresult);
//-                     }
//-                 })
//-                 .catch(error => console.log('error', error));
//-         }


//- button(onclick='loadCognitoUser()') Say Hello to Cognito user via token+userInfo request

//- a(href='https://pfftestdom1.auth.eu-central-1.amazoncognito.com/login?client_id=1q24246tqd48cpepne3vnunmiq&response_type=code&scope=profile+aws.cognito.signin.user.admin+openid+email+phone&redirect_uri=https://dev.inscaping.eu/login/') (Log in via hosted UI)


