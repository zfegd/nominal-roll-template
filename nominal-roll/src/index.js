//"use strict";
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
var WELCOME_MESSAGE = "Welcome to Are You Invited? Find out if someone is invited to the party, or add someone to the list. I can also update the list from the database."

// This is the example message of how a user can ask the skill
var EXAMPLE_ASK_MESSAGE = "You can ask, is John Smith cleared to enter?"

//This is the message a user will hear when they ask Alexa for help in your skill.
var HELP_MESSAGE = "Would you like to check if someone is invited, add someone to the list, or get an updated list?"
// var HELP_MESSAGE = "Would you like to check if someone is invited?"

//This is the message a user will hear when they ask Alexa for help in your skill, and got rejected the first time
// var HELP_MESSAGE_TWO = "Would you like to add someone to the invited list?"

//This is the last help message prompt the skill offers
// var HELP_MESSAGE_THREE = "Would you like to update the list?"

//This is the message if help is asked, but all the requests were rejected
// var HELP_MESSAGE_FAILED = "Sorry, I can't help you with anything else."

// This is the message Alexa gives when updating list
var UPDATING_MESSAGE = "Updating list in progress. Please stand by."

// This is the message Alexa gives when list has updated
var UPDATED_MESSAGE = "The list has been updated!"

//This is the message a user will hear when they begin a new search
// var NEW_SEARCH_MESSAGE = "I can help you check if that person is cleared to enter.";

var ENTRANCE_FAILURE_MESSAGE = "Sorry! That person is not cleared for entry!"
var ENTRANCE_SUCCESS_MESSAGE = "That person is cleared to enter!"

// TODO Implement spelling checks in future
// var UNCLEAR_SPELLING_MESSAGE = "Please spell the person's name out clearly."

// var ADD_NAME_PROMPT = "What is the name and id of the person you want to add?"
var ADD_SUCCESS_MESSAGE = "That person has been added."

//TODO Implement duplicate checker
// var ADD_FAILURE_MESSAGE = "That person was already in the list."

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

var handlers = {
  "LaunchRequest" : function() {
    this.emit(":ask", WELCOME_MESSAGE);
  },
  "AddToListIntent" : function() {
    var name = this.event.request.intent.slots.name.value;
    var id = this.event.request.intent.slots.id.value;
    addData(data,name,id);
    this.emit(":tell",ADD_SUCCESS_MESSAGE);
  },
  "CheckListIntent" : function() {
    var name = this.event.request.intent.slots.name.value;
    var id = this.event.request.intent.slots.id.value;
    if(checkNRIC(data,name,id)){
      this.emit(":tell",ENTRANCE_SUCCESS_MESSAGE);
    }
    else {
      this.emit(":tell",ENTRANCE_FAILURE_MESSAGE);
    }
  },
  "PullListIntent" : function() {
    this.emit(":tell", UPDATING_MESSAGE);
    this.emit(":tell", UPDATED_MESSAGE);
  },
  "AMAZON.CancelIntent" : function() {
    this.emit(":tell", SHUTDOWN_MESSAGE);
  },
  "AMAZON.HelpIntent" : function() {
    this.emit(":ask", HELP_MESSAGE);
    this.emit(":tell", EXAMPLE_ASK_MESSAGE);
  },
  "AMAZON.StopIntent" : function() {
    this.emit(":tell", EXIT_SKILL_MESSAGE);
  },
}

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
//    alexa.registerHandlers(newSessionHandlers, startSearchHandlers, descriptionHandlers, multipleSearchResultsHandlers);
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
  if(! checkName(data,name)){
    return false;
  }
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
