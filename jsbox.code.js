/*
 * @Author: tackchen
 * @Date: 2022-08-07 15:18:43
 * @Description: Coding something
 */
window.jsboxCode = {
  lib: 'https://cdn.jsdelivr.net/npm/string-worker/string-worker.min.js',
  lang: 'javascript',
  code: /* javascript */`var worker = new StringWorker({
  setup () { // 非必须
    return {msg: 'hello world'};
  },
  onmessage (message, data) { // 第二个参数为 setup的返回值
    return {receive: message.send + data.msg};
  }
});

worker.postMessage({send: 'Hello'}).then(d => {
  console.warn('Received: ', d);
});`
};
