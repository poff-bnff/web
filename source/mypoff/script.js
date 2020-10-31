fetchMyPasses()

async function fetchMyPasses(){
    console.log('fetchMyPasses');
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer" + localStorage.getItem('ACCESS_TOKEN'));

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    let response = await fetch("https://api.poff.ee/product", requestOptions)

    console.log(await response.json());
}
