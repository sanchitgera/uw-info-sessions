'use strict'
var apiKey = process.env.UWAPI_KEY;
var uwapi = require('uwapi')(apiKey);
var path = require('path');
var icalendar = require('icalendar');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname+'/index.html'));
})

app.use(express.static(__dirname));

app.post('/sessions', function(req, res) {
  var year = req.body['input-year'];
  var term = req.body['input-term'];

  var code = '1' + year.slice(-2);

  if (term == 'winter') {
    code += '1';
  } else if (term == 'fall') {
    code += '9';
  } else {
    code += '5';
  }
  getSessions(code, function(ical) {
    res.send(ical.toString());
  });
});

app.listen(process.env.PORT || 8080, function() {
  console.log('Server running at http://127.0.0.1:8080/');
});

function filter(session) {
  return (session.employer && session.employer !== 'No info sessions' && session.building);
}

function getSessions(term, callback) {
  uwapi.termsInfosessions({
    term_id: term
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
      event.setDate(start, duration / 1000);

      event.setLocation(session.building.room);

      ical.addComponent(event);
    });

    callback(ical);

  });
}
