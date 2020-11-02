
if (localStorage.getItem('ACCESS_TOKEN') && (document.getElementById("directToLoginButton"))) {
    console.log('loggedin');
        document.getElementById("directToLoginButton").style.display = 'none'
        document.getElementById("buybutton").style.display = 'block'
}





function BuyProduct(categoryId) {

    var feedback = document.getElementById("feedback")
    if (paymentType === "valimata") {
        feedback.innerHTML = "Palun vali makseviis"
    } else {
        console.log("ostad passi kategoorias " + categoryId)

        var myHeaders = new Headers();
        myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'));

        var requestOptions = {
            "method": 'PUT',
            "headers": myHeaders,
            "redirect": 'follow',
            "body": JSON.stringify({ "paymentMethodId": paymentType }),
            "content-type": 'application/json'
        }
        console.log(requestOptions)

        fetch('https://api.poff.ee/buy/' + categoryId, requestOptions).then(function (response) {
            if (response.ok) {
                return response.json();
            }
            return Promise.reject(response);
        }).then(function (data) {
            console.log(data);
            window.open(data.url, '_self')


        }).catch(function (error) {
            console.warn(error);
        });

    }

}

var paymentType = "valimata"

function SelectPaymentType(id) {
    paymentType = id

    console.log("sinu valitud makseviis on " + paymentType)
}

function Buy(productCode) {
    console.log("ostad toote " + productCode + " ja maksad " + paymentType)
}

function GetPaymentLinks() {
    document.getElementById("buybutton").style.display = 'none'
    var links = document.getElementById("paymentLinks")
    var paybutton = document.getElementById("paybutton")

    var myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'));

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    }

    //body payment type

    fetch('https://api.poff.ee/buy', requestOptions).then(function (response) {
        if (response.ok) {
            return response.json();
        }
        return Promise.reject(response);
    }).then(function (data) {
        console.log(data);
        var bankInfo = ""

        //pangalingid
        for (var i = 0; i < data.banklinks.length; i++) {
            if (data.banklinks[i].country === "ee") {
                var button = '<label><input type="radio" name="payment" value="' + data.banklinks[i].id + '"><img src=' + data.banklinks[i].logo + ' onClick=SelectPaymentType("' + data.banklinks[i].id + '") ></label>'
                bankInfo += button
            }
        }

        //credist cards
        for (var i = 0; i < data.cards.length; i++) {
            var button = '<label><input type="radio" name="payment" value="' + data.cards[i].id + '"><img src=' + data.cards[i].logo + ' onClick=SelectPaymentType("' + data.cards[i].id + '") ></label>'
            bankInfo += button
        }

        //other
        for (var i = 0; i < data.other.length; i++) {
            var button = '<label><input type="radio" name="payment" value="' + data.other[i].id + '"><img src=' + data.other[i].logo + ' onClick=SelectPaymentType("' + data.other[i].id + '") ></label>'
            bankInfo += button
        }
        links.innerHTML = bankInfo
        paybutton.style.display = "block"

    }).catch(function (error) {
        console.warn(error);
    });
}

function checkIfPasswordBuyer(){
    if (userProfile.picture && userProfile.profile_filled){
        GetPaymentLinks()
    } else if (userProfile.profile_filled) {
        document.getElementById('buybutton').style.display = 'none'
        document.getElementById('directToaddPicture').style.display = 'block'
    } else {
        document.getElementById('buybutton').style.display = 'none'
        document.getElementById('directToFillProfile').style.display = 'block'
    }
}

function directToLogin() {
    window.open('http://localhost:4000/login', '_self')
}

function directToUserProfile() {
    window.open('http://localhost:4000/userprofile', '_self')
}

function saveLangpath(langpath){
    console.log(langpath);
}


