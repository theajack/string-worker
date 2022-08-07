/*
 * @Author: tackchen
 * @Date: 2022-08-03 20:32:39
 * @Description: Coding something
 */

import {StringWorker} from '../../src/index';

const win = (window as any);

win.sw = new StringWorker(/* javascript*/`
  globalThis.addEventListener('message', function (
    e
  ) {
    const {message, id} = e.data;
    console.log(e);

    const result = ((msg) => {
      return msg + ' return';
    })(message);

    if (result instanceof Promise) {
      result.then(function (data) {
        globalThis.postMessage({id, message: data});
      });
    } else {
      globalThis.postMessage({id, message: result});
    }
  }, false);
`);
