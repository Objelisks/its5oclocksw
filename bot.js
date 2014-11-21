var debug = process.argv[2] === 'debug';
var plus = parseInt(process.argv[3]);
var moment = require('moment-timezone');
var fs = require('fs');
var Twitter = require('twitter-js-client');
var twitter = new Twitter.Twitter(JSON.parse(fs.readFileSync('./creds.json')));

var getRandFrom = function(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
};

var getFiveOClockTimezones = function() {
    var timezones = JSON.parse(fs.readFileSync('data/timezones.json', {encoding:'utf8'}));
    var fiveTimeZones = [];
    var now = moment().utc();
    if(!isNaN(plus)) now = now.add(plus, 'minute');
    var roundedNow = now.minute(Math.floor(now.minute() / 15) * 15).startOf('minute');
    
    return timezones.filter(function(timezone) { 
        var localTime = roundedNow.tz(timezone).format('HH:mm');
        return localTime === '17:00';
    });
};

var getRandomCityAtFiveOClock = function() {
    var timezones = getFiveOClockTimezones();
    if(debug) console.log('timezones: ', timezones);
    
    var citiesInTimezone = [];
    timezones.forEach(function(tz) {
        citiesInTimezone = citiesInTimezone.concat(JSON.parse(fs.readFileSync('data/cities/' + tz.replace(/\//g, '.'), {encoding: 'utf8'})));
    });
    
    if(debug) console.log('found cities: ', citiesInTimezone.length);
    if(citiesInTimezone.length === 0) return undefined;

    var theCity = getRandFrom(citiesInTimezone);
    if(debug) console.log('chose city: ', theCity['city']);
    
    return theCity;
};

var getRandomTemplate = function(city) {
    var templates = JSON.parse(fs.readFileSync('data/templates.json', {encoding:'utf8'}));

    var template = getRandFrom(templates);
    if(city['admin'] && Math.random() > 0.5) {
        city['city'] += ', ' + city['admin'];
    }
    template = template.replace(/\[(.+?)\]/g, function(match, key) { return city[key]; });
    return template;
};

var constructTweet = function() {
    var city = getRandomCityAtFiveOClock();
    if(!city) {
        return undefined;
    } else {
        return getRandomTemplate(city);
    }
};

var tweet = function() {
    console.log('attempting to tweet');
    var tweetMessage = constructTweet();
    if(!tweetMessage) {
        console.log('no tweet');
        return;
    }

    if(debug) {
        console.log('DEBUG', tweetMessage);
    } else {
        twitter.postTweet({
            'status': tweetMessage
        }, function(err) {
            if(err) console.log('ERROR', err);
        }, function(success) {
            console.log('successfully posted tweet:', tweetMessage);
        });
    }
};

var timeUntilOnTheHour = moment().endOf('hour').diff(moment());
console.log('waiting', timeUntilOnTheHour, 'milliseconds');
setTimeout(function() {
    tweet();
    setInterval(tweet, 1000 * 60 * 15);
}, debug ? 0 : timeUntilOnTheHour);
