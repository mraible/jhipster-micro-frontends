import { type IPost } from '@/shared/model/blog/post.model';

export interface ITag {
  id?: string;
  name?: string;
  posts?: IPost[] | null;
}

export class Tag implements ITag {
  constructor(
    public id?: string,
    public name?: string,
    public posts?: IPost[] | null,
  ) {}
}
