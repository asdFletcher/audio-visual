import React from 'react';
import Horizontal from './Horizontal.js';
import { degToRad } from '../util/util.js';

import nailGunSound from '../sounds/nail-gun.wav';
import nailGunSoundBase64 from '../sounds/nail-gun-base64.js';

function getRectangle(corners, count1, count2) {
  /*

    c1   count1         c2
      .   .   .   .   .
      .   .   .   .   .
      .   .   .   .   .  count2
      .   .   .   .   .
      .   .   .   .   .
    c3                  c4

  */
  let a = [
    [{x:-100, y:-50, z:-50}, {x:-100, y:-25, z:-50}, {x:-100, y:0, z:-50}, {x:-100, y:25, z:-50}, {x:-100, y:50, z:-50}, ],
    [{x:-100, y:-50, z:-25}, {x:-100, y:-25, z:-25}, {x:-100, y:0, z:-25}, {x:-100, y:25, z:-25}, {x:-100, y:50, z:-25}, ],
    [{x:-100, y:-50, z:0}, {x:-100, y:-25, z:0}, {x:-100, y:0, z:0}, {x:-100, y:25, z:0}, {x:-100, y:50, z:0}, ],
    [{x:-100, y:-50, z:25}, {x:-100, y:-25, z:25}, {x:-100, y:0, z:25}, {x:-100, y:25, z:25}, {x:-100, y:50, z:25}, ],
    [{x:-100, y:-50, z:50}, {x:-100, y:-25, z:50}, {x:-100, y:0, z:50}, {x:-100, y:25, z:50}, {x:-100, y:50, z:50}, ],
  ]
  return a;
}
let context;
let oscillator;
let gainNode;
let listener;
let panner;
let audioElement;
let delayNode;
let source;
let audioBuffer;

let initialState = {
  // started: false,
  volume: 0.25,
  // frequency: 250,
  // running: false,
  // time: 0,
  // x: -500,
  // y: 0,
  // z: 0,
  pulseOn: false,
  // rotationOn: true,
  idealVolume: 0.25,
  loopPause: 1,
  // pulseDuration: 150,
}

