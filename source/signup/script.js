if (localStorage.getItem("ACCESS_TOKEN")) {
    loadUserInfo();
}

async function loadUserInfo() {
    let response = await fetch(`https://api.poff.ee/profile`, {
        method: "GET",
        headers: {
            Authorization: "Bearer " + localStorage.getItem("ACCESS_TOKEN"),
        },
    });
    let userProfile = await response.json();

    console.log(userProfile)
    if (userProfile.address) {
        let address = userProfile.address.split(", ")
        let riik = address[0]
        let linn = address[1]
        console.log(riik)
        console.log(linn)
        city.value = linn
        country.value = riik
    }

    firstName.value = userProfile.name;
    lastName.value = userProfile.family_name;
    email.value = userProfile.email;
    gender.value = userProfile.gender;
    if (userProfile.phone_number) {
        phoneNr.value = userProfile.phone_number;
    }
    dob.value = userProfile.birthdate;

    pswds.style.display = 'none'

    // linn ja riik lahuta aadressist


}



async function sendNewUser() {
    //siin panen kokku listi objektidest mida saata cognitosse
    //Kas järjekord on oluline?
    //kas Name-id on kõik õiged?
    let userToSend = [
        { Name: "picture", Value: imgPreview.src },
        { Name: "email", Value: email.value },
        { Name: "name", Value: firstName.value },
        { Name: "family_name", Value: lastName.value },
        { Name: "gender", Value: gender.value },
        { Name: "birthdate", Value: dob.value },
        { Name: "phone_number", Value: phoneNr.value },
        { Name: "address", Value: `${country.value}, ${city.value}` },
        { Name: "password", Value: psw.value }
    ];

    console.log(userToSend);

    let response = await fetch(`https://api.poff.ee/profile`, {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN')},
            body: JSON.stringify(userToSend)
        });
        response = await response.json()

     console.log(userProfile)
    if (response.UserConfirmed === true)
    console.log('user confirmed');
    window.open(`${pageURL}/login`, '_self')
}

const fileSelector = document.getElementById('profileImg');
fileSelector.addEventListener('change', (event) => {
  const fileList = event.target.files;
  //console.log(fileList);
  for (const file of fileList) {
    // Not supported in Safari for iOS.
    const name = file.name ? file.name : 'NOT SUPPORTED';
    // Not supported in Firefox for Android or Opera for Android.
    const type = file.type ? file.type : 'NOT SUPPORTED';
    // Unknown cross-browser support.
    const size = file.size ? file.size : 'NOT SUPPORTED';
    console.log({file, name, type, size});
    readImage(file)
  }
});

function readImage(file) {
    const output = document.getElementById("imgPreview");
    let error = document.getElementById("imgError");
    error.innerHTML =''
    // Check if the file is an image.
    if (file.type && file.type.indexOf('image') === -1) {
      console.log('File is not an image.', file.type, file);
      error.innerHTML ='File is not an image.'
      return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
      output.src = event.target.result;

    });
    reader.readAsDataURL(file);
}





// console.log(output.src)



