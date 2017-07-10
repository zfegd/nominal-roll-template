"use strict";
const Alexa = require("alexa-sdk"); // import the library

var APP_ID = "amzn1.ask.skill.f589ec20-89b0-4556-9bf7-a6c3dc853cbb";

// =====================================================================================================
// --------------------------------- Section 1. Data and Text strings  ---------------------------------
// =====================================================================================================

//Placeholder data, in reality should connect to a database to get list of people
var data=[
    {name:"Jimmy Daniels", id:"I-73458622"},
    {name:"Kevin Tyson", id:"I-88213044"},
    {name:"Graham Dallas", id:"N-12456788"},
    {name:"Suzie Hammers", id:"C-81792323"},
    {name:"Daniela Lopez", id:"I-96231001"},
    {name:"Wilbur Rosetta", id:"N-72881543"}
];

var skillName = "Are You Invited?";

//This is the welcome message for when a user starts the skill without a specific intent.
var WELCOME_MESSAGE = "Find out if someone is invited to the party, or add someone to the list. I can also update the list from the database."

// This is the example message of how a user can ask the skill
var EXAMPLE_ASK_MESSAGE = "You can ask, is John Smith cleared to enter?"

//This is the message a user will hear when they ask Alexa for help in your skill.
var HELP_MESSAGE = "Would you like to check if someone is invited?"

//This is the message a user will hear when they ask Alexa for help in your skill, and got rejected the first time
var HELP_MESSAGE_TWO = "Would you like to add someone to the invited list?"

//This is the last help message prompt the skill offers
var HELP_MESSAGE_THREE = "Would you like to update the list?"

//This is the message if help is asked, but all the requests were rejected
var HELP_MESSAGE_FAILED = "Sorry, I can't help you with anything else."

// This is the message Alexa gives when updating list
var UPDATING_MESSAGE = "Updating list in progress. Please stand by."

// This is the message Alexa gives when list has updated
var UPDATED_MESSAGE = "The list has been updated!"

//This is the message a user will hear when they begin a new search
var NEW_SEARCH_MESSAGE = "I can help you check if that person is cleared to enter.";

var ENTRANCE_FAILURE_MESSAGE = "Sorry! That person is not cleared for entry!"
var NAME_SUCCESS_PROMPT = "Please confirm person's ID"
var ENTRANCE_SUCCESS_MESSAGE = "That person is cleared to enter!"

// TODO Implement spelling checks in future
var UNCLEAR_SPELLING_MESSAGE = "Please spell the person's name out clearly."

var ADD_NAME_PROMPT = "What is the name of the person you want to add?"
var ADD_ID_PROMPT = "What is the person's ID?"
var ADD_SUCCESS_MESSAGE = "That person has been added."

//TODO Implement duplicate checker
var ADD_FAILURE_MESSAGE = "That person was already in the list."

//This is the message a user will hear when they ask Alexa for help while in the SEARCH state
var SEARCH_STATE_HELP_MESSAGE = "Search is happening. Please wait to ask for help.";

// This is the message use when the decides to end the search
var SHUTDOWN_MESSAGE = "Ok.";

//This is the message a user will hear when they try to cancel or stop the skill.
var EXIT_SKILL_MESSAGE = "Goodbye";

// =====================================================================================================
// ------------------------------ Section 2. Skill Code - Intent Handlers  -----------------------------
// =====================================================================================================
// CAUTION: Editing anything below this line might break your skill.
//======================================================================================================

var states = {
    SEARCHMODE: "_SEARCHMODE",
    DESCRIPTION: "_DESCRIPTION",
    MULTIPLE_RESULTS: "_MULTIPLE_RESULTS"
};

