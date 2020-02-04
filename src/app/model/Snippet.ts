export class Snippet {
  id: number;
  url: string;
  value: string;
  unreadable: boolean;

  constructor(id: number, url: string, value: string) {
    this.id = id;
    this.url = url;
    this.value = value;
    this.unreadable = false;
  }
}

/**
 * Function that only help formatting a given snippet in order to keep only its fields "id" and "value".
 * Used when updating snippet's value inside the dabase.
 *
 * @param snippet from which we want to get fields id and value
 */
export function getIdAndValue(snippet: Snippet) {
  return { id: snippet.id, value: snippet.value };
}

export function getUnreadableFlag(snippet: Snippet) {
  return { id: snippet.id, flag: 'unreadable', value: snippet.unreadable };
}
