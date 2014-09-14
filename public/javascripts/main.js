// Userlist data array for filling in info box
var userListData = [];
var latitude;
var longitude;
var sortDistance=0;
var sortOrder=0;
var sortRank=0;
var map='';
var marker = [];
var userPosition;
var idLoc = [];
var directionsDisplay;
var directionsService;
var changeLocation;
var userLocation;
var distanceOnmap=[];

// DOM Ready =============================================================
$(document).ready(function() {

    //SelectionChange for range
    $('#rangeDistance').change(function() {
        $('#txtRatioDistance').text($(this).val());
    });

    $('#rangePrice').change(function() {
        if ($(this).val()>100) {
            if ($(this).val()>200){
                $('#txtRatioPrice').text("$$$");
            };
            if ($(this).val()<200){
                $('#txtRatioPrice').text("$$");
            };
        };
        if ($(this).val()<100){
            $('#txtRatioPrice').text("$");
        };
    });

    $('#filterResults button').click(function() {
        $('#filterResults button').removeClass('active')
        $(this).addClass('active')
    })

    var d = new Date();
    console.log(d);
    console.log(d.getHours());

     // Username link click
    $('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);

     // Search Nearby link click
    $('#btnFindNB').on('click', showNearBy);

    // Add User button click
    $('#btnAddUser').on('click', addUser);

    // Delete User link click
    $('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);

    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setPanel(document.getElementById('directions-panel'));
    

    function initialize() {
        var input = /** @type {HTMLInputElement} */(document.getElementById('pac-input'));
        var autocomplete = new google.maps.places.Autocomplete(input);
        google.maps.event.addListener(autocomplete, 'place_changed', function() {
            var place = autocomplete.getPlace();
            if (!place.geometry) {
                return;
            }
            $('#locationText').text(place.geometry.location);
            console.log(place.geometry.location,"LOCATIONS");
            codeLatLng(place.geometry.location.k,place.geometry.location.B);
            userChangeLocation(place.geometry.location.k,place.geometry.location.B);
            var address = '';
            if (place.address_components) {
                address = [
                    (place.address_components[0] && place.address_components[0].short_name || ''),
                    (place.address_components[1] && place.address_components[1].short_name || ''),
                    (place.address_components[2] && place.address_components[2].short_name || '')
                ].join(' ');
            }
        });
        mapa();

        //directionsDisplay.setMap(map);

        var control = document.getElementById('control');
        control.style.display = 'block';
        };

        google.maps.event.addDomListener(window, 'load', initialize);

});

function calcRoute(destiny) {
  var start = changeLocation;
  console.log(start);
  var end = new google.maps.LatLng(destiny.lat, destiny.lng);
  console.log(end);
  var request = {
    origin: start,
    destination: end,
    travelMode: google.maps.TravelMode.DRIVING
  };
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
      var distance=response.routes[0].legs[0].distance.text;
      distanceOnmap.push(distance);
      console.log(response.routes[0].legs[0].duration.text);
      console.log(response.routes[0].legs[0].distance.text);
      console.log(response.routes[0].legs[0].steps);
    };
  });
};

function userChangeLocation(lat, lng) {
    map.removeLayer(userLocation);
        var userIcon = L.icon({
            iconUrl: '../images/marcador_usuario.png',
            shadowUrl: '../images/sombra_marcadores.png',

            iconSize:     [53, 42], // size of the icon
            shadowSize:   [51, 43], // size of the shadow
            iconAnchor:   [16, 43], // point of the icon which will correspond to marker's location
            shadowAnchor: [8, 42],  // the same for the shadow
            popupAnchor:  [0, -42] // point from which the popup should open relative to the iconAnchor
        });
        userLocation = L.marker([lat, lng], {icon: userIcon}).addTo(map).bindPopup('Tu ubicacion: <br>'+lat+' , '+lng).openPopup();
        latitude = lat;
        longitude = lng;
        showSuggestions();
        map.panTo(new L.LatLng(lat, lng));
}

function locateusersonmap(loclatlng, nombreRest){

        var restIcon = L.icon({
            iconUrl: '../images/marcador_azul.png',
            shadowUrl: '../images/sombra_marcadores.png',

            iconSize:     [53, 42], // size of the icon
            shadowSize:   [51, 43], // size of the shadow
            iconAnchor:   [14, 43], // point of the icon which will correspond to marker's location
            shadowAnchor: [8, 42],  // the same for the shadow
            popupAnchor:  [0, -42] // point from which the popup should open relative to the iconAnchor
        });
        var  LamMarker = L.marker([loclatlng.lat, loclatlng.lng], {icon: restIcon}).addTo(map).bindPopup(nombreRest);
        marker.push(LamMarker);
        map.setZoom(12);
    };

