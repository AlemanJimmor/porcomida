// Userlist data array for filling in info box
var userListData = [];
var latitude;
var longitude;

// DOM Ready =============================================================
$(document).ready(function() {

    var idRestaurant = window.location.href.split('/')[4];
    console.log(idRestaurant);
     // Username link click
    $('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);

    //$('.expander').simpleexpand();
    
    // Empty content string
    var tableContent = '';

    // Verify checkboxes
    var filtros = {
        'idSearch': idRestaurant
    };

    // jQuery AJAX calls for JSON
    $.ajax({
            type: 'POST',
            data: filtros,
            url: '/usuarios/restaurants',
            dataType: 'JSON'
            }).done(function( data ) {
                    // Stick our user data array into a userlist variable in the global object
                    userListData = data;
                    console.log(userListData);

                    // For each item in our JSON, add a table row and cells to the content string
        
                    search = JSON.search(userListData, '//BUSSINESS');
                    console.log(search);
                    searchInfo = JSON.search(userListData, '//INFO');
                    menuList = JSON.search(userListData, '//MENU');
                    console.log(menuList.length);

                    for (var i = menuList.length - 1; i >= 0; i--) {

                        $('#nameTienda span').text(search[0].NAME);
                        $('#descriptionTienda').text(search[0].DESCRIPTION);
                        $('#descriptionTienda span').text(search[0].INTRO);
                        $('#msjTienda span').text(searchInfo[0].SALUDO);
                        $('#rankMenu a').text(search[0].RANK);

                        tableContent += '<tbody>';
                            tableContent += '<tr>';
                                tableContent += '<td ><p id="menuName">' + menuList[i].NAME + '</p><img src="../images/img_menu1.png"></div></td>';
                                tableContent += '<td rowspan= "3">' + menuList[i].PRECI0 + '</td>';
                            tableContent += '</tr>';
                        tableContent += '</tbody>';
                    };
                    // Inject the whole content string into our existing HTML table
                    $('#menuList table tbody').html(tableContent);
        });
    
    //End show menu fuction

    var geocoder;
    geocoder = new google.maps.Geocoder();

    var map = L.map ('ubica', {
        center: [51.505, -0.09],
        zoom: 14
    });

    var tiles = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

    map.addLayer(tiles);
    map.locate({
        enableHightAccuracy: false
    });

    map.on('locationfound', onLocationFound);

    function onLocationFound(position){
        console.log(position);
        var mycoords = position.latlng;
        var  marker = L.marker([mycoords.lat, mycoords.lng]);
        map.addLayer(marker);
        latitude = mycoords.lat;
        longitude = mycoords.lng;
        marker.bindPopup('Tu ubicacion: '+mycoords.lat+' , '+mycoords.lng).openPopup();
        map.panTo(new L.LatLng(mycoords.lat, mycoords.lng));
        codeLatLng(mycoords.lat, mycoords.lng);
    }

    function initialize() {
        var input = /** @type {HTMLInputElement} */(document.getElementById('pac-input'));
        var autocomplete = new google.maps.places.Autocomplete(input);
        google.maps.event.addListener(autocomplete, 'place_changed', function() {
            var place = autocomplete.getPlace();
            if (!place.geometry) {
                return;
            }
            $('#locationText').text(place.geometry.location);
            console.log(place.geometry.location,"LOCATIONS")
            // codeLatLng(place.geometry.location.k,place.geometry.location.B);
            var address = '';
            if (place.address_components) {
                address = [
                    (place.address_components[0] && place.address_components[0].short_name || ''),
                    (place.address_components[1] && place.address_components[1].short_name || ''),
                    (place.address_components[2] && place.address_components[2].short_name || '')
                ].join(' ');
            }
        });
    }

    function codeLatLng(lat, lng) {
        var latlng = new google.maps.LatLng(lat, lng);
        geocoder.geocode({'latLng': latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[3]) {
                    $('#pac-input').val(results[3].formatted_address);
                    
                } else {
                    alert('No results found');
                }
            } else {
                alert('Geocoder failed due to: ' + status);
            }
            $('#direc').text(results[0].formatted_address);
        });
    }
    google.maps.event.addDomListener(window, 'load', initialize);

    function getID(){
    }
});

// Show User Info
function showUserInfo(event) {

    // Prevent Link from Firing
    event.preventDefault();

    // Retrieve username from link rel attribute
    var thisUserName = $(this).attr('rel');

    // Get Index of object based on id value
    var arrayPosition = userListData.map(function(arrayItem) { return arrayItem.username; }).indexOf(thisUserName);

    // Get our User Object
    var thisUserObject = userListData[arrayPosition];

    //Populate Info Box
    $('#userInfoName').text(thisUserObject.fullname);
    $('#userInfoAge').text(thisUserObject.age);
    $('#userInfoGender').text(thisUserObject.gender);
    $('#userInfoLocation').text(thisUserObject.loc);

};