const newSessionHandlers = {
    "LaunchRequest": function() {
        this.handler.state = states.SEARCHMODE;
        this.emit(":ask", WELCOME_MESSAGE, getGenericHelpMessage(data));
    },
    "SearchByNameIntent": function() {
        console.log("SEARCH INTENT");
        this.handler.state = states.SEARCHMODE;
        this.emitWithState("SearchByNameIntent");
    },
    "TellMeMoreIntent": function() {
        this.handler.state = states.SEARCHMODE;
        // this.emitWithState("SearchByNameIntent");
        this.emit(":ask", WELCOME_MESSAGE, getGenericHelpMessage(data));
    },
    "TellMeThisIntent": function() {
        this.handler.state = states.SEARCHMODE;
        this.emitWithState("SearchByNameIntent");
    },
    "SearchByInfoTypeIntent": function() {
        this.handler.state = states.SEARCHMODE;
        this.emitWithState("SearchByInfoTypeIntent");
    },
    "AMAZON.YesIntent": function() {
        this.emit(":ask", getGenericHelpMessage(data), getGenericHelpMessage(data));
    },
    "AMAZON.NoIntent": function() {
        this.emit(":tell", SHUTDOWN_MESSAGE);
    },
    "AMAZON.RepeatIntent": function() {
        this.emit(":ask", HELP_MESSAGE, getGenericHelpMessage(data));
    },
    "AMAZON.StopIntent": function() {
        this.emit(":tell", EXIT_SKILL_MESSAGE);
    },
    "AMAZON.CancelIntent": function() {
        this.emit(":tell", EXIT_SKILL_MESSAGE);
    },
    "AMAZON.StartOverIntent": function() {
        this.handler.state = states.SEARCHMODE;
        var output = "Ok, starting over." + getGenericHelpMessage(data);
        this.emit(":ask", output, output);
    },
    "AMAZON.HelpIntent": function() {
        this.emit(":ask", HELP_MESSAGE + getGenericHelpMessage(data), getGenericHelpMessage(data));
    },
    "SessionEndedRequest": function() {
        this.emit("AMAZON.StopIntent");
    },
    "Unhandled": function() {
        this.handler.state = states.SEARCHMODE;
        this.emitWithState("SearchByNameIntent");
    }
};
var startSearchHandlers = Alexa.CreateStateHandler(states.SEARCHMODE, {
    "AMAZON.YesIntent": function() {
        this.emit(":ask", NEW_SEARCH_MESSAGE, NEW_SEARCH_MESSAGE);
    },
    "AMAZON.NoIntent": function() {
        this.emit(":tell", SHUTDOWN_MESSAGE);
    },
    "AMAZON.RepeatIntent": function() {
      var output;
      if(this.attributes.lastSearch){
        output = this.attributes.lastSearch.lastSpeech;
        console.log("repeating last speech");
      }
      else{
        output = getGenericHelpMessage(data);
        console.log("no last speech availble. outputting standard help message.");
      }
      this.emit(":ask",output, output);
    },
    "SearchByNameIntent": function() {
      searchByNameIntentHandler.call(this);
    },
    "SearchByCityIntent": function() {
      searchByCityIntentHandler.call(this);
    },
    "SearchByInfoTypeIntent": function() {
      searchByInfoTypeIntentHandler.call(this);
    },
    "TellMeThisIntent": function() {
        this.handler.state = states.DESCRIPTION;
        this.emitWithState("TellMeThisIntent");
    },
    "TellMeMoreIntent": function() {
        this.handler.state = states.DESCRIPTION;
        this.emitWithState("TellMeMoreIntent");
    },
    "AMAZON.HelpIntent": function() {
        this.emit(":ask", getGenericHelpMessage(data), getGenericHelpMessage(data));
    },
    "AMAZON.StopIntent": function() {
        this.emit(":tell", EXIT_SKILL_MESSAGE);
    },
    "AMAZON.CancelIntent": function() {
        this.emit(":tell", EXIT_SKILL_MESSAGE);
    },
    "AMAZON.StartOverIntent": function() {
        this.handler.state = states.SEARCHMODE;
        var output = "Ok, starting over." + getGenericHelpMessage(data);
        this.emit(":ask", output, output);
    },
    "SessionEndedRequest": function() {
        this.emit("AMAZON.StopIntent");
    },
    "Unhandled": function() {
        console.log("Unhandled intent in startSearchHandlers");
        this.emit(":ask", SEARCH_STATE_HELP_MESSAGE, SEARCH_STATE_HELP_MESSAGE);
    }
});
var multipleSearchResultsHandlers = Alexa.CreateStateHandler(states.MULTIPLE_RESULTS, {

    "AMAZON.StartOverIntent": function() {
        this.handler.state = states.SEARCHMODE;
        var output = "Ok, starting over." + getGenericHelpMessage(data);
        this.emit(":ask", output, output);
    },
    "AMAZON.YesIntent": function() {
        var output = "Hmm. I think you said - yes, but can you please say the name of the person you'd like to learn more about?";
        this.emit(":ask", output, output);
    },
    "AMAZON.NoIntent": function() {
        this.emit(":tell", SHUTDOWN_MESSAGE);
    },
    "AMAZON.RepeatIntent": function() {
        this.emit(":ask",this.attributes.lastSearch.lastSpeech, this.attributes.lastSearch.lastSpeech);
    },
    "SearchByNameIntent": function() {
        var slots = this.event.request.intent.slots;
        var firstName = isSlotValid(this.event.request, "firstName");
        var lastName = isSlotValid(this.event.request, "lastName");
        var cityName = isSlotValid(this.event.request, "cityName");
        var infoType = isSlotValid(this.event.request, "infoType");

        console.log("firstName:" + firstName);
        console.log("firstName:" + lastName);
        console.log("firstName:" + cityName);
        console.log("firstName:" + infoType);
        console.log("Intent Name:" + this.event.request.intent.name);

        var canSearch = figureOutWhichSlotToSearchBy(firstName,lastName,cityName);
        console.log("Multiple results found. canSearch is set to = " + canSearch);
        var speechOutput;

        if (canSearch)
            var searchQuery = slots[canSearch].value;
            var searchResults = searchDatabase(this.attributes.lastSearch.results, searchQuery, canSearch);
            var lastSearch;
            var output;

            if (searchResults.count > 1) { //multiple results found again
                console.log("multiple results were found again");
                this.handler.state = states.MULTIPLE_RESULTS;
                output = this.attributes.lastSearch.lastSpeech;
                this.emit(":ask",output);
            } else if (searchResults.count == 1) { //one result found
                this.attributes.lastSearch = searchResults;
                lastSearch = this.attributes.lastSearch;
                this.handler.state = states.DESCRIPTION;
                output = generateSearchResultsMessage(searchQuery,searchResults.results)
                this.attributes.lastSearch.lastSpeech = output;
                // this.emit(":ask", generateSearchResultsMessage(searchQuery,searchResults.results));
                this.emit(":ask", output);

            } else { //no match found
                lastSearch = this.attributes.lastSearch;
                var listOfPeopleFound = loopThroughArrayOfObjects(lastSearch.results);
                speechOutput = MULTIPLE_RESULTS_STATE_HELP_MESSAGE + ", " + listOfPeopleFound;
                this.emit(":ask", speechOutput);
            }
    },
    "SearchByCityIntent": function() {
      this.handler.state = states.SEARCHMODE;
      this.emitWithState("SearchByCityIntent");
    },
    "AMAZON.HelpIntent": function() {
        this.emit(":ask", MULTIPLE_RESULTS_STATE_HELP_MESSAGE, MULTIPLE_RESULTS_STATE_HELP_MESSAGE);
    },
    "AMAZON.StopIntent": function() {
        this.emit(":tell", EXIT_SKILL_MESSAGE);
    },
    "AMAZON.CancelIntent": function() {
        this.emit(":tell", EXIT_SKILL_MESSAGE);
    },
    "SessionEndedRequest": function() {
        this.emit("AMAZON.StopIntent");
    },
    "Unhandled": function() {
        console.log("Unhandled intent in multipleSearchResultsHandlers");
        this.emit(":ask", MULTIPLE_RESULTS_STATE_HELP_MESSAGE, MULTIPLE_RESULTS_STATE_HELP_MESSAGE);
    }
});
var descriptionHandlers = Alexa.CreateStateHandler(states.DESCRIPTION, {
    "TellMeMoreIntent": function() {
      var person;
      var speechOutput;
      var repromptSpeech;
      var cardContent;

      if(this.attributes.lastSearch){
        person = this.attributes.lastSearch.results[0];
        cardContent = generateCard(person); //calling the helper function to generate the card content that will be sent to the Alexa app.
        speechOutput = generateTellMeMoreMessage(person);
        repromptSpeech = "Would you like to find another evangelist? Say yes or no";

        console.log("the contact you're trying to find more info about is " + person.firstName);
        this.handler.state = states.SEARCHMODE;
        this.attributes.lastSearch.lastSpeech = speechOutput;
        this.emit(":askWithCard", speechOutput, repromptSpeech, cardContent.title, cardContent.body, cardContent.image);
      }
      else{
        speechOutput = getGenericHelpMessage(data);
        repromptSpeech = getGenericHelpMessage(data);
        this.handler.state = states.SEARCHMODE;
        this.emit(":ask", speechOutput, repromptSpeech);
      }
    },
    "TellMeThisIntent": function() {
        var slots = this.event.request.intent.slots;
        var person = this.attributes.lastSearch.results[0];
        var infoType = isSlotValid(this.event.request, "infoType");
        var speechOutput;
        var repromptSpeech;
        var cardContent;

        console.log(isInfoTypeValid("github"));

          if(this.attributes.lastSearch && isInfoTypeValid(infoType)){
              person =  this.attributes.lastSearch.results[0];
              cardContent = generateCard(person);
              speechOutput = generateSpecificInfoMessage(slots,person);
              repromptSpeech = "Would you like to find another evangelist? Say yes or no";
              this.handler.state = states.SEARCHMODE;
              this.attributes.lastSearch.lastSpeech = speechOutput;
              this.emit(":askWithCard", speechOutput, repromptSpeech, cardContent.title, cardContent.body, cardContent.image);
            } else {
              //not a valid slot. no card needs to be set up. respond with simply a voice response.
              speechOutput = generateSearchHelpMessage(person.gender);
              repromptSpeech = "You can ask me - what's " + genderize("his-her", person.gender) + " twitter, or give me " + genderize("his-her", person.gender) + " git-hub username";
              this.attributes.lastSearch.lastSpeech = speechOutput;
              this.handler.state = states.SEARCHMODE;
              this.emit(":ask", speechOutput, repromptSpeech);
            }
    },
    "SearchByNameIntent": function() {
        searchByNameIntentHandler.call(this);
    },
    "SearchByCityIntent": function() {
      searchByCityIntentHandler.call(this);
    },
    "AMAZON.HelpIntent": function() {
        var slots = this.event.request.intent.slots;
        var person = this.attributes.lastSearch.results[0];
        this.emit(":ask", generateNextPromptMessage(person,"current"), generateNextPromptMessage(person,"current"));
    },
    "AMAZON.StopIntent": function() {
        this.emit(":tell", EXIT_SKILL_MESSAGE);
    },
    "AMAZON.CancelIntent": function() {
        this.emit(":tell", EXIT_SKILL_MESSAGE);
    },
    "AMAZON.NoIntent": function() {
        this.emit(":tell", SHUTDOWN_MESSAGE);
    },
    "AMAZON.YesIntent": function() {
        this.emit("TellMeMoreIntent");
    },
    "AMAZON.RepeatIntent": function() {
        this.emit(":ask",this.attributes.lastSearch.lastSpeech, this.attributes.lastSearch.lastSpeech);
    },
    "AMAZON.StartOverIntent": function() {
        this.handler.state = states.SEARCHMODE;
        var output = "Ok, starting over." + getGenericHelpMessage(data);
        this.emit(":ask", output, output);
    },
    "SessionEndedRequest": function() {
        this.emit("AMAZON.StopIntent");
    },
    "Unhandled": function() {
        var slots = this.event.request.intent.slots;
        var person = this.attributes.lastSearch.results[0];

        console.log("Unhandled intent in DESCRIPTION state handler");
        this.emit(":ask", "Sorry, I don't know that" + generateNextPromptMessage(person,"general"), "Sorry, I don't know that" + generateNextPromptMessage(person,"general"));
    }
});

