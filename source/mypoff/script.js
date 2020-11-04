

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

        var pass_template = document.getElementById('template_' + my_pass.categoryId)
        var my_pass_element = pass_template.cloneNode(true)

        for (const childNode of my_pass_element.childNodes) {
            if(childNode.className === 'passCode')
                childNode.innerHTML = my_pass.code
        }

        for (const childNode of my_pass_element.childNodes) {
            if(childNode.className === 'fullName')
                childNode.innerHTML = userProfile.name + ' ' + userProfile.family_name
        }

        for (const childNode of my_pass_element.childNodes) {
            if(childNode.className === 'profilePic')
                childNode.setAttribute('src', userProfile.picture)
        }

        my_pass_element.setAttribute('ix', ix)
        my_pass_element.style.display = 'block'

        my_passes_element.appendChild(my_pass_element)

        for (const childNode of my_pass_element.childNodes) {
            const qr_id = 'QR' + my_pass.code;
            if(childNode.className === 'qrCode') {
                childNode.id = qr_id
                var qrcode = new QRCode(qr_id)
                qrcode.makeCode(my_pass.code)
            }
        }
    }
}
