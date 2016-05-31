var infoHold = {
	
	recentSearch: [],
	dataBaseRef: new Firebase('https://sound-splash.firebaseio.com/searches'),



	initMap: function(){

	var mapDiv = document.getElementById('googleMapsBox');

	var map = new google.maps.Map(mapDiv, {

		center: {lat: 27.6648, lng: -81.5158},
		zoom: 7
	})},

	noArtistError: function(){

	$('#errNoArtist').dialog({
		buttons: {'OK': function(){$(this).dialog('close');}},
		resizeable: false,
		modal: true,
		draggable: false
	})},

	letterCaps: function(str){
				var output = str;
				output = output.toLowerCase().replace(/\b[a-z]/g, function(letter) {
				return letter.toUpperCase();
				});
				str = output;
				return str;
	},

	ytApi: function(input){
		var ytUrl =  "https://www.googleapis.com/youtube/v3/search?part=snippet&kind=playlist&maxResults=1&q=" + input + "&type=video&videoCaption=closedCaption&videoCategoryId=10&key=AIzaSyAzU3_r7MMhIb1Hrp6V79ilLOc9nASDhc0";

		$.ajax({
			url: ytUrl,
			method: 'GET'

		}).done(function(response){
		
			var videoid = response.items[0].id.videoId;

			href = "https://www.youtube.com/watch?v=" + videoid;

			var newA = $('<a>');
			newA.attr({
				'href': href,
				'target': 'window'
				});
			newA.html($("<img src=\"assets/images/youtubegrey1a.png\">"));

			$('#youTubeBox').html(newA);


		});
	},

	eventsApi: function(input){
		var eventsAPI = "https://api.bandsintown.com/artists/" + input + "/events.json?api_version=2.0&app_id=sound_splash";

		$.ajax({ //bandsintown api
			url: eventsAPI,
			method: 'GET',
			dataType: 'jsonp'

		}).done(function(retrieved){
			// for adding marks to map
			function addMarker(mark){

				var pointer = new google.maps.Marker({
					position: {lat: mark.venue.latitude, lng: mark.venue.longitude},
					map: map,
					title: mark.venue.name
				});

				var eventInfo = new google.maps.InfoWindow({

					content: content
				});

				google.maps.event.addListener(pointer, 'mouseover', function(){

					eventInfo.open(pointer.get('map'), pointer);

				});

				google.maps.event.addListener(pointer, 'mouseout', function(){

					eventInfo.close(pointer.get('map', pointer));
				});

			}


			if(retrieved == null || retrieved == ""){

				noArtistError();

			} else {

				$('#main').hide();
				$('#pg2').show();
			}

			var artistImg = $('<img>').attr('src', retrieved[0].artists[0].thumb_url);
			$('#artistPic').html(artistImg);

			var map = new google.maps.Map(document.getElementById('googleMapsBox'),{

				center: {lat: retrieved[0].venue.latitude, lng: retrieved[0].venue.longitude},
				zoom: 4
			});

			for(var i=0; i < retrieved.length; i++){

				var eventLon = retrieved[i].venue.longitude;
				var eventLat = retrieved[i].venue.latitude;

				var content = "<h5>" + retrieved[i].venue.name + "</h5><p class=\"mapText\">" + retrieved[i].venue.city + ", " + retrieved[i].venue.region + "</p>";

				content+= "<p class=\"mapText\">"+ retrieved[i].formatted_datetime +"</p>";

				addMarker(retrieved[i]);

			}
			// displays ticket salses
				if(retrieved.length > 10){

					for (var i = 0; i < 10; i++){
						var anchor = $('<a>');
						var para = $('<p>');
						anchor.attr({
							'href' : retrieved[i].ticket_url,
							'target': 'window' 
						});
						para.addClass('ticketLinks')
						anchor.html(retrieved[i].title);
						para.html(anchor);
						$(wikiBody).append(para);
					}

				}
				else if(retrieved.length < 10){

					for(var i = 0; i < retrieved.length; i++){
						var anchor = $('<a>');
						var para = $('<p>');
						anchor.attr({
							'href' : retrieved[i].ticket_url,
							'target': 'window' 
						});
						para.addClass('ticketLinks')
						anchor.html(retrieved[i].title);
						para.html(anchor);
						$(wikiBody).append(para);						

					}

				}
				// end of if/else statments for ticket sales display

		   });
		   

		},

		dbPush: function(dbInput){

			infoHold.dataBaseRef.push({
				name: dbInput
			});
		},

		recentSearchButtons: function(){

				// generates 5 buttons.
				var arrayIndex = 7;

				if(this.recentSearch.length > 8){
					this.recentSearch.splice(0, 1);
				}

				$('#contentBody').empty(); // << so it will always be 5 buttons.

				for(var i = 0; i < infoHold.recentSearch.length; i++){

					var daButton = $('<button>');
					daButton.addClass('btn btn-default recentButton'); 
					daButton.attr('data-name', this.recentSearch[arrayIndex]);
					daButton.html(this.recentSearch[arrayIndex]);
					$('#contentBody').append(daButton);
					arrayIndex--;

				}			

		},



};


$(document).ready(function(){


		$('#searchButton').on('click', function(){

				var userInput = $('#search').val().trim();
			// validation for input that is already in recently searched.
				for(var i = 0; i < infoHold.recentSearch.length; i++){

					if(userInput.toUpperCase() == infoHold.recentSearch[i].toUpperCase()){
						$('#search').val('');
						return false;
					}
				}
			// validation for the case that user uses empty string
			if(userInput == ''){
				$('#search').val('');
				return false;
			}
			else{
			// code execution will only go forward if previous if statements are gone over.
				userInput = infoHold.letterCaps(userInput);
				console.log('test for letter caps: ' + userInput);

				infoHold.ytApi(userInput);

				infoHold.eventsApi(userInput);

				infoHold.dbPush(userInput);
			}
 		 $('#search').val('');
 		 return false;
		});
	// for database interaction with DOM when child is present.
		infoHold.dataBaseRef.limitToLast(8).on('child_added', function(dataSnap){

			var searchName = dataSnap.val();

			infoHold.recentSearch.push(searchName.name);

			if(infoHold.recentSearch.length >= 8){
				infoHold.recentSearchButtons();
			}


		});
	// for click of the recent searches buttons.
		$(document).on('click', '.recentButton', function(){
			
				var buttonName = $(this).attr('data-name');
				console.log('recent searches name test: ' + buttonName);

				infoHold.ytApi(buttonName);

				infoHold.eventsApi(buttonName);

		})


});