// ------------------------- END of Intent Handlers  ---------------------------------

function searchDatabase(dataset, searchQuery, searchType) {
    var matchFound = false;
    var results = [];

    //beginning search
    for (var i = 0; i < dataset.length; i++) {
        if (sanitizeSearchQuery(searchQuery) == dataset[i][searchType]) {
            results.push(dataset[i]);
            matchFound = true;
        }
        if ((i == dataset.length - 1) && (matchFound == false)) {
        //this means that we are on the last record, and no match was found
            matchFound = false;
            console.log("no match was found using " + searchType);
        //if more than searchable items were provided, set searchType to the next item, and set i=0
        //ideally you want to start search with lastName, then firstname, and then cityName
        }
    }
    return {
        count: results.length,
        results: results
    };
}

function figureOutWhichSlotToSearchBy(firstName,lastName,cityName) {
  if (lastName){
    console.log("search by lastName");
    return "lastName";
  }
  else if (!lastName && firstName){
    console.log("search by firstName")
    return "firstName";
  }
  else if (!lastName && !firstName && cityName){
    console.log("search by cityName")
    return "cityName";
  }
  else{
    return false;
    console.log("no valid slot provided. can't search.")
  }
}

function searchByNameIntentHandler(){
  var firstName = isSlotValid(this.event.request, "firstName");
  var lastName = isSlotValid(this.event.request, "lastName");
  var cityName = isSlotValid(this.event.request, "cityName");
  var infoType = isSlotValid(this.event.request, "infoType");
  var testingThis = testingThisFunction.call(this,"hello");

  var canSearch = figureOutWhichSlotToSearchBy(firstName,lastName,cityName);
  console.log("canSearch is set to = " + canSearch);

      if (canSearch){
        var searchQuery = this.event.request.intent.slots[canSearch].value;
        var searchResults = searchDatabase(data, searchQuery, canSearch);

        //saving lastSearch results to the current session
        var lastSearch = this.attributes.lastSearch = searchResults;
        var output;

        //saving last intent to session attributes
        this.attributes.lastSearch.lastIntent = "SearchByNameIntent";

        if (searchResults.count > 1) { //multiple results found
            console.log("Search complete. Multiple results were found");
            var listOfPeopleFound = loopThroughArrayOfObjects(lastSearch.results);
            output = generateSearchResultsMessage(searchQuery,searchResults.results) + listOfPeopleFound + ". Who would you like to learn more about?";
            this.handler.state = states.MULTIPLE_RESULTS; // change state to MULTIPLE_RESULTS
            this.attributes.lastSearch.lastSpeech = output;
            this.emit(":ask", output);
        } else if (searchResults.count == 1) { //one result found
            this.handler.state = states.DESCRIPTION; // change state to description
            console.log("one match was found");
            if (infoType) {
                //if a specific infoType was requested, redirect to specificInfoIntent
                console.log("infoType was provided as well")
                this.emitWithState("TellMeThisIntent");
            }
            else{
                console.log("no infoType was provided.")
                output = generateSearchResultsMessage(searchQuery,searchResults.results)
                this.attributes.lastSearch.lastSpeech = output;
                this.emit(":ask", output);
            }
        }
        else{//no match found
          console.log("no match found");
          console.log("searchQuery was  = " + searchQuery);
          console.log("searchResults.results was  = " + searchResults);
          output = generateSearchResultsMessage(searchQuery,searchResults.results)
          this.attributes.lastSearch.lastSpeech = output;
          // this.emit(":ask", generateSearchResultsMessage(searchQuery,searchResults.results));
          this.emit(":ask", output);
        }
      }
        else {
            console.log("no searchable slot was provided");
            console.log("searchQuery was  = " + searchQuery);
            console.log("searchResults.results was  = " + searchResults);

            this.emit(":ask", generateSearchResultsMessage(searchQuery,false));
        }
}

