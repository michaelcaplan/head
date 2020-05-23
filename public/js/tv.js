"use strict";

class Tv {

  constructor() {
    this._on = false;
    this._initCanvas();
    this._initAudio();
  }
  
  _initAudio() {
    this._audioContext = new AudioContext();
    var bufferSize = this._audioContext.sampleRate * 2;
    this._noiseBuffer = this._audioContext.createBuffer(1, bufferSize, this._audioContext.sampleRate);
    var output = this._noiseBuffer.getChannelData(0);
    
    for (var i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  }
  
  _initCanvas() {
    this.c =  document.createElement('canvas');
    this.c.id  = "tv";
    this.c.style.position = 'absolute';
    this.c.style.left = '0%';
    this.c.style.top = '0%';
    this.c.style.width  = '100%';
    this.c.style.height = '100%';
    this.c.style.zIndex = '-1';
    document.body.appendChild(this.c);
    this.ctx = this.c.getContext("2d");
  }
  
  on() {
    this._on = true;
    this.c.style.zIndex = '100';
    this._draw();
    this._whiteNoiseOn();
  }
  
  _whiteNoiseOn() {
    
    if (this._whiteNoise) {
      this._whiteNoise.stop();
    }
    
    this._whiteNoise = this._audioContext.createBufferSource();
    this._whiteNoise.buffer = this._noiseBuffer;
    this._whiteNoise.loop = true;
    this._whiteNoise.connect(this._audioContext.destination);
    this._whiteNoise.start(0);
  }
  
  off() {
    this._on = false;
    if (this._whiteNoise) {
      this._whiteNoise.stop();
    }
    this.c.style.zIndex = '-100';
  }
  
  isOn() {
    return this._on;
  }
  
  _draw() {
    if (!this._on) {
      return;
    }
    
    this.ctx.save();
    let imgData = this.ctx.createImageData(320, 240);
    
    for (let i = 0; i < imgData.data.length; i += 4) {
      let t = Math.floor(Math.random() * 256);
      imgData.data[i + 0] = t;
      imgData.data[i + 1] = t;
      imgData.data[i + 2] = t;
      imgData.data[i + 3] = 255;
    }
    
    this.ctx.putImageData(imgData, 0, 0, 0, 0, this.c.width, this.c.height);
    this.ctx.restore();
    setTimeout(this._draw.bind(this), 100);
  }
  
}