class Notification extends EventEmitter  {
  constructor() {
    
    super();
    
    this._sound = new Howl({
      src: ['https://cdn.glitch.com/8dabbe23-6f23-40cf-8877-54d1645f5df1%2Fping.mp3?1512007156744']
    });
    
    this._icon = new Icon();
    
  }
  
  on (msg, from, feeling, feelingImg, location, img) {

    feelingImg = feelingImg ? feelingImg : 'https://cdn.glitch.com/8dabbe23-6f23-40cf-8877-54d1645f5df1%2Ffeeling.png?1511807536086';
    var imgTag = '';

    if (img) {
      imgTag = `<img src="${img}" class="note-image" width="100%">`;
    }

    var body = `<div class="note-head uk-clearfix">

      <img src="${from ? 'https://api.adorable.io/avatars/40/' + generateName() + '.png' : this._icon.get()}" class="icon uk-float-left"> 
      <div class="note-top-line">
        <span class="uk-text-bold">
          ${(from ? '<a href="">' + from + '</a> <span uk-icon="icon: triangle-right" class="uk-icon-small"></span> ' : '')} 
          <a href="">Me</a>
        </span>
         ${(feeling ? '— <img src="' + feelingImg + '" class="note-feeling">' + feeling : '')}
         ${(location ? 'at <a href=""><i class="fa fa-map-marker" aria-hidden="true"></i> ' + location + '</a>' : '')}
      </div>
      <div class="note-second-line uk-text-small">
        now · 
        <i class="fa fa-globe" aria-hidden="true"></i>
      </div>
    </div>

    <div class="note-body">
      ${msg}
    </div>

    ${(imgTag ? imgTag : '<hr>')}

    <div class="note-share uk-text-meta">
      <span><i class="fa fa-thumbs-o-up" aria-hidden="true"></i> Like</span>

      <span><i class="fa fa-comment-o" aria-hidden="true"></i> Comment</span>

      <span><i class="fa fa-share" aria-hidden="true"></i> Share</span>

    </div>`;
    
    var note = UIkit.notification({
      message: body,
      timeout: 20000
    });
    
    UIkit.util.on(note.$el, 'close', () => {
      console.log('notification close');
      this.emit('done');
    });
    
    // note.addListener('close', () => {
    //   this.emit('done');
    // });

    this._sound.play();

    var utterThis = new SpeechSynthesisUtterance(msg);
    utterThis.voice = this._getRandomVoice();
    utterThis.rate = 0.8;

    utterThis.onend = () => {

      setTimeout(() => {
        note.close();
      }, 4000);
    };

    setTimeout(() => {
      window.speechSynthesis.speak(utterThis);
    }, 1000);


  }
  
  _getRandomVoice() {
  
    var voices = window.speechSynthesis.getVoices();
    var enVoices = [];

    for (var i in voices) {
      if (voices[i].lang.substr(0, 2) == 'en') {
        enVoices.push(voices[i]);
      }
    }

    return enVoices[Math.floor(Math.random() * enVoices.length)]
  }
}