function showOnmap(val){
    valor = Number(val);
    marker[valor].openPopup();
    map.panTo(new L.LatLng(idLoc[val].lat, idLoc[val].lng));
    var pointA = new L.LatLng(28.635308, 77.22496);
    var pointB = new L.LatLng(28.984461, 77.70641);
    var pointList = [pointA, pointB];

    var firstpolyline = new L.Polyline(pointList, {
    color: 'red',
    weight: 3,
    opacity: 0.5,
    smoothFactor: 1
    });
    for (var i = 0; i < idLoc.length; i++) {
        $('#'+i).removeClass('active');
    };
    $('#'+val).addClass('active');
    map.addLayer(firstpolyline);
};

function mapa(){
    map = L.map ('ubica', {
        center: [51.505, -0.09],
        zoom: 14
    });
    var tiles = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    
    map.addLayer(tiles);
    map.locate({
        enableHightAccuracy: false
    });    

    map.on('locationfound', onLocationFound);
};

    function onLocationFound(position){
        var mycoords = position.latlng;
        //var  LamMarker = L.marker([mycoords.lat, mycoords.lng]);
        //marker.push(LamMarker);
        //map.addLayer(LamMarker);
        latitude = mycoords.lat;
        longitude = mycoords.lng;
        showSuggestions();
        var userIcon = L.icon({
            iconUrl: '../images/marcador_usuario.png',
            shadowUrl: '../images/sombra_marcadores.png',

            iconSize:     [53, 42], // size of the icon
            shadowSize:   [51, 43], // size of the shadow
            iconAnchor:   [16, 43], // point of the icon which will correspond to marker's location
            shadowAnchor: [8, 42],  // the same for the shadow
            popupAnchor:  [0, -42] // point from which the popup should open relative to the iconAnchor
        });
        userLocation = L.marker([mycoords.lat, mycoords.lng], {icon: userIcon}).addTo(map).bindPopup('Tu ubicacion: <br>'+mycoords.lat+' , '+mycoords.lng).openPopup();
        //L.marker.bindPopup('Tu ubicacion: '+mycoords.lat+' , '+mycoords.lng).openPopup();
        map.panTo(new L.LatLng(mycoords.lat, mycoords.lng));
        codeLatLng(mycoords.lat, mycoords.lng);
    };

    function codeLatLng(lat, lng) {
        var geocoder;
        geocoder = new google.maps.Geocoder();
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
            changeLocation=results[0].formatted_address.toString();
            $('#direc').text(results[0].formatted_address);
        });
    };





// Fill table with data
function populateTable() {

    // Empty content string
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/usuarios/userlist', function( data ) {

// Stick our user data array into a userlist variable in the global object
    userListData = data;

        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.username + '" title="Show Details">' +  + '</a></td>';
            tableContent += '<td>' + this.email + '</td>';
            tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a></td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#userList table tbody').html(tableContent);
    });
};

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

// Add User
function addUser(event) {
    event.preventDefault();

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
    $('#addUser input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });

    // Check and make sure errorCount's still at zero
    if(errorCount === 0) {

        // If it is, compile all user info into one object
        var newUser = {
            'username': $('#addUser fieldset input#inputUserName').val(),
            'email': $('#addUser fieldset input#inputUserEmail').val(),
            'fullname': $('#addUser fieldset input#inputUserFullname').val(),
            'age': $('#addUser fieldset input#inputUserAge').val(),
            'loc': $('#addUser fieldset input#inputUserLocation').val(),
            'gender': $('#addUser fieldset input#inputUserGender').val()
        }

        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'POST',
            data: newUser,
            url: '/usuarios/adduser',
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for successful (blank) response
            if (response.msg === '') {

                // Clear the form inputs
                $('#addUser fieldset input').val('');

                // Update the table
                populateTable();

            }
            else {

                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);

            }
        });
    }
    else {
        // If errorCount is more than 0, error out
        alert('Please fill in all fields');
        return false;
    }
};

