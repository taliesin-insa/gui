export interface Account {
  email: string;
  name: string;
  role: boolean;
}

export class Account implements Account {
  constructor(public name= '', public email= '', public role= false) {
  }
}
