

function BuyProduct(categoryId) {

    console.log("ostad passi kategoorias " + categoryId)

    var myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'));

    var requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        redirect: 'follow'
    }

    //body payment type

    fetch('https://api.poff.ee/buy/'+ categoryId, requestOptions).then(function (response) {
        if (response.ok) {
            return response.json();
        }
        return Promise.reject(response);
    }).then(function (data) {
        console.log(data);

    }).catch(function (error) {
        console.warn(error);
    });

}

var paymentType = "valimata"

function SelectPaymentType(id){
    paymentType= id
    console.log("sinu valitud makseviis on " + paymentType)
}

function Buy(productCode){
    console.log("ostad toote "+productCode+" ja maksad " + paymentType)
}

function GetPaymentLinks() {

    var links = document.getElementById("paymentLinks")

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
        var bankInfo= ""
        //pangalingid
        for (var i = 0; i < data.banklinks.length; i++){
            if (data.banklinks[i].country === "ee"){
                var button = '<img src='+ data.banklinks[i].logo +' onClick=SelectPaymentType("'+data.banklinks[i].id+'") >'
                console.log(data.banklinks[i].logo)
                bankInfo += button
            }
        }
        //credist cards
        for (var i = 0; i < data.cards.length; i++){
            var button = '<img src='+ data.cards[i].logo +' onClick=SelectPaymentType("'+data.cards[i].id+'") >'
            console.log(data.cards[i].logo)
            bankInfo += button

        }
        links.innerHTML = bankInfo

    }).catch(function (error) {
        console.warn(error);
    });

}





