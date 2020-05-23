class Kairos extends EventEmitter  {
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
        
        fetch('/kairos', {
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

                var msg = 'Come closer.  I can\'t see you.',
                    feeling = null;

                if (data.frames[0].people.length) {
                  msg = `Hello ${data.frames[0].people[0].demographics.gender.toLowerCase()} ${data.frames[0].people[0].demographics.age_group.toLowerCase()}.`;

                  if (data.frames[0].people[0].appearance.glasses == 'Yes') {
                    msg += ' Nice glasses.';
                  }

                  //distance
                  var emotion = Object.keys(data.frames[0].people[0].emotions)
                    .reduce((a, b) => { 
                      return data.frames[0].people[0].emotions[a] > data.frames[0].people[0].emotions[b] ? a : b;
                    });

                  if (data.frames[0].people[0].emotions[emotion] > 0) {

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
                      case 'joy' :
                        feeling = 'Looking joyful';
                        break;
                      case 'sadness' :
                        feeling = 'Looking sad';
                        break;
                      case 'surprise' :
                        feeling = 'Looking surprised';
                        break;
                    }

                  } else {
                    msg += ' You look bored.';
                  }
                  
                  ctx.lineWidth = 10;
                  ctx.strokeStyle = 'rgba(0, 0, 0, .5)';

                  roundedRect(ctx, data.frames[0].people[0].face.x, data.frames[0].people[0].face.y, data.frames[0].people[0].face.width, data.frames[0].people[0].face.height, 15);
                  
                  for (var i in data.frames[0].people[0].landmarks) {
                    for (var x in data.frames[0].people[0].landmarks[i]) {
                      ctx.fillRect(data.frames[0].people[0].landmarks[i][x].x, data.frames[0].people[0].landmarks[i][x].y, 5, 5); 
                    }
                  }

                } 

                this._notification.on(msg, chance.first() + ' Kairos', feeling, null, null, c.toDataURL());            
                
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