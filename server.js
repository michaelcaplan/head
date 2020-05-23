// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
const fetch = require('node-fetch');
const FormData = require('form-data');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/weather", (request, response) => {
  
  const url = 'https://api.openweathermap.org/data/2.5/weather?lat=' + request.query.latitude + '&lon=' + request.query.longitude + '&APPID=' + process.env.OPENWEATHERMAP + '&units=metric';
  
  fetch(url)
      .then(
        (res) => {
          if (res.status !== 200) {
            response.sendStatus(res.status);
            return;
          }

          // Examine the text in the response
          res.json().then((data) => {
            response.json(data);
          });
        }
      )
      .catch((err) => {
        response.sendStatus(500);
        response.send(err);
      });
  
  
});

app.post("/kairos", upload.any(), (request, response) => {
  
  var data = new FormData();
  
  data.append('source', request.files[0].buffer, {
    filename: 'source.jpg',
    contentType: 'image/jpeg'
  });
  
  var headers = data.getHeaders()

  headers['app_id'] = process.env.KAIROS_APP_ID;
  headers['app_key'] = process.env.KAIROS_APP_KEY;
        
  // const url = 'http://httpbin.org/post';
  const url = 'https://api.kairos.com/v2/media?timeout=60&landmarks=1';
  
  fetch(url, {
    method: 'POST',
    headers: headers,
    body: data
  })
    .then(
      (res) => {
        if (res.status !== 200) {
          console.log(res);
          response.sendStatus(res.status);
          return;
        }

        // Examine the text in the response
        return res.json().then((data) => {
         
          return data;                

        });
      }
    ).then((data) => {

      if (data.code) {
        console.log(data);
        response.sendStatus(500);
        return;
      }
        
      headers = {
        app_id: process.env.KAIROS_APP_ID,
        app_key: process.env.KAIROS_APP_KEY
      }
    
      return fetch('https://api.kairos.com/v2/media/' + data.id, {
            method: 'GET',
            headers: headers
          }).then((res) => {

            if (res.status !== 200) {
              response.sendStatus(res.status);
              return;
            }

            // Examine the text in the response
            res.json().then((data) => {
              response.json(data);

            }).catch((err) => {
              console.log(err);
              response.sendStatus(500);
            });

          });

    })
    .catch((err) => {
      console.log(err);
      response.sendStatus(500);
    });
});

app.post("/kairos-detect", upload.any(), (request, response) => {
  
  var data = new FormData();
  
  data.append('image', request.files[0].buffer, {
    filename: 'image.jpg',
    contentType: 'image/jpeg'
  });
  
  var headers = data.getHeaders()

  headers['app_id'] = process.env.KAIROS_APP_ID;
  headers['app_key'] = process.env.KAIROS_APP_KEY;
        
  const url = 'https://api.kairos.com/detect';
  
  fetch(url, {
    method: 'POST',
    headers: headers,
    body: data
  })
    .then(
      (res) => {
        if (res.status !== 200) {
          console.log(res);
          response.sendStatus(res.status);
          return;
        }

        // Examine the text in the response
        return res.json().then((data) => {
         
          response.json(data);          

        });
      }
    )
    .catch((err) => {
      console.log(err);
      response.sendStatus(500);
    });
});

app.post("/watson", upload.any(), (request, response) => {
  
  var data = new FormData();
  
  
  data.append('images_file', request.files[0].buffer, {
    filename: 'image.jpg',
    contentType: 'image/jpeg'
  });
        
  const url = `https://gateway-a.watsonplatform.net/visual-recognition/api/v3/classify?api_key=${process.env.WATSON}&version=2016-05-20`;
  
  fetch(url, {
    method: 'POST',
    body: data
  })
    .then(
      (res) => {
        if (res.status !== 200) {
          console.log(res);
          response.sendStatus(res.status);
          return;
        }

        // Examine the text in the response
        return res.json().then((data) => {
         
          response.json(data);          

        });
      }
    )
    .catch((err) => {
      console.log(err);
      response.sendStatus(500);
    });
});

