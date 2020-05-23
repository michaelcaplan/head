class KairosDetect extends EventEmitter  {
  constructor() {
    super();
    this.face = null;
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
        
        fetch('/kairos-detect', {
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
                
                this.face = data;
                this.emit('loaded', this.face);

                var msg = 'Anybody home?';

                if (data.hasOwnProperty('Errors')) {
                  
                  var items = [];
                  
                  for (var obj in data.Errors) {
                    items.push(data.Errors[obj].Message);
                  }
                  
                  msg = items.join('. ') + '.';
                  
                } else if (data.images[0].faces.length) {
                  msg = `Hello ${data.images[0].faces[0].attributes.age} year old ${data.images[0].faces[0].attributes.gender.type == 'M' ? 'male' : 'female' }. `;

                  var colours = {
                    asian: data.images[0].faces[0].attributes.asian,
                    black: data.images[0].faces[0].attributes.black,
                    hispanic: data.images[0].faces[0].attributes.hispanic,
                    white: data.images[0].faces[0].attributes.white,
                    other: data.images[0].faces[0].attributes.other
                  }
                  
                  //distance
                  var colour = Object.keys(colours)
                    .reduce((a, b) => { 
                      return colours[a] > colours[b] ? a : b;
                    });

                  if (colours[colour] > 0) {

                    switch (colour) {
                      case 'asian' :
                        msg += 'Am I right that you are of Asian descent?';
                        break;
                      case 'black' :
                        msg += 'Am I right that you are of African descent?';
                        break;
                      case 'hispanic' :
                        msg += 'Am I right that you are of Hispanic descent?';
                        break;
                      case 'white' :
                        msg += 'Am I right that you are of European descent?';
                        break;
                    }

                  }

                  ctx.fillStyle = 'rgba(0, 0, 0, .2)';

                  ctx.fillRect(data.images[0].faces[0].chinTipX - 20, data.images[0].faces[0].chinTipY - 20, 40, 40);
                  ctx.fillRect(data.images[0].faces[0].rightEyeCenterX - 40, data.images[0].faces[0].rightEyeCenterY - 40, 80, 80);
                  ctx.fillRect(data.images[0].faces[0].leftEyeCenterX - 40, data.images[0].faces[0].leftEyeCenterY - 40, 80, 80);
                  ctx.fillRect(data.images[0].faces[0].topLeftX - 10, data.images[0].faces[0].topLeftY - 10, 20, 20);
                } 

                this._notification.on(msg, chance.first() + ' Kairos', null, null, null,  c.toDataURL());            
                
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