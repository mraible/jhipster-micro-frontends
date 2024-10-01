import { type IUser } from '@/shared/model/user.model';

export interface IBlog {
  id?: string;
  name?: string;
  handle?: string;
  user?: IUser | null;
}

export class Blog implements IBlog {
  constructor(
    public id?: string,
    public name?: string,
    public handle?: string,
    public user?: IUser | null,
  ) {}
}
