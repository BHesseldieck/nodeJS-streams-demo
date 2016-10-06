/*
** This module sets up the authentication service, which is running on its own server. 
** It corresponds with whatever wants to talk to it. In this particular scenario, we have a main app server
** using this service when it wants to authenticate a user. Because of the way that this is set up, this 
** authentication service is defined as a microservice. It can be used for one task by several different
** components within our application (and not just the main app server).
** 
** We do not include the commonly used body-parser npm module because the stream body needs to be raw data to be
** read using the NodeJS Stream API; hence, the use of req.on('data', cb) & req.on('end', cb).
** 
*/

const [express,request] = [require('express'), require('request')];

const app = express();

// The properties in this user object should match the "name" property in the form for each input
// You can choose other prop names, but it will only make you end up doing more work. #aintnobodygottimeforthat
const user = {username: 'cat', pw: 'dog', signedIn: false}; // this is the "database" of our strong user base


/*------ Set up our routes ------*/
app.get('/auth', (req, res) => {
  let data = '';
  // when we get a request coming in, it will come in as a Buffer (as raw body data)
  // so we read it like a stream ( Check out NodeJS Stream API: https://nodejs.org/api/stream.html)
  req.on('data', chunk => {
    // add the chunked data into a string
    data += chunk;
  }).on('end', () => {
    // once the request has ended, and we have all the data on our side
    // let's parse up the string data into something we care about
    // in this case: user credentials
    const creds = data.split('&').map(el => el.split('=')[1]);
    if (creds[0] === user.username && creds[1] === user.pw) {
      user.signedIn = true;
      res.status(200).end();
    } else {
      res.status(400).end();
    }
  })
});

/* 
** In this route, we check to see if a user has a 'session'. In our simple application, all that means
** is that we check to see if a user has signed in or not. Since we only have one loyal user of our 
** incredibly useful application, we only need to check to see if 'cat' has signed in. 
*/
app.get('/session', (req, res) => {
  req.on('data', () => {})
    .on('end', () => {
      if (user.signedIn) {
        // if the user has a "session" (or is signed in), send back a 200OK response to the main app server
        res.status(200).end()
      } else {
        // if the user does not have a "session" (or is signed in), 
        // send back a 400Error response to the main app server
        res.status(400).end();
      }
    });
})


/*------ Tell our server to listen to port 4000 ------*/
app.listen(4000, () => {
  console.log('auth listening on 4000') 
})