function searchByCityIntentHandler(){
  var slots = this.event.request.intent.slots;
  var cityName = isSlotValid(this.event.request, "cityName");

      if (cityName){
        var searchQuery = slots.cityName.value;
        console.log("will begin search with  " + slots.cityName.value + " in cityName");
        var searchResults = searchDatabase(data, searchQuery, "cityName");

        //saving lastSearch results to the current session
        var lastSearch = this.attributes.lastSearch = searchResults;
        var output;

        //saving last intent to session attributes
        this.attributes.lastSearch.lastIntent = "SearchByNameIntent";

        if (searchResults.count > 1) { //multiple results found
            console.log("Search completed by city. Multiple results were found");
            var listOfPeopleFound = loopThroughArrayOfObjects(lastSearch.results);
            output = generateSearchResultsMessage(searchQuery,searchResults.results) + listOfPeopleFound + ". Who would you like to learn more about?";
            this.handler.state = states.MULTIPLE_RESULTS; // change state to MULTIPLE_RESULTS
            this.attributes.lastSearch.lastSpeech = output;
            this.emit(":ask", output);
        } else if (searchResults.count == 1) { //one result found
            console.log("one match found");
            this.handler.state = states.DESCRIPTION; // change state to description
            output = generateSearchResultsMessage(searchQuery,searchResults.results)
            this.attributes.lastSearch.lastSpeech = output;
            // this.emit(":ask", generateSearchResultsMessage(searchQuery,searchResults.results));
            this.emit(":ask", output);

        }
        else{//no match found
          console.log("no match found");
          console.log("searchQuery was  = " + searchQuery);
          console.log("searchResults.results was  = " + searchResults);
          output = generateSearchResultsMessage(searchQuery,searchResults.results)
          this.attributes.lastSearch.lastSpeech = output;
          // this.emit(":ask", generateSearchResultsMessage(searchQuery,searchResults.results));
          this.emit(":ask", output);

        }
      }
        else {
            console.log("no searchable slot was provided");
            console.log("searchQuery was  = " + searchQuery);
            console.log("searchResults.results was  = " + searchResults);

            this.emit(":ask", generateSearchResultsMessage(searchQuery,false));
        }
}

