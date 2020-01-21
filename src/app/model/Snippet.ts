export class Snippet {
  id: number;
  url: string;
  value: string;

  constructor(id: number, url: string, value: string) {
    this.id = id;
    this.url = url;
    this.value = value;
  }
}

export function getIdAndValue(snippet: Snippet) {
  return { id: snippet.id, value: snippet.value };
}