function readFileAsync(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = reject;

    reader.readAsArrayBuffer(file);
  })
}
function base64ToArrayBuffer(base64) {
  var binary_string =  window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

const getArrayBuffer = async () => {
  context = new AudioContext();
  let arrayBuffer = base64ToArrayBuffer(nailGunSoundBase64);
  try {
    return await context.decodeAudioData(arrayBuffer);
  } catch (error) {
    console.log(`error: `, error);
  }
}

class PointSources extends React.Component {
  componentDidMount = async () => {
    audioBuffer = await getArrayBuffer();
  }
  state = { ...initialState }

  init = () => {
    let source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.loop = true;
    source.start();
    delayNode = context.createDelay(10);
    delayNode.delayTime.value = 5;
    console.log(`source: `, source);
    console.log(`delayNode: `, delayNode);
    console.log(`context.destination: `, context.destination);
    // source.connect(delayNode).connect(source).connect(context.destination);
    
    // console.log(`🍓source: `, source);

  }

  initOscillator = () => { 
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(200, context.currentTime);
    oscillator.start();
  }

  initListener = () => {
    listener = context.listener;

    // Forward is face direction:
    /* Forward (top down view):
          +X
          ^
          |
    -Y <--O--> +Y
          |
          v
          -X
    */
    //  The forward properties represent the 3D coordinate position of the listener's forward direction (e.g. the direction they are facing in), while the up properties represent the 3D coordinate position of the top of the listener's head. These two together can nicely set the direction.

    listener.positionX.value = 0;
    listener.positionY.value = 0;
    listener.positionZ.value = 0;
    listener.forwardX.value = 0;
    listener.forwardY.value = 0;
    listener.forwardZ.value = -1;
    listener.upX.value = 0;
    listener.upY.value = 1;
    listener.upZ.value = 0;
  }

  initPanner = () => {
    panner = context.createPanner();

    // let pannerModel = 'equalpower';
    panner.pannerModel = 'HRTF';
    panner.distanceModel = 'linear';
    panner.positionX.value = this.state.x;
    panner.positionY.value = this.state.y;
    panner.positionZ.value = this.state.z;
    panner.orientationX.value = 0;
    panner.orientationY.value = 1;
    panner.orientationZ.value = 0;
    panner.refDistance = 1;
    panner.maxDistance = 10000;
    panner.rollOff = 10;
    panner.innerCone = 360;
    panner.outerCone = 0;
    panner.outerGain = 0.3;
  }

  // pulse = () => {
  //   let { pulseOn, pulseInterval, time } = this.state;

  //   let startTime = Date.now();
  //   if (pulseOn) {
  //     this.setState({pulseOn: false});
  //     clearInterval(pulseInterval);
  //   } else {
  //     // this.setState({pulseStart: Date.now()})
  //     let pulseInterval = setInterval(() => {

  //       let { pulseFrequency, pulseDuration, volume, idealVolume } = this.state;
  //       let elapsed = Date.now() - this.state.pulseStart;
  //       if ((elapsed % pulseFrequency) < pulseDuration) {
  //         if (volume !== idealVolume) {
  //           this.setVolume(idealVolume);
  //         }
  //       } else {
  //         if (volume !== 0) {
  //           this.setVolume(0);
  //         }
  //       }
  //     }, 10);
  //     this.setState({pulseInterval})
  //     this.setState({pulseOn: true});
  //   }
  // }

  loopPause = (value) =>{
    delayNode = context.createDelay(value);
  }

  setPannerValues(x, y, z) {
    if (panner) {
      panner.positionX.value = x;
      panner.positionY.value = y;
      panner.positionZ.value = z;
    }
  }

  start = () => {
    if (!this.state.started) {
      this.init();
      this.setVolume(this.state.idealVolume);
    } else {
      context.resume();
      this.setVolume(this.state.idealVolume);
    }
    this.setState({running: true});
  }

  getVolume = () => {
    let volumePercent = this.state.volume;
    return volumePercent;
  }

  setVolume = (value) => {
    if (gainNode && gainNode.gain) {
      gainNode.gain.setTargetAtTime(value, context.currentTime, 0.015);
    }
    this.setState({volume: value});
  }

  setFrequency = (value) => {
    if (oscillator) {
      oscillator.frequency.setTargetAtTime(value, context.currentTime, 0.015);
    }
    this.setState({frequency: value});
  }

  mute = () => {
    if (this.state.volume) {
      this.setVolume(0);
    } else {
      this.setVolume(this.state.idealVolume);
    }
  }

  reset = () => {
    context.close();
    this.setState({...initialState});
    context = undefined;
    oscillator = undefined;
    gainNode = undefined;
    clearInterval(this.state.timer);
    clearInterval(this.state.pannerInterval);
    clearInterval(this.state.pulseInterval);
  }

  handleClick = (e) => {
    let functionToCall = e.target.name;
    this[functionToCall]();
  }

  handleSlider = (value, name) => {
    if (name === 'volume') {
      this.setVolume(value);
      this.setState({idealVolume: value});
    }
    if (name === 'frequency') {
      this.setFrequency(value);
    }
    if (name === 'x') {
      this.setState({x: value});
    }
    if (name === 'y') {
      this.setState({y: value});
    }
    if (name === 'z') {
      this.setState({z: value});
    }
    if (name === 'pulseFrequency') {
      this.setState({pulseFrequency: value});
    }
    if (name === 'pulseDuration') {
      this.setState({pulseDuration: value});
    }
  }

  initTimer = () => {
    this.setState({start: Date.now()});

    let timer = setInterval(() => {
      let ms = (Date.now() - this.state.start);
      let ds = ms / 10;
      ds = Math.round(ds);
      let time = ds*10 / 1000;
      this.setState({time});
    }, 37);

    this.setState({timer});
  }

  initPannerRotation() {
    let rotationalVelocityDeg = 50; // deg / sec
    let radius = 1000;
    let start = Date.now();
    let pannerInterval = setInterval(() => {
      let deltaTimeInSeconds = (Date.now() - start) / 1000
      let angleDeg = 180 + rotationalVelocityDeg * deltaTimeInSeconds;
      let angleRad = degToRad(angleDeg);
      let x = radius * Math.cos(angleRad);
      // let x = -500;
      // let y = radius * Math.sin(angleRad);
      let y = 0;
      let z = radius * Math.sin(angleRad);
      // let z = 0;
      this.setState({x, y, z});
    }, 37);
    this.setState({pannerInterval})
  }
  
  initRotation() {
    if (this.state.rotationOn) {
      this.setState({rotationOn: false});
      clearInterval(this.state.pannerInterval);
    } else {
      this.initPannerRotation();
      this.setState({rotationOn: true});
    }
  }


  playAudioSnippet() {
    if (context.state !== 'running') {
      context.resume();
    }
    audioElement.play();
  }

  render() {
    // let c1 = { x:-100, y:50, z:50 }     // top front left
    // let c2 = { x:-100, y:50, z:-50 }    // bottom front left
    // let c3 = { x:-100, y:-50, z:-50 }   // bottom back left
    // let c4 = { x:-100, y:-50, z:50 }    // top back left
    // let c = {c1, c2, c3, c4 };
    // let count1 = 10;
    // let count2 = 10;
    // console.log(`getRectangle: `, getRectangle(c, count1, count2));
    // let { volume, loopPause, frequency, running, x, y, z, time, pulseOn, pulseFrequency, pulseDuration } = this.state;
    let { volume, loopPause} = this.state;
    return (
      <>
        <button onClick={this.init}>play snippet</button>
        <Horizontal
          displayName="Volume:"
          name="volume"
          min={0}
          max={2}
          step={0.01}
          value={volume}
          onChange={this.handleSlider}
        />
        <Horizontal
          displayName="Pulse frequency:"
          name="loopPause"
          min={50}
          max={1000}
          value={loopPause}
          onChange={this.handleSlider}
        />
      </>
    );
  }
}

export default PointSources;
