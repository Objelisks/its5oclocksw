var fs = require('graceful-fs');

var printErr = function(label) {
    return function(err) {
        if(err) console.log(label + ': ', err);
    };
};

var processedCount = 0;
var mapping = {};

console.log('reading admin file...');
var adminfile = fs.readFileSync('./data/admin1CodesASCII.txt', {encoding: 'utf8'});
var admins = {};
adminfile.split('\n').forEach(function(line) {
    var columns = line.split('\t');
    admins[columns[0]] = columns;
});

console.log('reading country file...');
var countryfile = fs.readFileSync('./data/countryInfo.txt', {encoding: 'utf8'});
var countries = {};
countryfile.split('\n').forEach(function(line) {
    if(line.charAt(0) === '#') return;
    var columns = line.split('\t');
    countries[columns[0]] = columns;
});

console.log('reading cities file...');

var file = fs.readFile('./data/cities1000.txt', {encoding: 'utf8'}, function(err, data) {
    if(err) printErr('reading file')(err);
    var cities = data.split('\n');
    console.log('found ' + cities.length + ' cities');
    cities.forEach(function(cityLine) {
        if(cityLine === "") return;
        var columns = cityLine.split('\t');

        var admin = admins[columns[8] + '.' + columns[10]];

        var data = {
            'city' : columns[1],
            'admin' : admin === undefined ? null : admin[1],
            'country' : countries[columns[8]][4],
            'timezone' : columns[17],
            'population' : columns[14]
        };

        var timezone = columns[17];
        if(timezone === undefined) console.log(cityLine + ' does not have a timezone');
        if(!(mapping[timezone])) {
            mapping[timezone] = [];
        }
        mapping[timezone].push(data);
    });
    Object.keys(mapping).forEach(function(timezone) {
        fs.writeFile('./data/cities/' + timezone.replace(/\//g, '.'),
                JSON.stringify(mapping[timezone]), function(err) {
            if(err) printErr('appending file')(err);
            processedCount += 1;
            if(processedCount % 1000 === 0) {
                console.log(processedCount, 'cities processed');
            }
        });
    });
});
