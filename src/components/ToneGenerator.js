import React from 'react';
import Horizontal from './Horizontal.js';
import 'react-rangeslider/lib/index.css';

let context;
let oscillator;
let gainNode;

class ToneGenerator extends React.Component {
  state = {
    started: false,
    volume: 1,
    frequency: 250,
    running: false,
  }

  init = () => {
    context = new AudioContext();
    oscillator = context.createOscillator();
    gainNode = context.createGain();
    oscillator.connect(gainNode)
    gainNode.connect(context.destination)

    this.setState({started: true});
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(200, context.currentTime);
    oscillator.start();
  }

  start = () => {
    if (!this.state.started) {
      this.init();
    } else {
      context.resume();
      this.setVolume(this.state.volume);
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
      this.setVolume(1);
    }
  }

  reset = () => {
    context.close();
    this.setState({
      started: false,
      volume: 1,
      frequency: 250,
      running: false,
    });
    context = undefined;
    oscillator = undefined;
    gainNode = undefined;
  }

  handleClick = (e) => {
    let functionToCall = e.target.name;
    this[functionToCall]();
  }

  handleSlider = (value, name) => {
    // console.log(`e.target.name`, e.target.name);
    console.log(`value`, value);
    // console.log(`e.target.name`, e.target.name);
    // this.setState({volume});
    // this.setVolume(volume);
    if (name === 'volume') {
      this.setVolume(value);
    }
    if (name === 'frequency') {
      this.setFrequency(value);
    }
  }

  render() {
    let { volume, frequency, running } = this.state;
    return (
      <>
        <div>tone:</div>
        <button disabled={running} name="start" onClick={(e) => {this.handleClick(e)}}>start</button>
        <button disabled={!running} name="mute" onClick={(e) => {this.handleClick(e)}}>{volume? "mute" : "unmute"}</button>
        <button disabled={!running} name="reset" onClick={(e) => {this.handleClick(e)}}>reset</button>
        <Horizontal
          min={0}
          max={2}
          step={0.01}
          name="volume"
          value={volume}
          onChange={this.handleSlider}
        />
        <Horizontal
          min={0}
          max={800}
          step={1}
          name="frequency"
          value={frequency}
          onChange={this.handleSlider}
        />
      </>
    );
  }
}

export default ToneGenerator;
