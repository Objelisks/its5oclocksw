@its5oclocksw twitter bot
==

every hour (or timezone hour offset as a proportional random chance) the bot tweets the name of a city in which it is currently 5 o clock.

also tags the tweet as being in that city if that is possible
also changes the timezone in its settings if that is possible

It is surprisingly difficult to get a mapping from timezone to cities in that timezone (even tz->country->city)
This is because it is a useless mapping. Nobody wants this information.

data comes from:
GeoNames Gazetteer extract files
http://download.geonames.org/export/dump/

Which is licensed under a Creative Commons Attribution 3.0 License, see http://creativecommons.org/licenses/by/3.0/


future upgrades
===

find a city dweller adjective mapping for as many cities as possible and add some more templates for that.
incorporate some more city, region, country information
templates with multiple cities
templates that are aware of dst
