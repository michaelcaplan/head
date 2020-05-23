'use strict';

class RtcServer extends EventEmitter {
  constructor() {
    super();
    
    this.id = 'HEAD-SERVER';
    this.ss = null;
    this.pcs = [];
    this.stream = null;

    this.openWebSocketServer()
      .then(() => {
        return this.getVideo({
          audio: false,
          video: {
            width: { ideal: 1280, max: window.outerWidth },
            height: { ideal: 720, max: window.outerHeight }
          }
        },
        document.querySelector('video'))
      })
      .then((s) => {
        this.stream = s;
      })
      .catch((error) => {
        console.log(error);
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

        if (message.to !== this.id) {
          return;
        }

        console.log('signal server message', message);

        if (message.msg.type === 'answer') {

          console.log('Set answer');

          if (this.pcs[message.from]) {

            this.pcs[message.from].setRemoteDescription(new RTCSessionDescription(message.msg))
              .catch((error) => {
                console.log(error);
              });
          }

        } else if (message.msg.type === 'hello') {

          if (this.stream) {
            return this.createRTCPeerConnection(
              message.from,
              {
                'iceServers': [{
                  'urls': 'stun:stun.l.google.com:19302'
                }]
              }
            );
          }
        } else if (message.msg.candidate) {

          var candidate = new RTCIceCandidate({
            sdpMLineIndex: message.msg.label,
            candidate: message.msg.candidate
          });
          this.pcs[message.from].addIceCandidate(candidate);

        } else {
          console.error(message);
        }
      };

      this.ss.onerror = (error) => {
        reject(error);
      };

      this.ss.onclose = () => {
        console.log('signal server closed');
        this.openWebSocketServer()
          .catch((error) => {
            console.error(error);
          });
      }

    });
  }
  
  createRTCPeerConnection(id, config) {
    return new Promise((resolve, reject) => {
      this.pcs[id] = new RTCPeerConnection(config);
      this.pcs[id].addStream(this.stream);
      this.pcs[id].onicecandidate = handleICECandidateEvent.bind(this);
      this.pcs[id].onnremovestream = handleRemoveStreamEvent.bind(this);
      this.pcs[id].oniceconnectionstatechange = handleICEConnectionStateChangeEvent.bind(this);
      this.pcs[id].onicegatheringstatechange = handleICEGatheringStateChangeEvent.bind(this);
      this.pcs[id].onsignalingstatechange = handleSignalingStateChangeEvent.bind(this);
      this.pcs[id].onnegotiationneeded = handleNegotiationNeededEvent.bind(this);
      // this.pcs[id].sendChannel = this.pcs[id].createDataChannel('sendChannel');
      // this.pcs[id].sendChannel.onopen = handleSendChannelStatusChange.bind(this);
      // this.pcs[id].sendChannel.onclose = handleSendChannelStatusChange.bind(this);
      
      function handleSendChannelStatusChange(event) {
        if (this.pcs[id] && this.pcs[id].sendChannel) {
          console.log('handleSendChannelStatusChange', event);
          
          if (event.type == 'open') {
            this.emit('client-connected', id);
          }
        }
      }
      
      function handleICECandidateEvent(event) {
        console.log('handleICECandidateEvent', event.candidate);
        if (event.candidate) {
          console.trace(event.candidate);
          this.sendMessage(id, event.candidate);
        }
      }

      function handleRemoveStreamEvent(event) {
        console.log('handleRemoveStreamEvent');
      }

      function handleICEConnectionStateChangeEvent(event) {
        console.log('handleICEConnectionStateChangeEvent', this.pcs[id].iceConnectionState);

        if (this.pcs[id].iceConnectionState === 'completed') {
          this.pcs[id].sendChannel = this.pcs[id].createDataChannel('sendChannel');
          this.pcs[id].sendChannel.onopen = handleSendChannelStatusChange.bind(this);
          this.pcs[id].sendChannel.onclose = handleSendChannelStatusChange.bind(this);
        } else if (this.pcs[id].iceConnectionState === 'failed') {
          this.pcs[id].close();
          console.error('failed', id);
        } else if (this.pcs[id].iceConnectionState === 'closed') {
          delete this.pcs[id];
        }
      }

      function handleICEGatheringStateChangeEvent(event) {
        console.log('handleICEGatheringStateChangeEvent', this.pcs[id].iceGatheringState);
      }

      function handleSignalingStateChangeEvent(event) {
        if (this.pcs[id]) {
          console.log('handleSignalingStateChangeEvent', this.pcs[id].signalingState);
        }
      }

      function handleNegotiationNeededEvent(event) {
        console.log('handleNegotiationNeededEvent');

        this.pcs[id].createOffer()
          .then((offer) => {
            return this.pcs[id].setLocalDescription(offer);
          })
          .then(() => {
            this.sendMessage(id, this.pcs[id].localDescription);
          })
          .catch(function(error) {
            console.log(error);        
          });
      }

      function handleIceCandidate(event) {
        console.log('icecandidate event: ', event);

      }

      resolve(this.pcs[id]);
    });
  }
  
  getVideo(constraints, video) {
    return navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        video.srcObject = stream;
        return stream;
      })
  }

  sendMessage(to, msg) {
    if (this.ss) {
      this.ss.send(JSON.stringify({
        to: to,
        msg: msg
      }));
    }
  }
  
  sendEventToAll(event, params) {
    for (const pc in this.pcs) {
      this.sentEventTo(pc, event, params);
    }
  }
  
  sendEventToRandom(event, params) {
    for (const pc in this.pcs) {
      this.sentEventTo(pc, event, params);
    }
  }
  
  sentEventTo(pc, event, params) {
    
    if  (this.pcs.hasOwnProperty(pc) && this.pcs[pc].sendChannel.readyState == 'open') {
      
      this.pcs[pc].sendChannel.send(
        JSON.stringify({
          event: event,
          params: params
        })
      );
      
    }
    
  }
  
}