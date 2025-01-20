declare module 'quagga' {
  export interface InputStreamConfig {
    type: string;
    constraints: {
      width: number;
      height: number;
      facingMode: string;
    };
    target: HTMLElement;
  }

  export interface DecoderConfig {
    readers: string[];
  }

  export interface InitConfig {
    inputStream: InputStreamConfig;
    decoder: DecoderConfig;
    locate?: boolean;
  }

  export interface DecodeSingleConfig {
    src: string;
    numOfWorkers?: number;
    decoder: {
      readers: string[];
    };
    locate?: boolean;
  }

  export interface CodeResult {
    code: string;
  }

  export interface DecodeSingleResult {
    codeResult?: CodeResult;
  }

  export function decodeSingle(
    config: DecodeSingleConfig,
    callback: (result: DecodeSingleResult) => void
  ): void;

  export function init(
    config: InitConfig,
    callback: (err: any) => void
  ): void;

  export function start(): void;

  export function stop(): void;

  export function onDetected(
    callback: (result: DecodeSingleResult) => void
  ): void;
}