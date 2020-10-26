

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

function GetPaymentLinks() {

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
        return data

    }).catch(function (error) {
        console.warn(error);
    });

}





