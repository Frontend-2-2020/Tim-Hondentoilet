import L from "leaflet";
import "leaflet/dist/leaflet.css";
import '../styles/index.scss';
import axios from "axios";
import * as geolib from 'geolib';

var currentLongitude;
var currentLatitude;
var coordinates;

var infodiv = document.querySelector(".info");

navigator.geolocation.watchPosition(success);

var map = L.map('map',{
    center: [51.0823559,3.5740602],
    zoom:10
});

var myIcon = L.icon({
    iconUrl: 'public/marker.png',
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40],
});

// L.marker([51.193125,3.2178435], {icon: myIcon}).addTo(map);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// L.marker([51.193125,3.2178435]).addTo(map);

axios.get("https://datatank.stad.gent/4/infrastructuur/hondenvoorzieningen.geojson")
.then(function(response){
        // console.log(response.data.coordinates);

        coordinates = response.data.coordinates; // ES6
        response.data.coordinates.forEach(element => {
            var distance = geolib.getDistance(
                {latitude: element[1], longitude: element[0]},
                {latitude: currentLatitude, longitude: currentLongitude}
                );
            element.longitude = element[0];
            element.latitude = element[1];
            element.distance = distance;
        });
        coordinates.sort(function(a,b){
            if(a.distance > b.distance){return 1;}
            if(a.distance < b.distance){return -1;}
            return 0;
        });
        console.log(coordinates);
        for(var i=0; i<coordinates.length; i++){
            coordinates[i].placeNumber = ("plek " + (i+1));
            
            if (i < 5){
                L.marker([coordinates[i].latitude,coordinates[i].longitude]).addTo(map);
                addplaceToOverview(coordinates[i]);
            } else {L.marker([coordinates[i].latitude,coordinates[i].longitude], {icon: myIcon}).addTo(map);}
        }
    });

// navigator.geolocation.getCurrentPosition(success);

function success(pos){
    const {latitude, longitude} = pos.coords;
    // console.log("latitude = " + latitude + " & longitude = " + longitude);
    // console.log(`latitude = ${latitude} & longitude = ${longitude}`);
    currentLatitude = latitude;
    currentLongitude = longitude;
    L.marker([latitude,longitude]).addTo(map);
    map.panTo(new L.LatLng(latitude, longitude));
}

function addplaceToOverview(place){
    console.log(place);
    infodiv.innerHTML +=
    `<div class="infoeElement">
      <h2>${place.placeNumber}</h2>
      <div class="afstandsinfo">
        [${place.longitude},${place.latitude}]<br>
        ${place.distance} meter van je vandaan
      </div>
    </div>`;

}