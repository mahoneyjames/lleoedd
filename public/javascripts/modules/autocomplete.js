function autoComplete(input, latInput, lngInput,googleUrlInput)
{
    console.log(input, latInput, lngInput);
    if(!input) return;

    const dropdown = new google.maps.places.Autocomplete(input);
    dropdown.addListener('place_changed', () => {
        const place = dropdown.getPlace();
        console.log(place);
        latInput.value = place.geometry.location.lat();
        lngInput.value = place.geometry.location.lng();

        if(googleUrlInput)
            googleUrlInput.value=place.url;
    });

    input.on('keydown', (e) => {
        if(e.keyCode===13) e.preventDefault();
    })

}

export default autoComplete;