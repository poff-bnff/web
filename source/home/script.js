var albums_url = 'http://192.241.148.13/albums'
fetch(albums_url)
    .then(res => res.json())
    .then((albums) => {
        var album_template = document.getElementById('flickr-album-template')
        var DOM_albums = document.getElementById('flickr-albums')
        for (album of albums) {
            var DOM_album = album_template.cloneNode(true)
            DOM_album.style.display = 'grid'
            // DOM_album.id = album.url
            DOM_album.setAttribute('href', `HTTPS://${album.url}`)
            DOM_album.childNodes[0].childNodes[0].setAttribute('src', `https://${album.pic}`)
            DOM_album.childNodes[0].style.display = 'grid'
            DOM_album.childNodes[0].childNodes[1].childNodes[0].childNodes[0].innerHTML = album.title
            console.log(DOM_album.childNodes);

            DOM_albums.appendChild(DOM_album)
        }
    })
    .catch(err => { throw err })
