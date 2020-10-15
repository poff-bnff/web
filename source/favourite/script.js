// async function removeFilm(movieId){
//     console.log('removeFilm')
//     console.log(movieId)

//     var response = await fetch(`https://api.poff.ee/favourite/${movieId}`, {
//         method: 'DELETE',
//         headers: {
//             Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
//         }
//     });

//     let result = await response.json()
//     console.log(result.movieId);

//     if (movieId == result.movieId){
//         let filmCard = document.getElementById(result.movieId)
//         filmCard.style.display = 'none'

//     }
// }


