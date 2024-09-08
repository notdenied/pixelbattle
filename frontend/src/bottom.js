import React, { Component } from 'react';
import { colors } from './constants';
import './globals';

import Timer from './timer';

class ColorPalette extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const is_mobile = window.innerWidth / window.innerHeight < 1;
    return (
      <div>
        <div className='palette' style={{ display: 'none' }}>
          <div className="color-palette">
            <Timer />
            <div className="container">
              {colors.map(color =>
                <input type='radio' key={color} className={is_mobile ? 'color_mobile' : 'color'} value={'0x' + color} style={{ backgroundColor: '#' + color }} onClick={(e) => { globalThis.color = e.target.value; }} name="palette_color" />
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