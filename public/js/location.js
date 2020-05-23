class Location extends EventEmitter {
  constructor() {
    
    super();
    
    this.position = null;
    this.ready = false;
    
    navigator.geolocation.getCurrentPosition(
      this._handleGetCurrentPosition.bind(this), 
      this._handleGetCurrentPositionError.bind(this)
    );
    
  }
  
  _handleGetCurrentPosition(position) {
    this.position = position;
    this.ready = true;
    this.emit('loaded', position);
  }
  
  _handleGetCurrentPositionError(error) {
    console.log(error);
  }
  
}