

// var qrcode = new QRCode("qrcode")

// function makeCode () {
// 	qrcode.makeCode('elText.value')
// }

// makeCode()


fetchMyPasses()

async function fetchMyPasses(){
    console.log('fetchMyPasses');
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + localStorage.getItem('ACCESS_TOKEN'));

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    var response = await fetch("https://api.poff.ee/product", requestOptions)

    var my_passes = await response.json();

    var my_passes_element = document.getElementById('my_passes')
    console.log(my_passes_element);
    var ix = 0
    for (my_pass of my_passes) {
        ix ++
        console.log(my_pass);

        var pass_template = document.getElementById('template_' + my_pass.categoryId)
        var my_pass_element = pass_template.cloneNode(true)

        my_pass_element.setAttribute('ix', ix)
        my_pass_element.style.display = 'block'

        my_passes_element.appendChild(my_pass_element)


    }
}
