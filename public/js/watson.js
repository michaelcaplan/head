class Watson extends EventEmitter  {
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
        
        fetch('/watson', {
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

                if (data.images[0].classifiers[0].classes.length) {
                  
                  msg = `I see ${data.images[0].classifiers[0].classes.length} ${data.images[0].classifiers[0].classes.length == 1 ? 'thing' : 'things'}. `;
                  
                  var items = [];
                  
                  for (var obj in data.images[0].classifiers[0].classes) {
                    items.push(data.images[0].classifiers[0].classes[obj].class);
                  }
                  
                  msg += items.join(', ') + '.';

                } 

                this._notification.on(msg, chance.first() + ' Watson', null, null, null, URL.createObjectURL(blob));            
                
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