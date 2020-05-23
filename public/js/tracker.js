class Tracker {
  constructor() {
    this._video = document.querySelector('video');
    this._c = document.getElementById('tracker');
    this._clx = this._c.getContext('2d');
    this._ctrack = null;
  }
  
  on() {
    this._c.className = "show";
    
    this._ctrack = new clm.tracker();
    this._ctrack.init();
    
    this._ctrack.start(this._video);
    
    this._drawLoop();
    
    setTimeout(() => {
      this._ctrack.stop();
      this._ctrack.reset();
      this._c.className = "hide";
    }, 10000);
  }
  
  _drawLoop() {
    window.requestAnimationFrame(this._drawLoop.bind(this));
    this._clx.clearRect(0, 0, this._video.width, this._video.height);

    if (this._ctrack.getCurrentPosition()) {
      this._ctrack.draw(this._c);
    }
  }
}