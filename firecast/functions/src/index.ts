// import * as functions from 'firebase-functions';

// // // Start writing Firebase Functions
// // // https://firebase.google.com/docs/functions/typescript
// //
//  // export const helloWorld = functions.https.onRequest((request, response) => {
//  // 	console.log('Hello!')
//  //  	response.send("Hello from Firebase!");
//  // });



/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// [START all]
// [START import]
// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');


admin.initializeApp();

// Get a database reference to our posts
const db = admin.database();
// [END import]

// // [START addMessage]
//IMPORTANT, THIS PART IS USED FOR HTTP CONNECTION TEST. CODE IS GOOD. BUT NOT USEFUL HERE. 
// // Take the text parameter passed to this HTTP endpoint and insert it into the
// // Realtime Database under the path /messages/:pushId/original
// // [START addMessageTrigger]
// exports.addMessage = functions.https.onRequest(async (req, res) => {
// // [END addMessageTrigger]
//   // Grab the text parameter.
//   const original = req.query.text;
//   // [START adminSdkPush]
//   // Push the new message into the Realtime Database using the Firebase Admin SDK.
//   const snapshot = await admin.database().ref('/messages').push({original: original});
//   // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
//   res.redirect(303, snapshot.ref.toString());
//   // [END adminSdkPush]
// });
// // [END addMessage]

// [START makeUppercase]
// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase

exports.makeUppercase = functions.database.ref('/messages/{pushId}/original')
    .onCreate((snapshot, context) => {

      


      // Grab the current value of what was written to the Realtime Database.
      const original = snapshot.val();

      //write Cloud Function Console Log, this line does not affect this function
      console.log('Uppercasing', context.params.pushId, original);

      //Transfer to upper case. 
      const uppercase = original.toUpperCase();
      // You must return a Promise when performing asynchronous tasks inside a Functions such as
      // writing to the Firebase Realtime Database.
      // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
      return snapshot.ref.parent.child('uppercase').set(uppercase);
    });




//[START Cloud Timer]
exports.myCloudTimer = functions.database.ref('/DB1_0/Game/game(idFDFDS)/CurrentQuestion/countDown').onCreate((snapshot, context) => {
       return db.ref('/DB1_0/Game/game(idFDFDS)/CurrentQuestion/content').once('value', snap => {
        if (!snap.exists()) {
            return Promise.reject('time is not defined in the database.');
        }


        const timeInSeconds = snapshot.val();
        console.log('Cloud Timer was Started: ' + timeInSeconds);

        return functionTimer(timeInSeconds,
            elapsedTime => {
                db.ref('/DB1_0/Game/game(idFDFDS)/CurrentQuestion/countDown').set(elapsedTime);
            })
            .then(totalTime => {
                console.log('Timer of ' + totalTime + ' has finished.');

                // [Remove Current Question]
                db.ref('/DB1_0/Game/game(idFDFDS)/CurrentQuestion').remove()
                  .then(function() {
                    console.log("Remove succeeded.")
                  })
                  .catch(function(error) {
                    console.log("Remove failed: " + error.message)
                  });
                 // [Remove ends]

                const questionListRef = db.ref('/DB1_0/Game/game(idFDFDS)');
                const newQuestionRef = questionListRef.push();
                //newQuestionRef.child('content').set (snap.val());
                newQuestionRef.set({
                  'content': snap.val(),
                  'answer': 'notSet'
                });

            })
            // .then(() => new Promise(resolve => setTimeout(resolve, 1000)))
            // .then(() => event.data.ref.remove())
            .catch(error => console.error(error));
    });
});


function functionTimer (seconds, call) {
    return new Promise((resolve, reject) => {
        if (seconds > 300) {
            reject('execution would take too long...');
            return;
        }
        const interval = setInterval(onInterval, 1000);
        let elapsedSeconds = 0;

        function onInterval () {
            if (elapsedSeconds >= seconds) {
                clearInterval(interval);
                call(0);
                resolve(elapsedSeconds);
                return;
            }
            call(seconds - elapsedSeconds);
            elapsedSeconds++;
        }
    });
}
//[END Cloud Timer]






// DO NOT DELETE THIS SECTION! 
//[Original Timer from stackOverflow]  
// exports.myCloudTimer = functions.database.ref('/startTimerRequest/').onCreate((event) => {
//     return db.ref('cloudTimer/timeInMs').once('value', snap => {
//         if (!snap.exists()) {
//             return Promise.reject('time is not defined in the database.');
//         }

//         let timeInSeconds = snap.val() / 1000;
//         console.log('Cloud Timer was Started: ' + timeInSeconds);

//         return functionTimer(timeInSeconds,
//             elapsedTime => {
//                 db.ref('cloudTimer/observableTime').set(elapsedTime);
//             })
//             .then(totalTime => {
//                 console.log('Timer of ' + totalTime + ' has finished.');
//             })
//             .then(() => new Promise(resolve => setTimeout(resolve, 1000)))
//             .then(() => event.data.ref.remove())
//             .catch(error => console.error(error));
//     });
// });

// function functionTimer (seconds, call) {
//     return new Promise((resolve, reject) => {
//         if (seconds > 300) {
//             reject('execution would take too long...');
//             return;
//         }
//         let interval = setInterval(onInterval, 1000);
//         let elapsedSeconds = 0;

//         function onInterval () {
//             if (elapsedSeconds >= seconds) {
//                 clearInterval(interval);
//                 call(0);
//                 resolve(elapsedSeconds);
//                 return;
//             }
//             call(seconds - elapsedSeconds);
//             elapsedSeconds++;
//         }
//     });
// }
//[Original Timer from stackOverflow Ends]  

