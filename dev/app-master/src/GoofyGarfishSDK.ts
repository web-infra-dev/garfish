import Micro from '@byted-goofy/micro-frontend';
import {
  LoadDataWithRouteIdOptions,
  MicroFrontendDataRes,
  LoadDataOptions,
} from './interface';

const micro = new Micro();

export const getSubAppsById = async (
  options: LoadDataWithRouteIdOptions,
): Promise<MicroFrontendDataRes> => {
  return await micro.loadDataWithRouteId(options);
};

export const getSubAppsByRouter = async (
  options: LoadDataOptions,
): Promise<MicroFrontendDataRes> => {
  return await micro.loadData(options);
};
