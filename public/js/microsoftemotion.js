class MicrosoftEmotion extends EventEmitter  {
  constructor() {
    super();
    this.class = null;
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
        
        fetch('/microsoft-emotion', {
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
                    
                this.class = data;
                this.emit('loaded', this.class);
return;
                var msg = 'Where are you?',
                  feeling =null;

                
                if (data.length) {
                  
                  msg = `Hi there.  I think you are ${data[0].faceAttributes.age} year old ${data[0].faceAttributes.gender}. `;
                  
                  if (!data[0].faceAttributes.hair.hairColor) {
                    
                    var facialHair = Object.keys(data[0].faceAttributes.facialHair)
                      .reduce((a, b) => { 
                        return data[0].faceAttributes.facialHair[a] > data[0].faceAttributes.facialHair[b] ? a : b;
                      });
                    
                    if (data[0].faceAttributes.facialHair[facialHair] > 0.8) {
                      msg += `You have ${this._getHairColour(data[0].faceAttributes.hair.hairColor, data[0].faceAttributes.facialHair)} hair and nice ${facialHair}. `;
                    } else {
                      msg += `You have ${this._getHairColour(data[0].faceAttributes.hair.hairColor, data[0].faceAttributes.facialHair)} hair. `;
                    }
                  }
                  
                  if (data[0].faceAttributes.makeup.eyeMakeup || data[0].faceAttributes.makeup.lipMakeup) {
                    
                    msg += 'Why the makeup?  Party tonight? ';
                    
                  }
                  
                  var emotion = Object.keys(data[0].faceAttributes.emotion)
                      .reduce((a, b) => { 
                        return data[0].faceAttributes.emotion[a] > data[0].faceAttributes.emotion[b] ? a : b;
                      });

                  switch (emotion) {
                    case "anger":
                      feeling = 'Feeling angry much?'
                      break;
                    case "contempt":
                      feeling = 'Feeling contemptful?'
                      break;
                    case "disgust":
                      feeling = 'Feeling disgusted?'
                      break;
                    case "fear":
                      feeling = 'Feeling afraid?'
                      break;
                    case "happiness":
                      feeling = 'Feeling happy?'
                      break;
                    case "neutral":
                      break;
                    case "sadness":
                      feeling = 'Are you feeling sad?'
                      break;
                    case "surprise":
                      feeling = 'Feeling suprised?'
                      break;
                  }
                  
                  if (data[0].faceAttributes.glasses != 'NoGlasses') {
                    msg += `I like your ${data[0].faceAttributes.glasses}. `;
                  }
                  
                  
                  ctx.lineWidth = 10;
                  ctx.strokeStyle = 'rgba(0, 0, 0, .5)';
                  
                  roundedRect(ctx, data[0].faceRectangle.left, data[0].faceRectangle.top, data[0].faceRectangle.width, data[0].faceRectangle.height, 15);
                  
                } 

                this._notification.on(msg, chance.first() + ' Microsofty', feeling, null, null, c.toDataURL());            
                
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
  
  _getHairColour(colours) {
    
    var options = {};
    
    for (var i in colours) {
      options[colours[i].color] = colours[i].confidence;
    }
    
    //distance
    return Object.keys(options)
      .reduce((a, b) => { 
        return options[a] > options[b] ? a : b;
      });
    
  }
}