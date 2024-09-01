import React, { Component } from 'react';
import { colors } from './constants';
import './globals';

import Timer from './timer';

class ColorPalette extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div className='palette' style={{ display: 'none' }}>
          <div className="color-palette">
            <Timer />
            <div className="container">
              {colors.map(color =>
                <input type='radio' key={color} className='color' value={'0x' + color} style={{ backgroundColor: '#' + color }} onClick={(e) => { globalThis.color = e.target.value; }} name="color" />
              )}
            </div>
          </div>
        </div>
      </div>
    )

  }
}

class App extends Component {
  render() {
    return (
      <ColorPalette />
    );
  }
}

export default App;