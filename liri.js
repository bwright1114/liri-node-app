//variables to call the keys.js file which stores twitter access keys needed for the twitter option.
var keys = require('./keys.js');
var twitterKeys = keys.twitterKeys;

//setting up all the variables 
var fs = require('fs');
var prompt = require('prompt');
var Twitter = require('twitter');
var Spotify = require('spotify');
var request = require('request');
var colors = require("colors/safe");

//takes in the user input that calls the option you want.
var userInput = '';

// //takes in the user input for the spotify & movie options.
var userSelection = '';

//options that the user can choose from.
var myTweets = 'tweets';
var songs = 'spotify-this-song';
var movies = 'movie';
var doWhat = 'Do-What';

//prompt start
prompt.message = colors.rainbow("Type one of the following: tweets, spotify-this-song, movie, or Do-What");
prompt.delimiter = colors.magenta("\n");

prompt.start();


prompt.get({
	properties: {
		userInput: {
			description: colors.green('What do you choose?')
		}
	}
}, function(err, result){
	userInput = result.userInput;
	

	//if user enters tweets it will run the myTwitter function
	if(userInput == myTweets){
		myTwitter();
	} 
	//if the user enters spotify-this-song it will ask for the song you want to look, run the mySpotify function based on those results. If the user doesnt enter a song it defaults to "I Believe I Can Fly". 
	
	else if(userInput == songs){
		prompt.get({
			properties: {
				userSelection: {
					description: colors.green('What song do you want to look up?')
				}
			}
		}, function(err, result){

			if(result.userSelection === ""){
				userSelection = "I Believe I Can Fly";
			} else{
				userSelection = result.userSelection;
			}
			mySpotify(userSelection);
		});
	} 
	// if the user selects movie it will prompt what movie they want to look up and then it will get that information from omdb api if the prompt is left blank the function will default and look up Mr Nobody and reutrn that information
	else if(userInput == movies){
		prompt.get({
			properties: {
				userSelection: {
					description: colors.green('What movie do you want to look up?')
				}
			}
		}, function(err, result){
			if(result.userSelection === ""){
				userSelection = "Mr. Nobody";
			} else{
				userSelection = result.userSelection;
			}
			myMovies(userSelection);
		});
	//if the user chooses 'Do-What' then the function lastOption is run using the information from the random.txt file
	} else if(userInput == doWhat){
		lastOption();
	};
});



//twitter function
function myTwitter(){
	//this assigns the variable client to get the information from the twitterKeys variable set above so we can access twitters information
	var client = new Twitter({
		consumer_key: twitterKeys.consumer_key,
		consumer_secret: twitterKeys.consumer_secret,
		access_token_key: twitterKeys.access_token_key,
		access_token_secret: twitterKeys.access_token_secret,
	});
	//this sets the variable params to search the username UnicornCodes and return back the last 20 tweets.
	var params = {
		screen_name: 'UnicornCodes',
		count: '20',
		trim_user: false,
	}

	// this is the call to twitter
	client.get('statuses/user_timeline', params, function(error, timeline, response){
		if(!error){
			for(tweet in timeline){
				var tDate = new Date(timeline[tweet].created_at);

				console.log(colors.yellow("Tweet #: ") + (parseInt(tweet)+1) + " ");
				console.log(colors.yellow(tDate.toString().slice(0, 24) + " "));
				console.log(colors.yellow(timeline[tweet].text));
				console.log(colors.yellow("\n"));

				//append all of this information to the txt file(asynchronously!)
				fs.appendFile('log.txt', 'Tweet #: ' + (parseInt(tweet) + 1) + '\n', function(err) {
  				if (err) throw err;
				});
				fs.appendFileSync('log.txt', timeline[tweet].text + "\n", function(err) {
  				if (err) throw err;
				});
				fs.appendFileSync('log.txt', "\n", function(err) {
  				if (err) throw err;
				});

			}
		} 
	})

}

