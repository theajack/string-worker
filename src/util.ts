/*
 * @Author: tackchen
 * @Date: 2022-08-06 16:45:41
 * @Description: Coding something
 */

export function codeToBlob (code: string) {
  const blob = new window.Blob([code], {type: 'text/javascript'}); // 生成js文件对象
  const objectURL = window.URL.createObjectURL(blob); // 生成js文件的url
  return objectURL;
}

export function uuid () {
  const s: string[] = [];
  const hexDigits = '0123456789abcdef';
  for (let i = 0; i < 36; i++) s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);

  s[14] = '4';  // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr(((s[19] as any) & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = '-';
  s[13] = '-';
  s[18] = '-';
  s[23] = '-';
  const uuid = s.join('');
  return uuid;
}