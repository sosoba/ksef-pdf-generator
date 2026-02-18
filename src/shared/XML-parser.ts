import { xml2js } from 'xml-js';
import { Faktura } from '../lib-public/types/fa2.types';

export function stripPrefixes<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(stripPrefixes) as T;
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]: [string, T]): [string, T] => {
        if (key === '_text') {
          return [
            key,
            (Array.isArray(value) ? value.join('') : String(value)).replace(/\s+/g, ' ').trim() as T,
          ];
        }
        return [key.includes(':') ? key.split(':')[1] : key, stripPrefixes(value)];
      })
    ) as T;
  }
  return obj;
}

export async function parseXML(file: File): Promise<unknown> {
  const xmlStr = await file.text();
  const jsonDoc: Faktura = stripPrefixes(xml2js(xmlStr, { compact: true, cdataKey: '_txt' })) as Faktura;

  return jsonDoc;
}
