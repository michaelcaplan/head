var tv = new Tv();
var loc = new Location();
var weather = new Weather(loc);
var kairos = new Kairos();
var kairosdetect = new KairosDetect();
var watson = new Watson();
var watsonfaces = new WatsonFaces();
var microsoft = new Microsoft();
var microsoftemotion = new MicrosoftEmotion();
var microsoftdescribe = new MicrosoftDescribe();
var face = new Face();
var notification = new Notification();
var timer = null;

var actions = [
  weather,
  kairos,
  kairosdetect,
  watson,
  watsonfaces,
  microsoft,
  microsoftdescribe,
  face
];

if (window.location.search.indexOf('head') != -1) {
  
  tv.on();

  document.addEventListener('keydown', (event) => {
    const keyName = event.key;

    if (keyName == ' ') {
      
      if (tv.isOn()) {

        tv.off();

        rtc.sendEventToAll('tv', {on: false});

        timer = setInterval(runJobs, 4000);

        setTimeout(runJobs, 3000);
      }
    }
  });

  document.addEventListener('keyup', (event) => {
    const keyName = event.key;

    if (keyName == ' ') {
      if (!tv.isOn()) {
        
        tv.on();

        rtc.sendEventToAll('tv', {on: true});

        clearInterval(timer);
      }
    }
  });
  
  var rtc = new RtcServer();
  
  rtc.sendEventToAll('tv', {on: true});
  
  rtc.on('client-connected', (id) => {
    
    if (tv.isOn()) {
      rtc.sentEventTo(id, 'tv', {on: true});
    }
    
  });
  
  
  
} else  {
  
  var rtc = new RtcClient();
  var dirty = false;
  
  rtc.on('tv', (params) => {
    if (params.on) {
      tv.on();
    } else {
      tv.off();
    }
  });
  
  for (const action in actions) {
    
    actions[action].addListener('done', () => {
      dirty = false;
    });
    
    rtc.on(actions[action].constructor.name, (params) => {
      
      if  (!dirty) {

        dirty = true;

        actions[action].on(params);
      }
    });
    
  }
  
  
}

function generateName() {
  let name = chance.prefix() + '-' + chance.first() + '-' + chance.last() + '-' + chance.suffix();

  return name.replace(/[ .]/g, "").toUpperCase();
}

function runJobs() {

  if (tv.isOn()) {
    return;
  }
  
  var pcKeys = Object.keys(rtc.pcs);
  
  var pc = pcKeys[Math.floor(Math.random() * pcKeys.length)];
  var rand = actions[Math.floor(Math.random() * actions.length)];
  rtc.sentEventTo(pc, rand.constructor.name);
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x, y + radius);
  ctx.lineTo(x, y + height - radius);
  ctx.arcTo(x, y + height, x + radius, y + height, radius);
  ctx.lineTo(x + width - radius, y + height);
  ctx.arcTo(x + width, y + height, x + width, y + height-radius, radius);
  ctx.lineTo(x + width, y + radius);
  ctx.arcTo(x + width, y, x + width - radius, y, radius);
  ctx.lineTo(x + radius, y);
  ctx.arcTo(x, y, x, y + radius, radius);
  ctx.stroke();
}