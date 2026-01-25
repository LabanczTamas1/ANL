export interface EmailData {
  subject: string;
  recipient: string;
  body: string;
  name: string;
}

export interface User {
  email: string;
  username: string;
}

export interface LinkData {
  url: string;
  text: string;
}
