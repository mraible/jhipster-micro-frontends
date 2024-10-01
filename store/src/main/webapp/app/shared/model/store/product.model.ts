export interface IProduct {
  id?: string;
  title?: string;
  price?: number;
  imageContentType?: string | null;
  image?: string | null;
}

export class Product implements IProduct {
  constructor(
    public id?: string,
    public title?: string,
    public price?: number,
    public imageContentType?: string | null,
    public image?: string | null,
  ) {}
}
