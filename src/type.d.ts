declare module "middie" {
  interface IFakeReqObj {
    url: string;
    [k: string]: any;
  }

  interface Middie {
    use(req: IFakeReqObj, )
  }

  function middie(ctx: IFakeReqObj, accumulation: any[]): void;
  export = middie;
}