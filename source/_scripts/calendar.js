function calendarfile(id) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/calendar;charset=utf-8,' + document.getElementById('cal_' + id).innerText);
    // data:text/calendar;charset=utf-8
    element.setAttribute('download', 'IndustryEvent_' + id + '.ics');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}