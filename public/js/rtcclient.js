class RtcClient extends EventEmitter {
  constructor() {
    
    super();
    
    this.id = generateName();
    this.ss = null;
    this.pc = null;
    this.receiveChannel = null;
    
    this.openWebSocketServer()
      .then(() => {
        return this.createRTCPeerConnection(
          {
            'iceServers': [{
              'urls': 'stun:stun.l.google.com:19302'
            }]
          },
          document.querySelector('video')
        );
      })
      .then(this.sayHello.bind(this))
      .catch((error) => {
        console.error(error);
      });
    
  }
  
  openWebSocketServer() {
  
    return new Promise((resolve, reject) => {

      this.ss = new WebSocket('wss://head-signals.glitch.me/?id=' + this.id);

      this.ss.onopen = (eventListener) => {
        console.log('signal server open');
        resolve(this.ss);
      };

      this.ss.onmessage = (messageEvent) => {
        let message = JSON.parse(messageEvent.data);

        console.log('signal server message', message);

        if (message.msg === 'got user media') {

        } else if (message.msg.type === 'offer') {

          this.pc.setRemoteDescription(new RTCSessionDescription(message.msg))
            .then(() => {
              return this.pc.createAnswer();
            })
            .then((answer) => {
              return this.pc.setLocalDescription(answer);
            }).then(() => {
              this.ss.sendMessage('HEAD-SERVER', this.pc.localDescription);
            })
            .catch((error) => {
              console.log(error);
            });



        } else if (message.msg.type === 'answer') {

          this.pc.setRemoteDescription(new RTCSessionDescription(message.msg));

        } else if (message.msg.candidate) {

          var candidate = new RTCIceCandidate({
            sdpMLineIndex: message.msg.label,
            candidate: message.msg.candidate
          });
          this.pc.addIceCandidate(candidate);

        } else {
          console.error(message);
        }

      };

      this.ss.onclose = () => {
        console.log('signal server closed');
        this.openWebSocketServer()
          .catch((error) => {
            console.error(error);
          });
      }

      this.ss.onerror = (error) => {
        reject(error);
      }

      this.ss.sendMessage = (to, msg) => {
        if (this.ss) {

          this.ss.send(JSON.stringify({
            to: to,
            msg: msg
          }));
        }
      }


    });
  }
  
  sayHello() {
    return new Promise((resolve, reject) => {
      this.ss.sendMessage('HEAD-SERVER', {type: 'hello'});

      console.log('say hello');

      resolve();
    });
  }
  
  createRTCPeerConnection(config, video) {
    return new Promise((resolve, reject) => {

      console.log('create RTCPeerConnection');

      this.pc = new RTCPeerConnection(config);

      this.pc.ondatachannel = handleDataChannelEvent.bind(this);
      this.pc.onaddstream = handleRemoteStreamAdded.bind(this);
      this.pc.onicecandidate = handleICECandidateEvent.bind(this);
      this.pc.onnremovestream = handleRemoveStreamEvent.bind(this);
      this.pc.oniceconnectionstatechange = handleICEConnectionStateChangeEvent.bind(this);
      this.pc.onicegatheringstatechange = handleICEGatheringStateChangeEvent.bind(this);
      this.pc.onsignalingstatechange = handleSignalingStateChangeEvent.bind(this);
      this.pc.onnegotiationneeded = handleNegotiationNeededEvent.bind(this);

      function handleDataChannelEvent(event) {
        this.receiveChannel = event.channel;
        this.receiveChannel.onmessage = handleReceiveMessage.bind(this);
        this.receiveChannel.onopen = handleReceiveChannelStatusChange.bind(this);
        this.receiveChannel.onclose = handleReceiveChannelStatusChange.bind(this);
      }
      
      function handleReceiveChannelStatusChange(event) {
        if (this.receiveChannel) {
          console.log(event);
        }
      }
      
      function handleReceiveMessage(event) {
        
        try {
         
          console.log(event);
          
          let message = JSON.parse(event.data);
          
          this.emit(message.event, message.params);
          
        } catch(e) {
          console.log(e);
        }
      }
      
      function handleRemoteStreamAdded(event) {
        console.log('Remote stream added.');
        video.src = window.URL.createObjectURL(event.stream);
        window.remoteStream = event.stream;
      }

      function handleICECandidateEvent(event) {
        console.log('handleICECandidateEvent', event.candidate);
        if (event.candidate) {
          console.trace(event.candidate);
          this.ss.sendMessage('HEAD-SERVER', event.candidate);
        }
      }

      function handleRemoveStreamEvent(event) {
        console.log('handleRemoveStreamEvent');
      }

      function handleICEConnectionStateChangeEvent(event) {
        console.log('handleICEConnectionStateChangeEvent', this.pc.iceConnectionState);

        if (this.pc.iceConnectionState === "failed" || this.pc.iceConnectionState === "disconnected" || this.pc.iceConnectionState === "closed") {

          setTimeout(() => {
            this.sayHello.bind(this);
          }, 2000);

        }
      }

      function handleICEGatheringStateChangeEvent(event) {
        console.log('handleICEGatheringStateChangeEvent', this.pc.iceGatheringState, this.pc.iceConnectionState);
        if (this.pc.iceGatheringState) {

        }
      }

      function handleSignalingStateChangeEvent(event) {
        console.log('handleSignalingStateChangeEvent', this.pc.signalingState);
      }

      function handleNegotiationNeededEvent(event) {
        console.log('handleNegotiationNeededEvent');
      }

      resolve(this.pc);

    });
  }
  
}
