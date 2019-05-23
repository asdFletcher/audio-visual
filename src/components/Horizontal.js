import React, { Component } from 'react';
import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css';


class Horizontal extends Component {
  constructor (props) {
    super(props)
    this.state = {
    }
  }

  handleChange = (value) => {
    this.props.onChange(value, this.props.name);
  }

  render () {
    let value = Math.round(this.props.value*100)/100;
    return (
      <div className='slider'>
        <div className='slider-name'>{this.props.displayName}</div>
        <Slider
          min={this.props.min}
          max={this.props.max}
          step={this.props.step}
          value={value}
          orientation='horizontal'
          onChange={this.handleChange}
        />
        <div className='slider-value'>{value}</div>
      </div>
    );
  }
}

export default Horizontal