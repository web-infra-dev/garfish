
import styles from './index.module.css';

const customers = [
  'https://lf3-static.bytednsdoc.com/obj/eden-cn/dhozeh7vhpebvog/open-garfish/douyin.svg',
  'https://lf3-static.bytednsdoc.com/obj/eden-cn/dhozeh7vhpebvog/open-garfish/feishu.svg',
  'https://lf3-static.bytednsdoc.com/obj/eden-cn/dhozeh7vhpebvog/open-garfish/toutiao.svg',
  'https://lf3-static.bytednsdoc.com/obj/eden-cn/dhozeh7vhpebvog/open-garfish/fanqie.svg',
  'https://lf3-static.bytednsdoc.com/obj/eden-cn/dhozeh7vhpebvog/open-garfish/dongchedi.svg',
  'https://lf3-static.bytednsdoc.com/obj/eden-cn/dhozeh7vhpebvog/open-garfish/xigua.svg',
  'https://lf3-static.bytednsdoc.com/obj/eden-cn/dhozeh7vhpebvog/open-garfish/helo.svg',
  'https://lf3-static.bytednsdoc.com/obj/eden-cn/dhozeh7vhpebvog/open-garfish/oceanengine.svg',
  'https://lf3-static.bytednsdoc.com/obj/eden-cn/dhozeh7vhpebvog/open-garfish/xingfuli.svg',
  'https://lf3-static.bytednsdoc.com/obj/eden-cn/dhozeh7vhpebvog/open-garfish/yuntu.svg',
  'https://lf3-static.bytednsdoc.com/obj/eden-cn/dhozeh7vhpebvog/open-garfish/beiqing.svg',
];

export function UserDetail() {
  return (
    <div className={styles.userDetailWrapper}>
      <p className={styles.userDetailTitle}><small>他们在用</small></p>
      <div className={styles.userContent}>
        {customers.map((logo, i) => {
          // Generate a unique key from the logo URL/path
          const key = `customer-${logo.replace(/[^\w]/g, '-')}`;
          return (
            <span key={key} className="col col--1">
              <img
                className={styles.userLogo}
                src={logo}
                width="120"
                alt="Customer logo"
              />
            </span>
          );
        })}
      </div>
    </div>
  );
}
