interface JQueryCookie {
  (key: string, value?: any, options?: any): any;
  json: boolean;
}

interface JQueryStatic {
  cookie: JQueryCookie
}
