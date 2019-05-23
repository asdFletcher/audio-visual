import React from 'react';
import Horizontal from './Horizontal.js';

let context;
let oscillator;
let gainNode;
let listener;
let panner;

let initialState = {
  started: false,
  volume: 0.25,
  frequency: 250,
  running: false,
  time: 0,
  x: -500,
  y: 0,
  z: 0,
  pulseOn: false,
  rotationOn: true,
  idealVolume: 0.25,
  pulseFrequency: 300,
  pulseDuration: 150,
}

class ToneGenerator extends React.Component {
  state = { ...initialState }

  init = () => {
    context = new AudioContext();
    oscillator = context.createOscillator();
    gainNode = context.createGain();
    
    this.initListener();
    this.initPanner();

    oscillator.connect(gainNode).connect(panner).connect(context.destination);

    this.initPannerRotation();
    this.initOscillator();
    this.initTimer();
    this.setState({started: true});
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

  pulse = () => {
    if (this.state.pulseOn) {
      this.setState({pulseOn: false});
      clearInterval(this.state.pulseInterval);
    } else {
      let time = this.state.time;
      this.setState({pulseStart: Date.now()})
      let pulseInterval = setInterval(() => {

        let { pulseFrequency, pulseDuration, volume, idealVolume } = this.state;
        let elapsed = Date.now() - this.state.pulseStart;
        if ((elapsed % pulseFrequency) < pulseDuration) {
          if (volume !== idealVolume) {
            this.setVolume(idealVolume);
          }
        } else {
          if (volume !== 0) {
            this.setVolume(0);
          }
        }
      }, 10);
      this.setState({pulseInterval})
      this.setState({pulseOn: true});
    }
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
    if (oscillator && gainNode && gainNode.gain) {
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

  degToRad(deg) {
    let rad = deg * (2 * 3.1415) / 360;
    return rad;
  }

  initPannerRotation() {
    let rotationalVelocityDeg = 50; // deg / sec
    let radius = 1000;
    let pannerInterval = setInterval(() => {
      let deltaTimeInSeconds = (Date.now() - this.state.start) / 1000
      let angleDeg = 180 + rotationalVelocityDeg * deltaTimeInSeconds;
      let angleRad = this.degToRad(angleDeg);
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

  render() {
    let { volume, frequency, running, x, y, z, time, pulseOn, pulseFrequency, pulseDuration } = this.state;

    this.setPannerValues(x, y, z);
    return (
      <>
        <div>time (s): {time}</div>
        {/* <button name="time" onClick={(e) => {this.handleClick(e)}}>time</button> */}
        <button disabled={running} name="start" onClick={(e) => {this.handleClick(e)}}>start</button>
        <button disabled={!running} name="mute" onClick={(e) => {this.handleClick(e)}}>{volume? "mute" : "unmute"}</button>
        <button disabled={!running} name="reset" onClick={(e) => {this.handleClick(e)}}>reset</button>
        <button name="pulse" onClick={(e) => {this.handleClick(e)}}>{pulseOn? "stop pulse" : "start pulse"}</button>
        <button name="initRotation" onClick={(e) => {this.handleClick(e)}}>rotation</button>
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
          displayName="Pitch:"
          name="frequency"
          min={0}
          max={2000}
          value={frequency}
          onChange={this.handleSlider}
        />
        <Horizontal
          displayName="X:"
          name="x"
          min={-1000}
          max={1000}
          value={x}
          onChange={this.handleSlider}
        />
        <Horizontal
          displayName="Y:"
          name="y"
          min={-1000}
          max={1000}
          value={y}
          onChange={this.handleSlider}
        />
        <Horizontal
          displayName="Z:"
          name="z"
          min={-1000}
          max={1000}
          value={z}
          onChange={this.handleSlider}
        />
        <Horizontal
          displayName="Pulse frequency:"
          name="pulseFrequency"
          min={50}
          max={1000}
          value={pulseFrequency}
          onChange={this.handleSlider}
        />
        <Horizontal
          displayName="Pulse duration:"
          name="pulseDuration"
          min={50}
          max={500}
          value={pulseDuration}
          onChange={this.handleSlider}
        />
      </>
    );
  }
}

export default ToneGenerator;
