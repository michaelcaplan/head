class WatsonFaces extends EventEmitter  {
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
        
        fetch('/watson-faces', {
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

                var msg = 'I don\'t see anything...';

                if (data.images[0].faces.length) {
                  
                  msg = `I see ${data.images[0].faces.length == 1 ? 'you' : data.images[0].faces.length + ' faces'}. `;
                  
                  for (var face in data.images[0].faces) {
                    
                    if (data.images[0].faces[face].hasOwnProperty('identity')) {
                      
                      msg += `A ${data.images[0].faces[face].gender.gender.toLowerCase()} between the age of ${data.images[0].faces[face].age.min} and ${data.images[0].faces[face].age.max} who looks alot like ${data.images[0].faces[face].identity.name}. `;
                      
                    } else {
                    
                      msg += `A ${data.images[0].faces[face].gender.gender.toLowerCase()} between the age of ${data.images[0].faces[face].age.min} and ${data.images[0].faces[face].age.max}. `;
                    }
                  }
                  
                  ctx.lineWidth = 10;
                  ctx.strokeStyle = 'rgba(0, 0, 0, .5)';

                  roundedRect(ctx, data.images[0].faces[0].face_location.left, data.images[0].faces[0].face_location.top, data.images[0].faces[0].face_location.width, data.images[0].faces[0].face_location.height, 15);

                } 

                this._notification.on(msg, chance.first() + ' Watson', null, null, null, c.toDataURL());            
                
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