import { type IBlog } from '@/shared/model/blog/blog.model';
import { type ITag } from '@/shared/model/blog/tag.model';

export interface IPost {
  id?: string;
  title?: string;
  content?: string;
  date?: Date;
  blog?: IBlog | null;
  tags?: ITag[] | null;
}

export class Post implements IPost {
  constructor(
    public id?: string,
    public title?: string,
    public content?: string,
    public date?: Date,
    public blog?: IBlog | null,
    public tags?: ITag[] | null,
  ) {}
}