function searchByInfoTypeIntentHandler(){
  var slots = this.event.request.intent.slots;
  var firstName = isSlotValid(this.event.request, "firstName");
  var lastName = isSlotValid(this.event.request, "lastName");
  var cityName = isSlotValid(this.event.request, "cityName");
  var infoType = isSlotValid(this.event.request, "infoType");

  var canSearch = figureOutWhichSlotToSearchBy(firstName,lastName,cityName);
  console.log("canSearch is set to = " + canSearch);

      if (canSearch){
        var searchQuery = slots[canSearch].value;
        var searchResults = searchDatabase(data, searchQuery, canSearch);

        //saving lastSearch results to the current session
        var lastSearch = this.attributes.lastSearch = searchResults;
        var output;

        //saving last intent to session attributes
        this.attributes.lastSearch.lastIntent = "SearchByNameIntent";

        if (searchResults.count > 1) { //multiple results found
            console.log("multiple results were found");
            var listOfPeopleFound = loopThroughArrayOfObjects(lastSearch.results);
            output = generateSearchResultsMessage(searchQuery,searchResults.results) + listOfPeopleFound + ". Who would you like to learn more about?";
            this.handler.state = states.MULTIPLE_RESULTS; // change state to MULTIPLE_RESULTS
            this.attributes.lastSearch.lastSpeech = output;
            this.emit(":ask", output);
        } else if (searchResults.count == 1) { //one result found
            this.handler.state = states.DESCRIPTION; // change state to description
            console.log("one match was found");
            if (infoType) {
                //if a specific infoType was requested, redirect to specificInfoIntent
                console.log("infoType was provided as well")
                var person = this.attributes.lastSearch.results[0];
                var cardContent = generateCard(person);
                var speechOutput = generateSpecificInfoMessage(slots,person);
                var repromptSpeech = "Would you like to find another evangelist? Say yes or no";
                this.attributes.lastSearch.lastSpeech = speechOutput;
                this.handler.state = states.SEARCHMODE;
                this.emit(":askWithCard", speechOutput, repromptSpeech, cardContent.title, cardContent.body, cardContent.image);
                // this.emitWithState("TellMeThisIntent");
            }
            else{
                console.log("no infoType was provided.")
                output = generateSearchResultsMessage(searchQuery,searchResults.results)
                this.attributes.lastSearch.lastSpeech = output;
                // this.emit(":ask", generateSearchResultsMessage(searchQuery,searchResults.results));
                this.emit(":ask", output);
            }
        }
        else{//no match found
          console.log("no match found");
          console.log("searchQuery was  = " + searchQuery);
          console.log("searchResults.results was  = " + searchResults);
          output = generateSearchResultsMessage(searchQuery,searchResults.results)
          this.attributes.lastSearch.lastSpeech = output;
          // this.emit(":ask", generateSearchResultsMessage(searchQuery,searchResults.results));
          this.emit(":ask", output);
        }
      }
        else {
            console.log("no searchable slot was provided");
            console.log("searchQuery was  = " + searchQuery);
            console.log("searchResults.results was  = " + searchResults);

            this.emit(":ask", generateSearchResultsMessage(searchQuery,false));
        }
}
// =====================================================================================================
// ------------------------------- Section 3. Generating Speech Messages -------------------------------
// =====================================================================================================

