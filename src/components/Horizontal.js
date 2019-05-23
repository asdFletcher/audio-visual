import React, { Component } from 'react';
import Slider from 'react-rangeslider';

class Horizontal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      min: 0,
      max: 2,
    }
  }

  handleChange = (value) => {
    // console.log(`🍊value: `, value);
    this.props.onChange(value, this.props.name);
  }

  render () {
    const { min, max } = this.state
    let value = Math.round(this.props.value*100)/100;
    return (
      <div className='slider'>
        <Slider
          min={this.props.min}
          max={this.props.max}
          step={this.props.step}
          value={value}
          orientation='horizontal'
          // onChange={() => {this.handleChange(value)}}
          onChange={this.handleChange}
        />
        <div className='slider-value'>{value}</div>
      </div>
    );
  }
}

export default Horizontal