// Delete User
function deleteUser(event) {

    event.preventDefault();

    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this user?');

    // Check and make sure the user confirmed
    if (confirmation === true) {

        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/usuarios/deleteuser/' + $(this).attr('rel')
        }).done(function( response ) {

            // Check for a successful (blank) response
            if (response.msg === '') {
            }
            else {
                alert('Error: ' + response.msg);
            }

            // Update the table
            populateTable();

        });

    }
    else {

        // If they said no to the confirm, do nothing
        return false;

    }

};

Array.prototype.count_value = function(){
var count = {};
for(var i = 0; i < this.length; i++){
if(!(this[i] in count))count[this[i]] = 0;
count[this[i]]++;
}
return count;
};

function sortbyDistance(){
        sortDistance = 1;
        sortOrder  = 0;
        sortRank = 0;
        showNearBy();
};

function sortbyOrder(){
if (sortOrder==1) {
        sortDistance = 0;
        sortOrder  = -1;
        sortRank = 0;
        showNearBy();    
    }
    else{
        sortDistance = 0;
        sortOrder  = 1;
        sortRank = 0;
        showNearBy();
    };
};

function sortbyRank(){
if (sortRank==1) {
        sortDistance = 0;
        sortOrder  = 0;
        sortRank = -1;
        showNearBy();    
    }
    else{
        sortDistance = 0;
        sortOrder  = 0;
        sortRank = 1;
        showNearBy();
    };

};

function showMenus(valor){
    val = valor;
    console.log(val);
    window.location.href = "/restaurants/" + val;
};

function showSuggestions() {
    var tableContent = '';
    var count=[''];

    var filtro2 = {
        'latitude':latitude,
        'longitude': longitude,
        'category': ''
    };
    console.log('inside to sugess');
    // ajax query for suggestions
    $.ajax({
            type: 'POST',
            data: filtro2,
            url: '/usuarios/suggestions',
            dataType: 'JSON'
            }).done(function( data ) {
                listOfSugges = data;
                sugges = JSON.search(listOfSugges, '//BUSSINESS/CATEGORY');
                var color=new Array("#626868", "#515f6c", "#999966", "#9ea8a8", "#b2bdbd", "#41485e", "#777777", "#eeeee6");
                count = sugges.count_value();
                count = sortObject(count).reverse();
                var cLength;
                (count.length>8) ? cLength=8 : cLength=count.length; 
                for (var i = 0; i < cLength; i++) {
                    var cat= count[i].key;
                    tableContent += '<td onclick="selecsugges(id)" id="'+count[i].key+'" style="background-color:'+color[i]+';"><div id="countSugges"><span>'+count[i].value+'</span></div>'+count[i].key+'<img src="./images/'+count[i].key+'.png"></td>';
                };
                   
                $('#suggestions table tbody').html(tableContent);
            });
};

function selecsugges(catid){
    var numbersug = 1;
    showNearBy(numbersug, catid);
};

