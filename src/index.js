/**
 * App ID for the skill
 */
var APP_ID = "amzn1.echo-sdk-ams.app.b16f6e14-3e4f-4f70-8098-5fb1f666a0cd";

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill'),
    desires = require('./desires'),
    doneWords = require('./done_words');

/**
 * AskDaddy is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var AskDaddy = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
AskDaddy.prototype = Object.create(AlexaSkill.prototype);
AskDaddy.prototype.constructor = AskDaddy;

AskDaddy.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("AskDaddy onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

AskDaddy.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("AskDaddy onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);

    var speechOutput = "You can ask me to ask daddy for something you are too afraid to ask for yourself.";
    var repromptText = "What do you want me to ask daddy?";
    response.ask(speechOutput, repromptText);
};

/**
 * Overridden to show that a subclass can override this function to teardown session state.
 */
AskDaddy.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("AskDaddy onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

AskDaddy.prototype.intentHandlers = {
    "AskDaddyIntent": function (intent, session, response) {
        var somethingSlot = intent.slots.Something,
            somethingName;
        if (somethingSlot && somethingSlot.value){
            somethingName = somethingSlot.value.toLowerCase();
        }

        var doneResponse = doneWords[somethingName];
        var desireResponse = desires[somethingName],
            speechOutput,
            repromptOutput;

        session.attributes.count += 1;

        if (doneResponse) {
            if (session.attributes.count >= 4) {
                doneResponse = "You have asked for too many things. Aren't you being a little greedy? " +
                    (doneResponse.indexOf('polite') > -1 ? 'However, ' : '') + doneResponse;
            } else {
                doneResponse = "Okay. " + doneResponse;
            }
            response.tell(doneResponse);
        } else if (desireResponse) {
            speechOutput = {
                speech: desireResponse,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            response.tell(speechOutput);
        } else {
            var speech;
            if (somethingName) {
                speech = "I'm sorry, Daddy says you can not have " + somethingName + ". Is there something else I can ask him?";
            } else {
                speech = "Sorry, your Daddy said no. Is there anything else you want?";
            }
            speechOutput = {
                speech: speech,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            repromptOutput = {
                speech: "Is there something else I can ask him?",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            response.ask(speechOutput, repromptOutput);
        }
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("You can ask me to ask daddy for something you are too afraid to ask for yourself.", "What do you want me to ask daddy?");
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Okay. Goodbye.";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Okay. Canceled.";
        response.tell(speechOutput);
    }
};

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the AskDaddy skill.
    var askDaddy = new AskDaddy();
    askDaddy.execute(event, context);
};

