/*
** This module sets up the main application server. This server will handle receiving requests from the client
** It will then route the requests to the appropriate service when necessary. In this scenario, we are using
** only one additional service - authentication service - and we will set up a very simple login routing using
** the NodeJS Streams API. 
**
** We do not include the commonly used body-parser npm module because the stream body needs to be raw data to be
** read using the NodeJS Stream API; hence, the use of req.on('data', cb) & req.on('end', cb).
**
**
** Remember, this is only a demo to help you get familiar with the concept of streams and how they are passed
** around. This is not a complete authentication service implementation.
** 
** Play around with the code and move things as you see fit. Break it, then fix it. 
** 
*/

const [express,request] = [require('express'), require('request')];

const app = express();

/*------ Tell our server where the static files are located in our file system ------*/
app.use(express.static(__dirname));



/*------ Set up our routes ------*/
app.post('/signin', (req, res, next) => {
  const path = '/auth';
  authenticate(req, res, next, path);
});

app.get('/restricted', (req, res, next) => {
  const path = '/session';
  authenticate(req, res, next, path);
});




/* 
** In this "authenticate" function we will be doing the following: 
**
** Stream the request coming in, to the auth server. 
** The auth server will handle processing this request. 
** The main server is only responsible for passing it along to the appropriate service
** and then sending back a response to the client when it gets a response back from the service.
** 
** Something neat you can do, if your server is simply a middle man and nothing more, is
** `req.pipe([destination]).pipe(res)`
** 
** This simply sends the request to the destination, then sends the response from that destination to the
** client. Remember that a.pipe(b) returns `b` and HTTP requests and responses are both Writeable 
** and Readable Streams.
** 
** Check out NodeJS Stream API: https://nodejs.org/api/stream.html for more details and references to resources.
**
** docs.nodejitsu.com is also another great resource for this.
**
*/

/*------ Define the "authenticate" function being used in the route handlers above ------*/
const authServer = 'http://localhost:4000';
function authenticate(req, res, next, path) {
  // a.pipe(b) ====> returns b
  // transfer the req from the client into the req to the authentication server
  // save the response that gets returned into a variable so we can run some functions on it later
  const response = req.pipe(request.get(authServer + path));


  /*
  ** When we get a response back from the auth server let's check to 
  ** see if the response is a 200OK response or if it is an Error response
  */
  response.on('response', () => {
    const statusCode = response.responseContent.statusCode;

    // if the response is 200OK
    if (statusCode === 200) {
      // send the restricted file to the client
      res.sendFile('./restricted.html', {root: '.'})
    } else {
      // if it is not ok, redirect the client back to the / 
      // (in this case, this path sends them to the signin page)
      res.redirect('/');
    }
  });

}

/*------ Tell our server to listen to port 3000 ------*/
app.listen(3000, () => { console.log('listening on 3000')})