export class Snippet {
  id: string;
  url: string;
  value: string;
  annotated: boolean;
  unreadable: boolean;

  constructor(dbEntry: any) {
    this.id = dbEntry.Id;
    this.url = dbEntry.Url;
    this.value = dbEntry.PiFF.Data[0].Value;
    this.annotated = false; // even if this flag is present in the entry, we assume we can't have an entry which is already tagged annotated
    this.unreadable = dbEntry.Unreadable;
  }
}

/**
 * Function that only help formatting a given snippet in order to keep only its fields "id" and "value".
 * Used when updating snippet's value inside the dabase.
 *
 * @param snippet from which we want to get fields id and value
 */
export function getIdAndValue(snippet: Snippet) {
  return { Id: snippet.id, Value: snippet.value };
}

export function getUnreadableFlag(snippet: Snippet) {
  return { Id: snippet.id, Flag: 'Unreadable', Value: snippet.unreadable };
}
