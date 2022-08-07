/*
 * @Author: tackchen
 * @Date: 2022-08-06 16:56:31
 * @Description: Coding something
 */
export interface IJson<T=any> {
  [prop: string]: T;
}

export interface IMessageData {
  message: any;
  id: string;
}