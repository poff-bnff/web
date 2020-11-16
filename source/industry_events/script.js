const selectedDate = document.getElementById('selected_date');

const date_bf_2 = document.getElementById('date_bf_2');
const date_bf_1 = document.getElementById('date_bf_1');
const date_af_1 = document.getElementById('date_af_1');
const date_af_2 = document.getElementById('date_af_2');


let today = new Date()


function toggleDate (updown, days) {

    if (updown === '+') {
        today.setDate(today.getDate()+days)
    } else if (updown === '-') {
        today.setDate(today.getDate()-days)
    }

        let newDate = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        selectedDate.innerHTML = newDate

    date_bf_2.innerHTML = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+(today.getDate()-2);
    date_bf_1.innerHTML = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+(today.getDate()-1);
    date_af_1.innerHTML = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+(today.getDate()+1);
    date_af_2.innerHTML = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+(today.getDate()+2);

    toggleCards()
}

let cards = document.querySelectorAll('[class="card_film"]')

function toggleCards() {
    cards.forEach(card => {

        let eventStart = new Date(card.id)
        let eventDate = eventStart.getFullYear()+'-'+(eventStart.getMonth()+1)+'-'+eventStart.getDate();
        if (eventDate === selectedDate.innerHTML) {
            card.style.display = "grid"
        } else {
            card.style.display = "none"
        }

    })
}

date_bf_2.addEventListener('click', e => { toggleDate('-', 2) } )
date_bf_1.addEventListener('click', e => { toggleDate('-', 1) } )
date_af_1.addEventListener('click', e => { toggleDate('+', 1) } )
date_af_2.addEventListener('click', e => { toggleDate('+', 2) } )

// filterFunc = function (iEvent) {
//     let eventStart = new Date(iEvent.startTime)
//     let eventDate = eventStart.getFullYear()+'-'+(eventStart.getMonth()+1)+'-'+eventStart.getDate();
//     if (eventDate === date) {
//         console.log('DA ', date, eventDate)

//         return true
//     } else {
//         return false
//     }
// }

toggleDate()

function calendarfile(id) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/calendar;charset=utf-8,' + encodeURIComponent(document.getElementById(`cal_${id}`).value));
    element.setAttribute('download', `IndustryEvent_${id}.ics`);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }



  // Start file download.
//   download("hello.txt","This is the content of my file :)")
