export interface Account {
  email: string;
  name: string;
  password: string;
  role: boolean;
}

export class Account implements Account {
  constructor(public name= '', public password= '', public email= '', public role= false) {
  }
}
