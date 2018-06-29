
declare function require(name: string) : any;

require('./styles.css');

import { clock } from './clock';
import { chooseBackground } from './background';

const clockElement = document.getElementById('clock');
clock(clockElement);

const bgElement: HTMLBodyElement|null = document.getElementsByTagName('body')[0];
if (null != bgElement) {
  const bgSrc = chooseBackground();
  const url = `url(../images/original/${bgSrc})`;
  bgElement.style.backgroundImage = url;
  console.log(`set backgroundImage = ${url}`, bgElement);
}

/*
if (module.hot) {
  module.hot.accept('./init.js', function() {
    console.log('updated module', arguments);
    const body = document.getElementsByTagName('body')[0];
    for (const x of body.children) {
      body.removeChild(x)
    }
    init();
  });
}
*/
