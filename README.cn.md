<!--
 * @Author: tackchen
 * @Date: 2022-08-03 21:24:33
 * @Description: Coding something
-->
# [StringWorker](https://github.com/theajack/string-worker)

让创建 WebWorker 更轻松

## 0. 介绍

StringWorker 致力于帮助开发者低成本接入WebWorker，在webpack和rollup项目中，引入js或者ts模块作为worker内部代码，无需单独维护woker内部代码

### 0.2 特性

1. 使用code字符串初始化worker，无需使用第三方url
2. 支持 Promise 获取worker返回的消息
3. 支持webpack、rollup引入loader使用 (开发中...)

## 1. 快速使用

### 1.1 使用字符串初始化

#### 1.1.1 使用原始数据

```js
const worker = new StringWorker(/* javascript*/`
  globalThis.addEventListener('message', function (e) {
    var data = e.data;

    // do something...
    console.log('Worker Receive: ', data);

    globalThis.postMessage('Worker Send: '+data)
  }, false);
`);

worker.onMessage(data => {
  console.log(data);
});

worker.postMessage('Hello World');
```

#### 1.1.2 使用 promise 获取worker的返回值

```js
const worker = new StringWorker(/* javascript*/`
  globalThis.addEventListener('message', function (e) {
    var data = e.data;
    console.log('Worker Receive: ', data);

    // do something...
    var message = 'Worker Send: '+data.message,

    globalThis.postMessage({
      message: message,
      id: data.id
    })
  }, false);
`);

let id = 0；
worker.postMessage({
  message: 'Hello World',
  id: `msg_${id++}`, // 需要传入唯一id以匹配消息
}).then(d => {
  console.log('Worker Return: ', d);
});
```

### 1.2. 使用函数初始化


#### 1.2.1 使用js

```js
const worker = new StringWorker({
  setup () { // 非必须
    return {msg: 'hello world'};
  },
  onmessage (message, data) { // 第二个参数为 setup的返回值
    return {receive: message.send + data.msg};
  }
});

worker.postMessage({send: 'Hello'}).then(d => {
  console.log(d);
});
```

#### 1.2.2 使用ts传入泛型 声明类型

当使用ts引用时，可以传入泛型来规范 setup 返回值和 message类型

```ts
const worker = new StringWorker<
  {msg: string}, // setup返回值
  {send: string}, // 发送的类型
  {receive: string} // 返回的类型
>({
  setup () { // 非必须
    return {msg: 'hello world'};
  },
  onmessage (message, data) { // 第二个参数为 setup的返回值
    return {receive: message.send + data.msg};
  }
});

worker.postMessage({send: 'Hello'}).then(d => {
  console.log(d);
});
```

## 2 使用 string-worker-loader （开发中...）

目前该部分正在开发中，目前开发者可自行编写一个独立的打包模块将 worker代码打包到一个文件中，然后引入该文件作为 StringWorker 构造参数实现loader功能

### 2.1 webpack-loader

### 2.2 rollup-loader

### 2.3 esbuild-loader