function generateNextPromptMessage(person,mode){
  var infoTypes = ["git-hub username","twitter handle","linked-in"]
  var prompt;

  if (mode == "current"){
    // if the mode is current, we should give more informaiton about the current contact
    prompt = ". You can say - tell me more, or  tell me " + genderize("his-her", person.gender) + " " + infoTypes[getRandom(0,infoTypes.length-1)];
  }
  //if the mode is general, we should provide general help information
  else if (mode == "general"){
    prompt = ". " + getGenericHelpMessage(data);
  }
  return prompt;
}

function generateSendingCardToAlexaAppMessage(person,mode){
    var sentence = "I have sent " + person.firstName + "'s contact card to your Alexa app" + generateNextPromptMessage(person,mode);
    return sentence;
}

function generateSearchResultsMessage(searchQuery,results){
    var sentence;
    var details;
    var prompt;

    if (results){
      switch (true) {
      case (results.length == 0):
          sentence = "Hmm. I couldn't find " + searchQuery + ". " + getGenericHelpMessage(data);
          break;
      case (results.length == 1):
          var person = results[0];
          details = person.firstName + " " + person.lastName + " is " + person.title + ", based out of " + person.cityName
          prompt = generateNextPromptMessage(person,"current");
          sentence = details + prompt
          console.log(sentence);
          break;
      case (results.length > 1):
          sentence = "I found " + results.length + " matching results";
          break;
      }
    }
    else{
      sentence = "Sorry, I didn't quite get that. " + getGenericHelpMessage(data);
    }
    return sentence;
}

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(newSessionHandlers, startSearchHandlers, descriptionHandlers, multipleSearchResultsHandlers);
    alexa.execute();
};

// =====================================================================================================
// ------------------------------------ Section 4. Helper Functions  -----------------------------------
// =====================================================================================================

function checkName(data, name){
  for (var i = 0; i < data.length; i++) {
    if(data[i].name.valueOf() == name.valueOf()){
      return true;
    }
  }
  return false;
}

// Assumes no duplicate names
function checkNRIC(data, name, id){
  for (var i = 0; i < data.length; i++) {
    if(data[i].name.valueOf() == name.valueOf()){
      if(data[i].id.valueOf() == id.valueOf()){
        return true;
      }
      return false;
    }
  }
}

function addData(data, name, id){
    var newName = {name:"",id:""};
    newName.name = name;
    newName.id = id;
    data.push(newName);
}

function isSlotValid(request, slotName){
        var slot = request.intent.slots[slotName];
        //console.log("request = "+JSON.stringify(request)); //uncomment if you want to see the request
        var slotValue;

        //if we have a slot, get the text and store it into speechOutput
        if (slot && slot.value) {
            //we have a value in the slot
            slotValue = slot.value.toLowerCase();
            return slotValue;
        } else {
            //we didn't get a value in the slot.
            return false;
        }
}

function testingThisFunction(str){
  console.log("printing " + str);
}
