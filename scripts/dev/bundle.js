// src/util.ts
function codeToBlob(code) {
  const blob = new window.Blob([code], { type: "text/javascript" });
  const objectURL = window.URL.createObjectURL(blob);
  return objectURL;
}
function uuid() {
  const s = [];
  const hexDigits = "0123456789abcdef";
  for (let i = 0; i < 36; i++)
    s[i] = hexDigits.substr(Math.floor(Math.random() * 16), 1);
  s[14] = "4";
  s[19] = hexDigits.substr(s[19] & 3 | 8, 1);
  s[8] = "-";
  s[13] = "-";
  s[18] = "-";
  s[23] = "-";
  const uuid2 = s.join("");
  return uuid2;
}

// src/index.ts
var SWHelper = {
  buildCode({ setup, onmessage }) {
    const setupString = typeof setup === "undefined" ? "{}" : this.funcToString(setup);
    return `
const window = globalThis;
const globalData = ${setupString};
globalThis.addEventListener('message', function (
  e
) {
  const {message, id} = e.data;
  console.log(e);

  const result = ${this.funcToString(onmessage, "message, globalData")}

  if (result instanceof Promise) {
    result.then(function (data) {
      globalThis.postMessage({id, message: data});
    });
  } else {
    globalThis.postMessage({id, message: result});
  }
}, false);`;
  },
  funcToString(func, argName = "") {
    let str = func.toString();
    const title = str.substring(0, str.indexOf("{"));
    if (!title.includes("function") && !title.includes("=>")) {
      str = `function ${str}`;
    }
    return `(${str})(${argName})`;
  }
};
var StringWorker = class {
  constructor(options) {
    this._resolveMap = {};
    this._onMessageListeners = [];
    this._isOriginMessage = false;
    let code = "";
    if (typeof options === "string") {
      this._isOriginMessage = true;
      code = options;
    } else {
      code = SWHelper.buildCode(options);
    }
    this._worker = new Worker(codeToBlob(code));
    this._worker.onmessage = (e) => {
      let message, id = "";
      if (typeof e.data === "object") {
        message = e.data.message;
        id = e.data.id;
      } else {
        message = e.data;
      }
      this._onMessageListeners.forEach((fn) => {
        fn(message);
      });
      if (id) {
        const resolve = this._resolveMap[id];
        if (resolve) {
          resolve(message);
          delete this._resolveMap[id];
        }
      }
    };
  }
  postMessage(message, id) {
    if (this._isOriginMessage) {
      this._worker.postMessage(message);
      const id2 = message == null ? void 0 : message.id;
      if (id2) {
        return new Promise((resolve) => {
          this._resolveMap[id2] = resolve;
        });
      }
      return Promise.resolve(null);
    } else {
      return new Promise((resolve) => {
        if (!id)
          id = uuid();
        this._resolveMap[id] = resolve;
        this._worker.postMessage({ message, id });
      });
    }
  }
  onMessage(listener) {
    this._onMessageListeners.push(listener);
  }
};
StringWorker.version = "0.0.1";

// scripts/dev/index.ts
var win = window;
var worker = new StringWorker({
  setup() {
    return { msg: "hello world" };
  },
  onmessage(message, data) {
    return { receive: message.send + data.msg };
  }
});
worker.postMessage({ send: "Hello" }).then((d) => {
  console.log(d);
});
win.sw = worker;
//# sourceMappingURL=bundle.js.map
