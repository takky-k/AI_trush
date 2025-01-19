declare module 'quagga' {
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
  }