app.post("/watson-faces", upload.any(), (request, response) => {
  
  var data = new FormData();
  
  
  data.append('images_file', request.files[0].buffer, {
    filename: 'image.jpg',
    contentType: 'image/jpeg'
  });
        
  const url = `https://gateway-a.watsonplatform.net/visual-recognition/api/v3/detect_faces?api_key=${process.env.WATSON}&version=2016-05-20`;
  
  fetch(url, {
    method: 'POST',
    body: data
  })
    .then(
      (res) => {
        if (res.status !== 200) {
          console.log(res);
          response.sendStatus(res.status);
          return;
        }

        // Examine the text in the response
        return res.json().then((data) => {
         
          response.json(data);          

        });
      }
    )
    .catch((err) => {
      console.log(err);
      response.sendStatus(500);
    });
});


app.post("/microsoft", upload.any(), (request, response) => {
          
  const url = `https://eastus2.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=1&returnFaceLandmarks=1&returnFaceAttributes=age,gender,smile,facialHair,glasses,emotion,hair,makeup,accessories`;
  
  fetch(url, {
    method: 'POST',
    body: request.files[0].buffer,
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.AZURE_FACE1,
      'Content-Type': 'application/octet-stream'
    }
  })
    .then(
      (res) => {
        if (res.status !== 200) {
          console.log(res);
          response.sendStatus(res.status);
          return;
        }

        // Examine the text in the response
        return res.json().then((data) => {
         
          response.json(data);          

        });
      }
    )
    .catch((err) => {
      console.log(err);
      response.sendStatus(500);
    });
});


app.post("/microsoft-emotion", upload.any(), (request, response) => {
          
  const url = `https://westus.api.cognitive.microsoft.com/emotion/v1.0/recognize`;
  
  console.log(request.files[0].buffer.length);
  
  fetch(url, {
    method: 'POST',
    body: request.files[0].buffer,
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.AZURE_EMOTION1,
      'Content-Type': 'application/octet-stream'
    }
  })
    .then(
      (res) => {
        if (res.status !== 200) {
          console.log(res);
          response.sendStatus(res.status);
          res.json().then((data) => {
         
            console.log(data);

          });
          return;
        }

        // Examine the text in the response
        return res.json().then((data) => {
         
          response.json(data);          

        });
      }
    )
    .catch((err) => {
      console.log(err);
      response.sendStatus(500);
    });
});

app.post("/microsoft-describe", upload.any(), (request, response) => {
          
  const url = `https://eastus2.api.cognitive.microsoft.com/vision/v1.0/describe?maxCandidates=1`;
  
  console.log(request.files[0].buffer.length);
  
  fetch(url, {
    method: 'POST',
    body: request.files[0].buffer,
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.AZURE_VISION1,
      'Content-Type': 'application/octet-stream'
    }
  })
    .then(
      (res) => {
        if (res.status !== 200) {
          console.log(res);
          response.sendStatus(res.status);
          res.json().then((data) => {
         
            console.log(data);

          });
          return;
        }

        // Examine the text in the response
        return res.json().then((data) => {
         
          response.json(data);          

        });
      }
    )
    .catch((err) => {
      console.log(err);
      response.sendStatus(500);
    });
});

app.post("/face", upload.any(), (request, response) => {
  
  var data = new FormData();
  
  data.append('image_file', request.files[0].buffer, {
    filename: 'image_file.jpg',
    contentType: 'image/jpeg'
  });
  
  data.append('api_key', process.env.FACE_KEY);
  data.append('api_secret', process.env.FACE_SECRET);
  data.append('return_landmark', 1);
  data.append('return_attributes', 'gender,age,smiling,eyestatus,emotion,ethnicity,beauty,mouthstatus,eyegaze,skinstatus');
  
  var headers = data.getHeaders()

        
  // const url = 'http://httpbin.org/post';
  const url = 'https://api-us.faceplusplus.com/facepp/v3/detect';
  
  fetch(url, {
    method: 'POST',
    headers: headers,
    body: data
  })
    .then(
      (res) => {
        if (res.status !== 200) {
          console.log(res);
          response.sendStatus(res.status);
          return;
        }

        // Examine the text in the response
        return res.json().then((data) => {
         
          response.json(data);             

        });
      }
    )
    .catch((err) => {
      console.log(err);
      response.sendStatus(500);
    });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
