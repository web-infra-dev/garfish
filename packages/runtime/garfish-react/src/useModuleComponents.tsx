import React from 'react';
import MicroComp, { MicroCompInfo } from './components/MicroComp';

const useModuleComponents = (
  componentList: (Omit<MicroCompInfo, 'compName' | 'props'> | string)[],
) => {
  return componentList.map((compInfo) => {
    if (typeof compInfo === 'string') {
      return (props: any) => <MicroComp name={compInfo} props={props} />;
    }
    const { comps, ...rest } = compInfo;
    if (comps) {
      return comps.map((compName) => {
        return (props: any) => (
          <MicroComp {...rest} compName={compName} props={props} />
        );
      });
    }

    return (props: any) => <MicroComp {...rest} props={props} />;
  });
};

export default useModuleComponents;
