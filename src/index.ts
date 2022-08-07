/*
 * @Author: tackchen
 * @Date: 2022-08-03 20:33:13
 * @Description: Coding something
 */

import {IJson, IMessageData} from './type';
import {codeToBlob, uuid} from './util';

export class StringWorker {
  private _worker: Worker;

  private _resolveMap: IJson<Function> = {};

  private _onMessageListeners: ((message: any) => void)[] = [];

  constructor (code: string) {
    this._worker = new Worker(codeToBlob(code));

    this._worker.onmessage = (e: {data: IMessageData}) => {
      console.log('receive', e);
      const {id, message} = e.data;
      this._onMessageListeners.forEach(fn => {fn(message);});
      const resolve = this._resolveMap[id];
      if (resolve) {
        resolve(message);
        delete this._resolveMap[id];
      }
    };
  }

  async postMessage (message: any, id = uuid()): Promise<any> {
    return new Promise((resolve) => {
      this._resolveMap[id] = resolve;
      this._worker.postMessage({message, id});
    });
  }

  onMessage (listener: (message: any) => void) {
    this._onMessageListeners.push(listener);
  }
}