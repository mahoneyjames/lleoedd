import axios from 'axios';
import { $} from './bling';

const mapOptions = {
    center: {lat:51.590642, lng:-3.000698},
    zoom: 2
}; 

function loadPlaces(map, lat=51.590642, lng = -3.000698)
{
    axios.get(`/api/places/near?lat=${lat}&lng=${lng}`)
        .then(res=>{
            const places = res.data;
            if(!places.length)
            {
                //alert("no places found");
                return;
            }

            //create a bounds
            const bounds = new google.maps.LatLngBounds();
            const infoWindow = new google.maps.InfoWindow();

            const markers = places.map(place=>{
                const [placeLng, placeLat] = place.location.coordinates;
                //console.log(placeLng, placeLat);
                const position = { lat: placeLat, lng: placeLng};
                bounds.extend(position);
                const marker = new google.maps.Marker({map,position});
                marker.place = place;
                return marker;                
            });

            //when someone clicks on a marker, show details
            markers.forEach(marker => marker.addListener('click', function(){
                const html = `
                    <div class="popup">
                        <a href="/place/${this.place.slug}">                            
                            <h1>${this.place.name}</h1>
                        </a>
                        <p>${this.place.summary}</p>                        
                    </div>`;
                infoWindow.setContent(html);
                infoWindow.open(map, marker);
            }));

            //zoom the map to fit all the marker perfectly
            map.setCenter(bounds.getCenter());
            map.fitBounds(bounds);  
            




        })
};

function makeMap(mapDiv){
    if(!mapDiv) return;

    //make our map
    const map = new google.maps.Map(mapDiv, mapOptions);
    loadPlaces(map);
    const input = $('[name="geolocate"]');
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.addListener('place_changed', () =>{
        const place = autocomplete.getPlace();
        loadPlaces(map, place.geometry.location.lat(), place.geometry.location.lng());
    });
};

export default makeMap;

//navigator.geolocation.getCurrentPosition - javascript 30