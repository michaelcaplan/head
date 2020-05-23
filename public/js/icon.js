class Icon {
  constructor() {
    this._video = document.querySelector('video');
  }
  
  get() {
    var x = (this._video.videoWidth - this._video.videoHeight) / 2,
        c =  document.createElement('canvas');
    
    c.width  = 40;
    c.height = 40;
    var ctx = c.getContext("2d");
    
    ctx.drawImage(this._video, x, 0, this._video.videoWidth - ( x * 2), this._video.videoHeight, 0, 0, 40, 40);
    
    var d = c.toDataURL('image/png');
    
    return d;
  }
}