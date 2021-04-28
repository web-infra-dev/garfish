import getDecorators from 'inversify-inject-decorators';
import { Container, tagged, named } from 'inversify';
// import { Garfish } from "../instance/context";

export const container = new Container();
const decorators = getDecorators(container, true);
export const lazyInject = decorators.lazyInject;

export const TYPES = { Loader: 'Loader', Hooks: 'Hooks', Garfish: 'Garfish' };

// container.bind<Garfish>(TYPES.Garfish).toConstructor(Garfish);

// export function injectable (){
//   return function (target) {

//     const PARAM_TYPES = "inversify:paramtypes";
//     const DESIGN_PARAM_TYPES = "design:paramtypes";

//     if (Reflect.hasOwnMetadata(PARAM_TYPES, target)) {
//       throw new Error(`"Cannot apply @injectable decorator multiple times.`);
//     }

//     const types = Reflect.getMetadata(DESIGN_PARAM_TYPES, target) || [];
//     Reflect.defineMetadata(PARAM_TYPES, types, target);
//     console.log(Reflect.getMetadata(DESIGN_PARAM_TYPES, target));

//     return target;
//   }
// }

// // IOC成员属性
// interface iIOCMember {
//   factory: Function;
//   singleton: boolean;
//   instance?: {}
// }

// // 构造函数泛型
// interface iClass<T> {
//   new(...args: any[]): T
// }

// // 定义IOC容器
// export class IOC {
//   private container: Map<PropertyKey, iIOCMember>;

//   constructor() {
//     this.container = new Map<string, iIOCMember>();
//   }

//   bind<T>(key: string, Fn: iClass<T>) {
//     const factory = () => new Fn();
//     this.container.set(key, { factory, singleton: true });
//   }

//   use(namespace: string) {
//     let item = this.container.get(namespace);
//     if (item !== undefined) {
//       if (item.singleton && !item.instance) {
//         item.instance = item.factory();
//       }
//       return item.singleton ? item.instance : item.factory();
//     } else {
//       throw new Error('未找到构造方法');
//     }
//   }
// }

// const con = new IOC();
// con.bind<Hooks>(TYPES.Hooks, Hooks);
// con.bind<Loader>(TYPES.Loader, Loader);

// function getDec (IoCContainer: IOC) {
//   return {
//     lazyInject (type: keyof (typeof TYPES)): any {
//       return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
//         const val = IoCContainer.use(type);
//         Object.defineProperty(target, propertyKey, {
//           configurable: true,
//           enumerable: true,
//           get: ()=> val,
//         });
//       }
//     }
//   }
// }

// export const lazyInject = getDec(con).lazyInject;
