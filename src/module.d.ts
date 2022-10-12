declare module '@antiadmin/anticaptchaofficial' {
  export function solveImage(body: string): Promise<string>;
  export function setAPIKey(key: string): void;
}