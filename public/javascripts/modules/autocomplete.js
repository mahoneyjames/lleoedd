function autoComplete(input, latInput, lngInput,googleUrlInput, googlePlaceIdInput, postcodeInput, nameInput)
{
    console.log(googleUrlInput, googlePlaceIdInput, postcodeInput);
    if(!input) return;

    const dropdown = new google.maps.places.Autocomplete(input);
    dropdown.addListener('place_changed', () => {
        const place = dropdown.getPlace();
        console.log(place);
        latInput.value = place.geometry.location.lat();
        lngInput.value = place.geometry.location.lng();

        if(googleUrlInput)
            googleUrlInput.value=place.url;

        if(googlePlaceIdInput)
            googlePlaceIdInput.value=place.place_id;     
        if(place.name && nameInput && nameInput.value.length==0)
        {
            nameInput.value=place.name;
        }

        if(postcodeInput)
        {
            place.address_components.forEach((part)=>
            {
                if(part.long_name && part.types && part.types.length>0 && part.types[0]==="postal_code")
                {
                    postcodeInput.value = part.long_name;                    
                }
            });

        }  

const helperDiv =$('.googleAutocompleteResults'); 
        if(helperDiv)
        {
            const mapOptions = {
    center: {lat:51.590642, lng:-3.000698},
    zoom: 2
};
console.log(helperDiv)
            //alert("found autocomplete helper div!");
            const map = new google.maps.Map(helperDiv, mapOptions);
            helperDiv.show();
        }

  
    });

    input.on('keydown', (e) => {
        if(e.keyCode===13) e.preventDefault();
    })



}

export default autoComplete;