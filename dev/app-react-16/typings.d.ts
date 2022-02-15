declare interface Window {
  Garfish: any;
  __GARFISH__: any;
  dynamicScriptOnloadTag: boolean;
  dynamicScriptOnerrorTag: boolean;
}

declare module '*.css';
declare module '*.less';
declare module '*.png';
declare module '*.svg' {
  export function ReactComponent(
    props: React.SVGProps<SVGSVGElement>,
  ): React.ReactElement;
  const url: string;
  export default url;
}