//spotify function
function mySpotify(userSelection){
	//this starts the search within spotify for the song and based on the userselection set in the if/else statement.
	Spotify.search({ 
		type: 'track', 
		query: userSelection
	}, function(err, data) {
	    if (err) throw err;
	    //this sets the variable music to get the initial information 
		var music = data.tracks.items;
		//this loops through the object that we get from spotify and then loops through each objects information to get what we need from spotify.(harderst loops I ever made!)
		    for (var i = 0; i<music.length; i++){
		    	for (b=0; b<music[i].artists.length; b++){
		    	    console.log(colors.red("Artist: ") + music[i].artists[b].name);
		        	console.log(colors.red("Song Name: ") + music[i].name);
		        	console.log(colors.red("Preview Link of the song from Spotify: ") + music[i].preview_url);
		        	console.log(colors.red("Album Name: ") + music[i].album.name + "\n");
		    	
		    	//this appends the data we receive from the spotify API to the log.txt file.(Asynchronously!)
		    		fs.appendFile('log.txt', "\n", function(err) {
  				if (err) throw err;
				});
			   	    fs.appendFile('log.txt', "Artist: " + music[i].artists[b].name + "\n", function(err) {
  				if (err) throw err;
				});
			       	fs.appendFile('log.txt', "Song Name: " + music[i].name + "\n", function(err) {
  				if (err) throw err;
				});
			       	fs.appendFile('log.txt', "Preview Link of the song from Spotify: " + music[i].preview_url + "\n", function(err) {
  				if (err) throw err;
				});
			       	fs.appendFile('log.txt', "Album Name: " + music[i].album.name + "\n", function(err) {
  				if (err) throw err;
				});
			       	fs.appendFile('log.txt', "\n", function(err) {
  				if (err) throw err;
				});
		    	}
		    }
	});
}

//movie omdb (Hardest Part to get to work..smh!)
function myMovies(type){
	//use request to access the omdb api and input the type variables I needed.
	request('http://www.omdbapi.com/?t='+type+'&y=&plot=short&tomatoes=true&r=json', function (error, response, body) {
		if(error) throw error;
		//JSON.parse the body of the result and store it in the variable json for easier access( great tip from Stack!)
		json = JSON.parse(body);
		
		console.log(colors.blue('Title: ') + json.Title);
		console.log(colors.blue('Year: ') + json.Year);
		console.log(colors.blue('Rated: ') + json.Rated);
		console.log(colors.blue('Country: ') + json.Country);
		console.log(colors.blue('Language: ') + json.Language);
		console.log(colors.blue('Director: ') + json.Director);
		console.log(colors.blue('Actors: ') + json.Actors);
		console.log(colors.blue('Plot: ') + json.Plot);
		console.log(colors.blue('imdbRating: ') + json.imdbRating);
		console.log(colors.blue('Rotten Tomatoes Rating: ') + json.tomatoRating);
		console.log(colors.blue('Rotten Tomatoes URL: ') + json.tomatoURL);

		//append the results to the log.txt file(Asynchronously!)
		fs.appendFile('log.txt', "\n", function(err) {
  				if (err) throw err;
				});
		fs.appendFileSync("log.txt", "\n" + "Title: " + json.Title + "\n", function(err) {
  				if (err) throw err;
				});
		fs.appendFileSync("log.txt", "Year: " + json.Year + "\n", function(err) {
  				if (err) throw err;
				});
		fs.appendFileSync("log.txt", "Rated: " + json.Rated + "\n", function(err) {
  				if (err) throw err;
				});
		fs.appendFileSync("log.txt", "Country: " + json.Country + "\n", function(err) {
  				if (err) throw err;
				});
		fs.appendFileSync("log.txt", "Language: " + json.Language + "\n", function(err) {
  				if (err) throw err;
				});
		fs.appendFileSync("log.txt", "Director: " + json.Director + "\n", function(err) {
  				if (err) throw err;
				});
		fs.appendFileSync("log.txt", "Actors: " + json.Actors + "\n", function(err) {
  				if (err) throw err;
				});
		fs.appendFileSync("log.txt", "Plot: " + json.Plot + "\n", function(err) {
  				if (err) throw err;
				});
		fs.appendFileSync("log.txt", "imdbRating: " + json.imdbRating + "\n", function(err) {
  				if (err) throw err;
				});
		fs.appendFileSync("log.txt", "Rotten Tomatoes Rating: " + json.tomatoRating + "\n", function(err) {
  				if (err) throw err;
				});
		fs.appendFileSync("log.txt", "Rotten Tomatoes URL: " + json.tomatoURL + "\n", function(err) {
  				if (err) throw err;
				});

	})
}

//Do-What function
var lastOption = function(last){
	//reads the information from the random.txt file 
	fs.readFile('random.txt', 'utf-8', function(err, data){
		//split the data by the comma so you can access the first part which is which type of search we are doing and the second part which is the userSelection of what we are looking up
		var what = data.split(',');
		//pass this information into the spotify function. 
		if(what[0] === songs){
			userSelection = what[1];
			mySpotify(userSelection);
		}
	})
}
