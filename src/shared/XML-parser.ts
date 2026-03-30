import { xml2js } from 'xml-js';
import { Faktura } from '../lib-public/types/fa2.types';

export function stripPrefix(key: string): string {
  return key.includes(':') ? key.split(':')[1] : key;
}

export async function parseXML(file: File): Promise<unknown> {
  const xmlStr = await file.text();

  return xml2js(xmlStr, {
    compact: true,
    cdataKey: '_text',
    trim: true,
    elementNameFn: stripPrefix,
    attributeNameFn: stripPrefix,
  }) as Faktura;
}
