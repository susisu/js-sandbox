import Vue from 'vue';

window.addEventListener('load', main);

function main() {
  window.removeEventListener('load', main);
  const main = new Vue({
    el  : '#root',
    data: {
      message: 'Hello!!'
    }
  });

  main.message += '  Kin-iro Mosaic';
}
