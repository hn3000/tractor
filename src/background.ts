
declare function require(name: string) : any;
const files = require('./files.json');

export function chooseBackground(): string {
  let now = new Date();
  let today = `bgIndex-${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
  let currentIndex = localStorage.getItem(today);
  if (null == currentIndex) {
    currentIndex = ''+Math.floor(Math.random()*files.length);
    let keys = [] as string[];
    for (let i = 0, n = localStorage.length; i < n; ++i) {
      const thisKey = localStorage.key(i);
      if (null != thisKey && thisKey.startsWith('bgIndex-')) {
        keys.push();
      }
    }
    keys.forEach(x => localStorage.removeItem(x));
    localStorage.setItem(today, currentIndex);

  }
  return files[currentIndex];
}
