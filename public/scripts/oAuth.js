/**
 * FirebaseUI initialization to be used in a Single Page application context.
 */
// FirebaseUI config.
var uiConfig = {
  'callbacks': {
    // Called when the user has been successfully signed in.
    'signInSuccess': function(user, credential, redirectUrl) {
      handleSignedInUser(user);
      // Do not redirect.
      return false;
    }
  },
  // Opens IDP Providers sign-in flow in a popup.
  'signInFlow': 'popup',
  'signInOptions': [
    {
      provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      scopes: ['https://www.googleapis.com/auth/plus.login']
    },
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ],
  // Terms of service url.
  'tosUrl': 'https://www.google.com'
};

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// Keep track of the currently signed in user.
var currentUid = null;


/**
 * Displays the UI for a signed in user.
 */
var handleSignedInUser = function(user) {
  currentUid = user.uid;
  document.getElementById('user-signed-in').style.display = 'block';
  document.getElementById('user-signed-out').style.display = 'none';
  document.getElementById('name').textContent = user.displayName;
  document.getElementById('emailx').textContent = user.email;

  console.log("EMAIL: " +  user.email);
  console.log("NAME: " +  user.displayName);

  //--------------------------------------------------|
  //        LET THE USE ACCESS OUR DATABASE
  //          e.g: save picture, file ...
  //--------------------------------------------------|
  //           The code goes bellow



  //--------------------------------------------------|

  if (user.photoURL){
    document.getElementById('photo').src = user.photoURL;
    document.getElementById('photo').style.display = 'block';
  } else {
    document.getElementById('photo').style.display = 'none';
  }
};


/**
 * Displays the UI for a signed out user.
 */
var handleSignedOutUser = function() {
  document.getElementById('user-signed-in').style.display = 'none';
  document.getElementById('user-signed-out').style.display = 'block';
  ui.start('#firebaseui-container', uiConfig);
};

// Listen to change in auth state so it displays the correct UI for when
// the user is signed in or not.
firebase.auth().onAuthStateChanged(function(user) {
  // The observer is also triggered when the user's token has expired and is
  // automatically refreshed. In that case, the user hasn't changed so we should
  // not update the UI.
  if (user && user.uid == currentUid) {
    return;
  }
  document.getElementById('loading').style.display = 'none';
  document.getElementById('loaded').style.display = 'block';
  user ? handleSignedInUser(user) : handleSignedOutUser();
});


/**
 * Initializes the oAuth.
 */
var initApp = function() {

  document.getElementById('sign-out').addEventListener('click', function() {
    firebase.auth().signOut();
  });
  document.getElementById('delete-account').addEventListener(
      'click', function() {
        firebase.auth().currentUser.delete();
      });
};

window.addEventListener('load', initApp);