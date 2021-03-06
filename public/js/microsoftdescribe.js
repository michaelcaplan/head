class MicrosoftDescribe extends EventEmitter  {
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
        
        fetch('/microsoft-describe', {
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

                var msg = 'Where are you?',
                  feeling =null;

                
                if (data.description.captions.length) {
                  
                  msg = '';
                  
                  for (var i in data.description.captions) {
                    msg += data.description.captions[i].text + '. ';
                  }

                  if (data.description.tags.length) {
                    feeling = 'Seeing ' + data.description.tags.length + ' things';
                  }
                  
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