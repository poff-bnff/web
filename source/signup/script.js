let profileImg = document.getElementById("profileImg");
let email = document.getElementById("email");
let psw = document.getElementById("psw");
let psw2 = document.getElementById("psw2");
let firstName = document.getElementById("firstName");
let lastName = document.getElementById("lastName");
let gender = document.getElementById("gender");
let dob = document.getElementById("dob");
let phoneNr = document.getElementById("phoneNr");
let country = document.getElementById("countrySelection");
let city = document.getElementById("gds-cr-one");


function validateForm() {
    console.log("validate form");
    console.log(country.value);
    if (country.value == "") {
        console.log(country.value, " countryif");
        country.classList.add("invalid");
        country.value = "Elukoha riik";
    }
    if (firstName.value == "" || firstName.value.length < 2 || !isNaN(firstName.value)) {
        document.getElementById("firstName").classList.add("invalid");
    }
    if (lastName.value == "" || lastName.length < 2 || !isNaN(lastName.value)) {
        lastName.classList.add("invalid");
    }
    if (city.value == "") {
        city.classList.add("invalid");
    }
}



async function sendNewUser() {
    //siin panen kokku listi objektidest mida saata cognitosse
    //Kas järjekord on oluline?
    //kas Name-id on kõik õiged?
    let userToSend = [
        { Name: "picture", Value: imgPreview.src },
        { Name: "password", Value: psw.value },
        { Name: "email", Value: email.value },
        { Name: "name", Value: firstName.value },
        { Name: "family_name", Value: lastName.value },
        { Name: "gender", Value: gender.value },
        { Name: "birthdate", Value: dob.value },
        { Name: "phone_number", Value: phoneNr.value },
        { Name: "address", Value: `${country.value}, ${city.value}` },
    ];

    console.log(userToSend);

    let response = await fetch(`https://api.poff.ee/profile`, {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN')},
            body: JSON.stringify(userToSend)
        });
        userProfile = await response.json()
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



