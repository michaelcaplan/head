class Weather extends EventEmitter {
  constructor(position) {
    super();
    this.position  = position;
    this.ready = false;
    this.weather = null;
    
    if (!this.position.ready) {
        this.position.on('loaded', () => {
          this._getWeather();
        });
    } else {
      this._getWeather();
    }
    
    this._notification = new Notification();
    
    this._notification.addListener('done', () => {
      this.emit('done');
    });
    
  }
  
  _getWeather() {

    fetch('/weather?latitude=' + this.position.position.coords.latitude + '&longitude=' + this.position.position.coords.longitude)
      .then(
        (response) => {
          if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' + response.status);
            return;
          }

          // Examine the text in the response
          response.json().then((data) => {
            this.weather = data;
            this.emit('loaded', this.weather);
          });
        }
      )
      .catch((err) => {
        console.log('Fetch Error :-S', err);
      });
    
  }
  
  on() {
    if (this.weather) {
      
      var date = new Date();
      date.setTime(this.weather.dt * 1000);
      var hour = date.getHours(),
        time = 'day',
        feeling = 'feeling nice';
      
      if (this.weather.main.temp > 32) {
        feeling = 'feeling smoking hot!';
      } else if (this.weather.main.temp > 28) {
        feeling = 'feeling hot!';
      } else if (this.weather.main.temp > 18) {
        feeling = 'feeling nice';
      } else if (this.weather.main.temp > 4) {
        feeling = 'feeling fall like';
      } else if (this.weather.main.temp < -10) {
        feeling = 'feeling brutally cold!';
      } else if (this.weather.main.temp < 5) {
        feeling = 'feeling cold';
      }
      
      if (hour <= 4 || hour >= 18) {
        time = 'night';
      } else if (hour >= 5 && hour < 12) {
        time = 'morning';
      } else  {
        time = 'afternoon';
      }
      
      let msg = `Quite the ${time} we are having with ${this.weather.weather[0].description.substr(-1) != 's' ? 'this' : 'these'} ${this.weather.weather[0].description}`;
      
      this._notification.on(msg, null, feeling, 'https://openweathermap.org/img/w/' + this.weather.weather[0].icon + '.png', this.weather.name);
    }
  }
}