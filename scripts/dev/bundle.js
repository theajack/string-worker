var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

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
var StringWorker = class {
  constructor(code) {
    this._resolveMap = {};
    this._onMessageListeners = [];
    this._worker = new Worker(codeToBlob(code));
    this._worker.onmessage = (e) => {
      console.log("receive", e);
      const { id, message } = e.data;
      this._onMessageListeners.forEach((fn) => {
        fn(message);
      });
      const resolve = this._resolveMap[id];
      if (resolve) {
        resolve(message);
        delete this._resolveMap[id];
      }
    };
  }
  postMessage(_0) {
    return __async(this, arguments, function* (message, id = uuid()) {
      return new Promise((resolve) => {
        this._resolveMap[id] = resolve;
        this._worker.postMessage({ message, id });
      });
    });
  }
  onMessage(listener) {
    this._onMessageListeners.push(listener);
  }
};

// scripts/dev/index.ts
var win = window;
win.sw = new StringWorker(`
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
//# sourceMappingURL=bundle.js.map