function showNearBy(sug, categ) {

    console.log('suggestions: ',sug);
    console.log('suggestions> category: ',categ);

    // Empty content string
    var tableContent = '';
    var url;

    // Verify checkboxes
        var filtros = {
            'latitude':latitude,
            'longitude': longitude,
            'chkPickup': document.getElementById("chkPickup").checked ? 1: 0,
            'chkDelivery': document.getElementById("chkDelivery").checked ? 1: 0,
            'chkCredit': document.getElementById("chkCredit").checked ? 1: 0,
            'chkOpen': document.getElementById("chkOpen").checked ? 1: 0,
            'chkPromo': document.getElementById("chkPromo").checked ? 1: 0,
            'chkDistance': (document.getElementById("rangeDistance").value)/100,
            'chkPrice': document.getElementById("rangePrice").value,
            'txtSearch': document.getElementById("search-input").value,
            'sortDistance': sortDistance,
            'sortOrder': sortOrder,
            'sortRank': sortRank,
            'category': ''
        };
        url= '/usuarios/searchnearby';
    if (sug==1) {
        url= '/usuarios/suggestions';
        filtros = {
            'latitude':latitude,
            'longitude': longitude,
            'category': categ
        };
    };

    //All iconos on off

    var sourceCredit = '';
    var sourcePickup = '';
    var sourceCash = '';
    var sourcePromo = '';
    var sourceDelivery = '';
    for(i=0;i<marker.length;i++) {
    map.removeLayer(marker[i]);
    };
    marker = [];

    // jQuery AJAX calls for JSON
    $.ajax({
            type: 'POST',
            data: filtros,
            url: url,
            dataType: 'JSON'
            }).done(function( data ) {
                    // Stick our user data array into a userlist variable in the global object
                userListData = data;

                // For each item in our JSON, add a table row and cells to the content string
                var search = JSON.search(userListData, '//BUSSINESS');
                var searchP = JSON.search(userListData, '//BUSSINESS/DELIVERYPRICE');
                var searchM = JSON.search(userListData, '//MENU');

                if( ($('input:radio[name=per]:checked').val()) == 'restaurante' )
                {
                    for (var i = 0; i <= search.length - 1; i++) {

                        var sourceRank = './images/estrella_azul_vacia.png';
                        var sourceRank2 = './images/estrella_azul_vacia.png';
                        var sourceRank3 = './images/estrella_azul_vacia.png';
                        var sourceRank4 = './images/estrella_azul_vacia.png';
                        var sourceRank5 = './images/estrella_azul_vacia.png';

                        if ( search[i].CREDITCARD=='1') { sourceCredit = './images/visa.png'; };
                        if ( search[i].PICKUP=='1') { sourcePickup = './images/recojer.png'; };
                        if ( search[i].PAIDATHOME=='1') { sourceCash = './images/efectivo.png'; };
                        if ( search[i].PROMO=='1') { sourcePromo = './images/descuento.png'; };
                        if ( search[i].DELIVERY=='1') { sourceDelivery = './images/motito.png'; };
                        if ( search[i].RANK>='1') { sourceRank = './images/estrella_azul_llena.png'; };
                        if ( search[i].RANK>='2') { sourceRank2 = './images/estrella_azul_llena.png'; };
                        if ( search[i].RANK>='3') { sourceRank3 = './images/estrella_azul_llena.png'; };
                        if ( search[i].RANK>='4') { sourceRank4 = './images/estrella_azul_llena.png'; };
                        if ( search[i].RANK>='5') { sourceRank5 = './images/estrella_azul_llena.png'; };

                        locateusersonmap(userListData[i].loc, search[i].NAME);
                        idLoc[i]=userListData[i].loc;
                        console.log(idLoc[i]);

                        tableContent += '<tbody onclick="showOnmap(id)" id="'+i+'">';
                            tableContent += '<tr>';
                                tableContent += '<td rowspan="5"><img src="' + search[i].LOGOTIPO + '"></td>';
                                tableContent += '<td rowspan= "2" colspan="7"><p id="showtitle">' + search[i].NAME + '</p> <p>Distancia:'+userListData[i].dist+'</p></td>';
                                tableContent += '<td><button id="btnshowMenu" onclick="showMenus(value)" value="'+userListData[i]._id+'" >Ver el menu</button></td>';
                            tableContent += '</tr>';
                            tableContent += '<tr>';
                                tableContent += '<td id="showrank"><img src="'+sourceRank+'"><img src="'+sourceRank2+'"><img src="'+sourceRank3+'"><img src="'+sourceRank4+'"><img src="'+sourceRank5+'"></td>';
                            tableContent += '</tr>';
                            tableContent += '<tr>';
                                tableContent += '<td colspan="7" id="showcategory">' + search[i].CATEGORY + '</td>';
                                tableContent += '<td id="showoptions">ver opinones</td>';
                            tableContent += '</tr>';
                            tableContent += '<tr>';
                                tableContent += '<td colspan="7" id="showdescription">' + search[i].DESCRIPTION + '</td>';
                                tableContent += '<td></td>';
                            tableContent += '</tr>';
                            tableContent += '<tr>';
                                tableContent += '<td id="showcredit"><img src="'+sourceCredit+'"></td>';
                                tableContent += '<td id="showpickup"><img src="'+sourcePickup+'"></td>';
                                tableContent += '<td id="showbudget"><img src="'+sourceCash+'"></td>';
                                tableContent += '<td id="showpromo"><img src="'+sourcePromo+'"></td>';
                                tableContent += '<td id="showdelivery"><img src="'+sourceDelivery+'"></td>';
                                tableContent += '<td id="showminorder"> Pedido Minimo: ' + search[i].MINORDER + '</td>';
                                tableContent += '<td id="showdprice"> Entrega Gratuita: ' + searchP[i].PRICE + '</td>'
                                tableContent += '<td></td>';;
                            tableContent += '</tr>';
                        tableContent += '</tbody>';
                    };
                    // Inject the whole content string into our existing HTML table
                    $('#userList table tbody').html(tableContent);
                }
                else
                {
                    for (var i = 0; i <= search.length - 1; i++) {
                        if ( search[i].CREDITCARD=='1') { sourceCredit = './images/visa.png'; };
                        if ( search[i].PICKUP=='1') { sourcePickup = './images/recojer.png'; };
                        if ( search[i].PAIDATHOME=='1') { sourceCash = './images/efectivo.png'; };
                        if ( search[i].PROMO=='1') { sourcePromo = './images/descuento.png'; };
                        if ( search[i].DELIVERY=='1') { sourceDelivery = './images/motito.png'; };
                        var sourceRank = './images/estrella_azul_vacia.png';
                        var sourceRank2 = './images/estrella_azul_vacia.png';
                        var sourceRank3 = './images/estrella_azul_vacia.png';
                        var sourceRank4 = './images/estrella_azul_vacia.png';
                        var sourceRank5 = './images/estrella_azul_vacia.png';
                        if ( search[i].RANK>='1') { sourceRank = './images/estrella_azul_llena.png'; };
                        if ( search[i].RANK>='2') { sourceRank2 = './images/estrella_azul_llena.png'; };
                        if ( search[i].RANK>='3') { sourceRank3 = './images/estrella_azul_llena.png'; };
                        if ( search[i].RANK>='4') { sourceRank4 = './images/estrella_azul_llena.png'; };
                        if ( search[i].RANK>='5') { sourceRank5 = './images/estrella_azul_llena.png'; };

                        locateusersonmap(userListData[i].loc, search[i].NAME);
                        idLoc[i]=userListData[i].loc;

                            tableContent += '<tbody onclick="showOnmap(id)" id="'+i+'">';
                                tableContent += '<tr>';
                                    tableContent += '<td rowspan="5"><img src="' + search[i].LOGOTIPO + '"></td>';
                                    tableContent += '<td rowspan= "2" colspan="7" ><p id="showtitle">' + searchM[i].NAME + '</p></td>';
                                    tableContent += '<td><button id="btnshowMenu" onclick="showMenus(value)" value="'+userListData[i]._id+'" >Ver el menu</button></td>';
                                tableContent += '</tr>';
                                tableContent += '<tr>';
                                    tableContent += '<td id="showrank"><img src="'+sourceRank+'"><img src="'+sourceRank2+'"><img src="'+sourceRank3+'"><img src="'+sourceRank4+'"><img src="'+sourceRank5+'"></td>';
                                tableContent += '</tr>';
                                tableContent += '<tr>';
                                    tableContent += '<td colspan="7" id="showcategory">' + search[i].CATEGORY + '</td>';
                                    tableContent += '<td id="showoptions">ver opiniones</td>';
                                tableContent += '</tr>';
                                tableContent += '<tr>';
                                    tableContent += '<td colspan="7" id="showdescription">' + searchM[i].DESCRIPTION + '</a></td>';
                                    tableContent += '<td></td>';
                                tableContent += '</tr>';
                                tableContent += '<tr>';
                                    tableContent += '<td id="showcredit"><img src="'+sourceCredit+'"></td>';
                                    tableContent += '<td id="showpickup"><img src="'+sourcePickup+'"></td>';
                                    tableContent += '<td id="showbudget"><img src="'+sourceCash+'"></td>';
                                    tableContent += '<td id="showpromo"><img src="'+sourcePromo+'"></td>';
                                    tableContent += '<td id="showdelivery"><img src="'+sourceDelivery+'"></td>';
                                    tableContent += '<td id="showminorder"> Pedido Minimo: ' + search[i].MINORDER + '</td>';
                                    tableContent += '<td id="showdprice"> Entrega Gratuita: ' + searchP[i].PRICE + '</td>'
                                    tableContent += '<td></td>';;
                                tableContent += '</tr>';
                            tableContent += '</tbody>';

                    };
                    // Inject the whole content string into our existing HTML table
                    $('#userList table tbody').html(tableContent);
                }
        });
};

function sortObject(obj) {
    var arr = [];
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            arr.push({
                'key': prop,
                'value': obj[prop]
            });
        }
    }
    arr.sort(function(a, b) { return a.value - b.value; });
    //arr.sort(function(a, b) { a.value.toLowerCase().localeCompare(b.value.toLowerCase()); }); //use this to sort as strings
    return arr; // returns array
};