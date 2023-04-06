#!/bin/sh
q=$1
key=`cat openweather.key`
url="https://api.openweathermap.org/geo/1.0/${q}&limit=5&appid=${key}"
echo $url
curl "$url"
