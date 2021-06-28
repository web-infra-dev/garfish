import React, { useState, useEffect } from 'react';
import GarfishInstance from 'garfish';

export interface MicroCompInfo {
  name: string;
  version?: string;
  comps?: string[];
  compName?: string;
  url?: string;
  props?: any;
}

function MicroComp(microCompInfo: MicroCompInfo) {
  const { name, version, compName, url, props } = microCompInfo;
  const [Comp, setComp] = useState('');

  useEffect(() => {
    if (!Comp) {
      GarfishInstance.loadComponent(name, {
        url,
        version,
      }).then((res) => {
        const ResComp = res.cjsModules.exports;
        if (typeof ResComp === 'function') {
          setComp(() => ResComp);
          return;
        }
        if (compName) {
          setComp(() => ResComp[compName]?.default || ResComp[compName]);
          return;
        }
        setComp(() => ResComp?.default || ResComp);
      });
    }
  });

  return Comp ? <Comp {...props} /> : <></>;
}
export default MicroComp;
