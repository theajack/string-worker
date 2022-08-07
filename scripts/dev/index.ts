/*
 * @Author: tackchen
 * @Date: 2022-08-03 20:32:39
 * @Description: Coding something
 */

import {StringWorker} from '../../src/index';

const win = (window as any);

// const worker = new StringWorker(/* javascript*/`
//   globalThis.addEventListener('message', function (e) {
//     var data = e.data;
//     console.log('Worker Receive: ', data);
//     globalThis.postMessage('Worker Send: '+data)
//   }, false);
// `);

// worker.onMessage(data => {
//   console.log(data);
// });


// const worker = new StringWorker(/* javascript*/`
//   globalThis.addEventListener('message', function (e) {
//     var data = e.data;
//     console.log('Worker Receive: ', data);
//     globalThis.postMessage({
//       message: 'Worker Send: '+data.message,
//       id: data.id
//     })
//   }, false);
// `);

// let id = 0;
// worker.postMessage({
//   message: 'Hello World',
//   id: `${id++}`
// }).then(d => {
//   console.log('Worker Return: ', d);
// });

const worker = new StringWorker<
  {msg: string}, // setup返回值
  {send: string}, // 发送的类型
  {receive: string} // 返回的类型
>({
  setup () {
    return {msg: 'hello world'};
  },
  onmessage (message, data) {
    return {receive: message.send + data.msg};
  }
});

worker.postMessage({send: 'Hello'}).then(d => {
  console.log(d);
});

win.sw = worker;

