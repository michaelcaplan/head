class Face extends EventEmitter  {
  constructor() {
    super();
    this.emotion = null;
    this._video = document.querySelector('video');
    this._notification = new Notification();
    
    this._notification.addListener('done', () => {
      this.emit('done');
    });
  }
  
  on() {
    var data = new FormData();
    
    var c =  document.createElement('canvas');
    
    c.width  = this._video.videoWidth;
    c.height = this._video.videoHeight;
    var ctx = c.getContext("2d");
    
    ctx.drawImage(this._video, 0, 0, this._video.videoWidth, this._video.videoHeight);
    
    
    c.toBlob(
      (blob) => {
        data.append('source', blob);
        
        fetch('/face', {
          method: 'POST',
          body: data
        })
          .then(
            (response) => {
              if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' + response.status);
                return;
              }
              
              // Examine the text in the response
              return response.json().then((data) => {
                
                console.log(data);
                    
                this.emotion = data;
                this.emit('loaded', this.emotion);

                var msg = 'Anybody home?',
                    feeling = null;

                if (data.faces.length) {
                  msg = `Hey ${data.faces[0].attributes.ethnicity.value.toLowerCase()} ${data.faces[0].attributes.gender.value.toLowerCase()}.  You gotta be ${data.faces[0].attributes.age.value} years old.`;
                  
                  if (data.faces[0].attributes.glass.value != 'None') {
                    msg += ' Nice glasses.';
                  }

                  if (data.faces[0].attributes.gender.value == 'Male') {
                    msg += ` I give you a ${parseInt(data.faces[0].attributes.beauty.male_score, 10)} out of 100.`;
                  } else {
                    msg += ` I give you a ${parseInt(data.faces[0].attributes.beauty.female_score, 10)} out of 100.`;
                  }
                  
                  //distance
                  var emotion = Object.keys(data.faces[0].attributes.emotion)
                    .reduce((a, b) => { 
                      return data.faces[0].attributes.emotion[a] > data.faces[0].attributes.emotion[b] ? a : b;
                    });

                  if (data.faces[0].attributes.emotion[emotion] > 0) {

                    switch (emotion) {
                      case 'anger' :
                        feeling = 'Looking angry';
                        break;
                      case 'disgust' :
                        feeling = 'Looking disgusted';
                        break;
                      case 'fear' :
                        feeling = 'Looking fearful';
                        break;
                      case 'happiness' :
                        feeling = 'Looking happy';
                        break;
                      case 'sadness' :
                        feeling = 'Looking sad';
                        break;
                      case 'surprise' :
                        feeling = 'Looking surprised';
                        break;
                    }

                  } else {
                    msg += ' You look board.';
                  }

                  ctx.lineWidth = 10;
                  ctx.strokeStyle = 'rgba(0, 0, 0, .5)';

                  roundedRect(ctx, data.faces[0].face_rectangle.left, data.faces[0].face_rectangle.top, data.faces[0].face_rectangle.width, data.faces[0].face_rectangle.height, 15);
                  
                  for (var i in data.faces[0].landmark) {
                  
                    ctx.fillRect(data.faces[0].landmark[i].x, data.faces[0].landmark[i].y, 5, 5); 
                  }
                  
                } 
                
                this._notification.on(msg, chance.first() + ' Face++', feeling, null, null, c.toDataURL());            
                
              });
            }
          )
          .catch((err) => {
            console.log('Fetch Error :-S', err);
          });
        
      },
      'image/jpeg',
      0.85
    );
    
  }
}