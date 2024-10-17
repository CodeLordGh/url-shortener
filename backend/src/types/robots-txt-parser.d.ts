declare module 'robots-txt-parser' {
  export function parse(robotsTxt: string): {
    isAllowed(url: string): boolean;
  };
}
