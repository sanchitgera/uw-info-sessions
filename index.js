'use strict'

var apiKey = process.env.UWAPI_KEY;
var uwapi = require('uwapi')(apiKey);
var icalendar = require('icalendar');
var fs = require('fs');

function filter(session) {
  return (session.employer && session.employer !== 'No info sessions' && session.location);
}
uwapi.termsInfosessions({
  term_id: '1159'
}).then(function(res, err) {

  var filtered = res.filter(filter);

  var ical = new icalendar.iCalendar();
  filtered.forEach(function(session) {
    var event = new icalendar.VEvent(session.id);
    event.setSummary(session.employer);

    var date = Date.parse(session.date);
    var start = new Date(session.date + ' ' + session.start_time);
    var end = new Date(session.date + ' ' + session.end_time);
    var duration = (Date.parse(end) - Date.parse(start));
    console.log(duration);
    event.setDate(start, duration/1000);

    event.setLocation(session.location);

    ical.addComponent(event);
  });

  fs.writeFile('./test.ics', ical.toString(), function(err) {
    if (err) {
      console.log(err);
    }
  })

});
