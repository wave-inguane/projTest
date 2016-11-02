const util = require('util');
var firebase = require("firebase");
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

// Additional middleware which will set headers that we need on each request.
app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest data.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});



var multer = require('multer');

var uploader = multer({
    storage: multer.memoryStorage({})
});
var gcloud = require('google-cloud');

/**
 * Google cloud storage part
 */
var CLOUD_BUCKET="dbgamespider.appspot.com"; //From storage console, list of buckets
var gcs = gcloud.storage({
    projectId: '315500031833', //from storage console, then click settings, then "x-goog-project-id"
    keyFilename: 'privkey.json' //the key we already set up
});

function getPublicUrl(filename) {
    return 'https://storage.googleapis.com/' + CLOUD_BUCKET + '/' + filename;
}

var bucket = gcs.bucket(CLOUD_BUCKET);

//From https://cloud.google.com/nodejs/getting-started/using-cloud-storage
function sendUploadToGCS(req, res, next) {
    //console.log("GCS: "+req.image);
    //console.log("Registration req "+util.inspect(req, false, null));
    if (!req.file) {
        return next();
    }

    var gcsname = Date.now() + req.file.originalname;
    var file = bucket.file(gcsname);


    var stream = file.createWriteStream({
        metadata: {
            contentType: req.file.mimetype
        }
    });

    stream.on('error', function(err) {
        req.file.cloudStorageError = err;
        next(err);
    });

    stream.on('finish', function() {
        req.file.cloudStorageObject = gcsname;
        req.file.cloudStoragePublicUrl = getPublicUrl(gcsname);
        var options = {
            entity: 'allUsers',
            role: gcs.acl.READER_ROLE
        };
        file.acl.add(options, function(a, e) {
            next();
        }); //Make file world-readable; this is async so need to wait to return OK until its done
    });

    stream.end(req.file.buffer);
}

//warm up the database
firebase.initializeApp({
    serviceAccount: "privkey.json",
    databaseURL: "https://dbgamespider.firebaseio.com"
});

var fireRef = firebase.database().ref('users');

var port = process.env.PORT || 3001;



//Make a new one (REGISTRATION)
app.post('/upload', uploader.single("img"), sendUploadToGCS, function(req, res, next) {
    console.log("UPLOAD");

    var first = req.body.first;
    var last = req.body.last;
    var pass = req.body.pass;
    var email = req.body.email;
    var dob = req.body.dob;
    console.log(first + " " + last + " " + pass + " " + email + " " + dob + " ");

    var img_url = getPublicUrl(req.file.cloudStorageObject);
    console.log(img_url);

    var email_exists = false;

    fireRef.once("value", function(snapshot) {
        //for each key in users	
        snapshot.forEach(function(childSnapshot) {
            //retrieve email
            var stored_email = childSnapshot.val()['email'];

            //if email matches, mark outer var
            if (email == stored_email) {
                email_exists = true;
            }
        });

        //new email, valid registration
        if (!email_exists) {
            //fireRef.push({first: first, last: last, email: email, pass: pass, dob: dob, image:img_url});
            fireRef.push({
                first: first,
                last: last,
                email: email,
                pass: pass,
                dob: dob,
                image: img_url
            });
            console.log("Registered New Account!");
            res.send("pass");
        }
        //existing email, invalid registration
        else {
            console.log("Account Already Exists");
            res.send("fail");
        }
    });
});

//Edit one (CHANGE PASSWORD)
app.put('/database', function(req, res) {
    console.log("Change req");

    var email = req.body.email
    var pass = req.body.pass
    var newPass = req.body.newPass

    var changed = false;

    fireRef.once("value", function(snapshot) {
        //for each key in users	
        snapshot.forEach(function(childSnapshot) {
            //retrieve email
            var stored_email = childSnapshot.val()['email'];

            //if email matches
            if (email == stored_email) {
                //if old passwords match
                if (pass == childSnapshot.val()['pass']) {
                    fireRef.child(childSnapshot.key + "/pass").set(newPass);
                    changed = true;
                }
            }
        });
        if (!changed) {
            res.send("fail");
        } else {
            res.send("pass");
        }
    });
});
//LOGIN USES GET
app.get('/database', function(req, res) {
    console.log("Login request");

    var email = req.query.email;
    var pass = req.query.pass;

    var found_email = false;

    fireRef.once("value", function(snapshot) {
        //for each key in users	
        snapshot.forEach(function(childSnapshot) {
            //retrieve email
            var stored_email = childSnapshot.val()['email'];
            var stored_pass = childSnapshot.val()['pass'];
            var stored_url = childSnapshot.val()['image'];

            //check if email matches this record
            if (email == stored_email) {
                found_email = true;
                //check if password is accurate
                if (pass == stored_pass) {
                    res.send(stored_url);
                } else {
                    res.send("fail");
                }
            }
        });
        //no email matched user input
        if (!found_email) {
            res.send("fail");
        }

    });
});

//app.use(express.static('.'));
app.use(express.static('public'));


app.listen(port, function() {
    console.log('Server started: http://localhost:'  + port);
});




