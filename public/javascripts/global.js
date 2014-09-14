// Userlist data array for filling in info box
var userListData = [];

// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the user table on initial page load
    populateTable();
     // Username link click
    $('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);

     // Search Nearby link click
    $('#btnFindNB').on('click', showNearBy);

    // Add User button click
    $('#btnAddUser').on('click', addUser);

    // Delete User link click
    $('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);

    var map = L.map ('mapa', {
        center: [51.505, -0.09],
        zoom: 14
    });

    //r socket = io.connect(window.location.href);
    
    var dir = MQ.routing.directions();

    CustomRouteLayer = MQ.Routing.RouteLayer.extend({
    createStopMarker: function(location, stopNumber) {
        var custom_icon,
            marker;
 
        custom_icon = L.icon({
            iconUrl: 'http://www.mapquestapi.com/staticmap/geticon?uri=poi-red_1.png',
            iconSize: [20, 29],
            iconAnchor: [10, 29],
            popupAnchor: [0, -29]
        });
 
        marker = L.marker(location.latLng, { icon: custom_icon })
            .bindPopup(location.adminArea5 + ' ' + location.adminArea3)
            .openPopup()
            .addTo(map);
 
        return marker;
        }
    });

    var tiles = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

    map.addLayer(tiles);

   map.addLayer(new CustomRouteLayer({
    directions: dir,
    fitBounds: true,
    draggable: false,
    ribbonOptions: {
        draggable: false,
        ribbonDisplay: { color: '#CC0000', opacity: 0.3 },
        widths: [ 15, 15, 15, 15, 14, 13, 12, 12, 12, 11, 11, 11, 11, 12, 13, 14, 15 ]
        }
    }));

    map.locate({
        enableHightAccuracy: true
    });


    map.on('locationfound', onLocationFound);

    function onLocationFound(position){
        console.log(position);
        var mycoords = position.latlng;
        var  marker = L.marker([mycoords.lat, mycoords.lng]);
        map.addLayer(marker);
        marker.bindPopup('Estas en: '+mycoords.lat+' , '+mycoords.lng).openPopup();
        //socket.emit('coords:me', {latlng: mycoords});

        dir.optimizedRoute({
        locations: [
            { latLng: { lat: mycoords.lat, lng: mycoords.lng } },
            { street: '935 pennsylvania ave', city: 'washington', state: 'dc' }
                    ]
            });
        map.panTo(new L.LatLng(mycoords.lat, mycoords.lng));
    }

});

// Functions =============================================================

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
            tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.username + '" title="Show Details">' + this.username + '</a></td>';
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

function showNearBy() {

    // Empty content string
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/usuarios/searchnearby', function( data ) {

// Stick our user data array into a userlist variable in the global object
    userListData = data;

        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.username + '" title="Show Details">' + this.username + '</a></td>';
            tableContent += '<td>' + this.email + '</td>';
            tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a></td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#userList table tbody').html(tableContent);
    });
};