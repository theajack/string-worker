/*
 * @Author: tackchen
 * @Date: 2022-08-03 20:33:13
 * @Description: Coding something
 */

import {IJson, IMessageData} from './type';
import {codeToBlob, uuid} from './util';


export interface IStringWorkerOptions<SetUpData=any, SendData=any, ReceiveData=SendData> {
  setup?: () => SetUpData;
  onmessage: (message: SendData, data: SetUpData) => ReceiveData;
}

const SWHelper = {
  buildCode ({setup, onmessage}: IStringWorkerOptions) {

    const setupString = (typeof setup === 'undefined')
      ? '{}'
      : this.funcToString(setup);

    return /* javascript*/`
const window = globalThis;
const globalData = ${setupString};
globalThis.addEventListener('message', function (
  e
) {
  const {message, id} = e.data;
  console.log(e);

  const result = ${this.funcToString(onmessage, 'message, globalData')}

  if (result instanceof Promise) {
    result.then(function (data) {
      globalThis.postMessage({id, message: data});
    });
  } else {
    globalThis.postMessage({id, message: result});
  }
}, false);`;
  },

  funcToString (func: Function, argName = '') {
    let str = func.toString();
    const title = str.substring(0, str.indexOf('{'));
    if (!title.includes('function') && !title.includes('=>')) {
      str = `function ${str}`;
    }
    return `(${str})(${argName})`;
  }
};

export class StringWorker<SetUpData=any, SendData=any, ReceiveData=SendData> {
  static version: string = '0.0.1';
  private _worker: Worker;

  private _resolveMap: IJson<Function> = {};

  private _onMessageListeners: ((message: any) => void)[] = [];

  private _isOriginMessage: boolean = false;

  constructor (options: string | IStringWorkerOptions<SetUpData, SendData, ReceiveData>) {

    let code: string = '';
    if (typeof options === 'string') {
      this._isOriginMessage = true;
      code = options as string;
    } else {
      code = SWHelper.buildCode(options);
    }

    this._worker = new Worker(codeToBlob(code));

    this._worker.onmessage = (e: {data: IMessageData<SendData>}) => {
      let message: any, id: string = '';
      if (typeof e.data === 'object') {
        message = e.data.message;
        id = e.data.id;
      } else {
        message = e.data;
      }
      this._onMessageListeners.forEach(fn => {fn(message);});
      if (id) {
        const resolve = this._resolveMap[id];
        if (resolve) {
          resolve(message);
          delete this._resolveMap[id];
        }
      }
    };
  }

  postMessage (message: SendData, id?: string): Promise<ReceiveData> {
    if (this._isOriginMessage) {
      this._worker.postMessage(message);
      const id = (message as any)?.id;
      if (id) {
        return new Promise(resolve => {
          this._resolveMap[id] = resolve;
        });
      }
      return Promise.resolve(null as any);
    } else {
      return new Promise((resolve) => {
        if (!id) id = uuid();
        this._resolveMap[id] = resolve;
        this._worker.postMessage({message, id});
      });
    }
  }

  onMessage (listener: (message: any) => void) {
    this._onMessageListeners.push(listener);
  }
}