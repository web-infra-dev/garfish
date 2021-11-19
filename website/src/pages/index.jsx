/* eslint max-len:0 */
import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './index.module.css';
import SwiperCore, { Pagination, Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.min.css';

const notice = '';

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

const stats = [
  { name: '服务团队', count: '120+' },
  { name: '服务用户', count: '800+' },
  { name: '服务项目', count: '360+' },
];

const sliderImages = [
  'https://lf3-static.bytednsdoc.com/obj/eden-cn/dhozeh7vhpebvog/garfish-run.png',
  'https://lf3-static.bytednsdoc.com/obj/eden-cn/dhozeh7vhpebvog/garfish-export.png',
];

const features = [
  {
    title: '跨框架',
    imageUrl: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/dhozeh7vhpebvog/feat-framework.png',
    description: '支持 vue、react、angular 多种框架混合使用',
  },
  {
    title: 'API 最大简洁化',
    imageUrl: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/dhozeh7vhpebvog/feat-api.png',
    description: '在实际应用中使用方式极大简洁化',
  },
  {
    title: '路由驱动',
    imageUrl: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/dhozeh7vhpebvog/router-drive.png',
    description: '支持配置路由激活信息可完成自动化挂载和销毁',
  },
];


const introductions = [
  // {
  //   title: '简洁至上',
  //   imageUrl: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/dhozeh7vhpebvog/open-garfish/bottom/simple.svg',
  //   imagePos: 'left',
  //   description: 'Garfish 最大的特殊是将微前端在运行时所需要的能力进行了整合，用户无需过分关心底层的实现通过统一的封装，配置应用相关信息即可快速完成接入',
  // },
  // // {
  // //   title: '框架生态',
  // //   imageUrl: '',
  // //   imagePos: 'right',
  // //   description: 'Garfish 目前已经与 xxx 进行了生态扩展和功能整合，并正在和 xx 落地微前端监控上的各项指标'
  // // },
  // {
  //   title: '面向未来',
  //   imageUrl: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/dhozeh7vhpebvog/open-garfish/bottom/for_feature.svg',
  //   imagePos: 'left',
  //   description: 'Garfish 目前正在探索对 ES Modules、 Webpack@5 等功能的落地',
  // },
];

SwiperCore.use([Pagination, Autoplay]);

function UseDetail() {
  return (
    <div className="row">
      {
        stats.map(({ name, count }, index) => {
          if (index > 3) {
            return '';
          } else {
            return (
              <span key={name} className={clsx('col col--4', styles.useDetailList)}>
                <p><strong>{count}</strong></p>
                <p><small>{name}</small></p>
              </span>
            );
          }
        })
      }
    </div>
  );
}

function UserDetail() {
  return (
    <div className={styles.userDetailWrapper}>
      <p className={styles.userDetailTitle}><small>他们在用</small></p>
      <div className={styles.userContent}>
        {customers.map((logo, index) => {
          return (
            <span key={index} className="col col--1">
              <img className={styles.userLogo} src={logo} width="120"/>
            </span>
          );
        })}
      </div>
    </div>
  );
}

function SwiperWraper() {
  return (
    <Swiper
      spaceBetween={0}
      slidesPerView={1}
      pagination={{ clickable: true }}
      autoplay
    >
      {sliderImages.map((sliderImage, index) => {
        return (
          <SwiperSlide key={index}>
            <img className={styles.bannerImg} src={sliderImage} />
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}

function Introduction({ imageUrl, imagePos, title, description, index }) {
  const imgUrl = useBaseUrl(imageUrl);

  function introductionItem(num) {
    return (
      <div className={clsx(styles.introductionContent, imagePos === 'right' ? styles.flexAlignRight : '')}>
        {num % 2
? (
          <div className={styles.introductionBody}>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
        )
: (<img className={styles.introductionImage} src={imgUrl} />)
        }
      </div>
    );
  }

  return (
    <section className={index % 2 ? '' : styles.feature_odd}>
      <div className="container padding-vert--xl text--left">
        <div className={clsx('row', styles.flexAlignCenter)}>
          <div className="col col--6">
            {introductionItem(index)}
          </div>
          <div className="col col--6">
            {/* eslint-disable-next-line */}
            {introductionItem(index + 1)}
          </div>
        </div>
      </div>
    </section>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <header className={styles.homeTop}>
        {notice && <Link to="/blog" className={styles.notice}>
          <span className={styles.noticeTag}>NEW</span>
          <p className={styles.noticeDesc}>{notice}</p>
          <span className={styles.noticeRead}>阅读更多 →</span>
        </Link>}
        <div className={clsx('container', styles.homeContent)}>
          <div className={clsx('row', styles.homeLeft)}>
            <div className="col col--6">
              <h1 className={styles.slogan}>{siteConfig.customFields.slogan}</h1>
              <p className={styles.homeLeftSubtitle}>{siteConfig.customFields.summary}</p>
              <div className={styles.buttons}>
                <Link
                  className={clsx(
                    'button button--outline button--secondary button--lg',
                    styles.getStarted,
                    styles.linkButton
                  )}
                  to={useBaseUrl('guide/')}>
                  入门教程
                </Link>
                <Link
                  className={clsx(
                    'button button--outline button--secondary button--lg',
                    styles.linkButton,
                    styles.getGuide
                  )}
                  to={useBaseUrl('guide/')}>
                  快速开始
                </Link>
              </div>
            </div>
            <div className={clsx('col col--5 col--offset-1', styles.noDisplay)}>
              <SwiperWraper />
            </div>
          </div>
        </div>
        <div className={clsx('container', styles.homeContentBottom, styles.noDisplay)}>
          <div className={clsx('row', styles.homeContentBottomContainer)}>
            <div className="col col--12">
              <UserDetail />
            </div>
            {/* <div className="col  col--offset-1 col--5">
              <UseDetail />
            </div> */}
          </div>
        </div>
      </header>
      <main>
        <section className={styles.featuresSection}>
          <div className={clsx('container')}>
            <h1 className={styles.featureSectionTitle}>
              功能特性
              <span className={styles.ringContainer}>
                <span className={styles.ringring}></span>
                <span className={styles.circle}></span>
              </span>
            </h1>

            {/* <p className={styles.featureSectionDescription}>更多支持的功能支持：约定式路由、代码自动分割、国际化、一键预览服务等</p> */}
            <div className={clsx('row', styles.features)}>
              {features && features.length > 0 && (
                <>
                  {features.map(({ title, link, imageUrl, description }, index) => (
                    <div className={clsx('col col--4', styles.featureItem)} key={index}>
                      <Link to={link}>
                        <div className={styles.featureImage}><img src={imageUrl} /></div>
                        <h4 className={styles.featureTitle}>{title}</h4>
                        <p className={styles.featureDescription}>{description}</p>
                      </Link>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </section>
        {introductions && introductions.length > 0 && (
          <>
            {introductions.map(({ title, imageUrl, imagePos, description }, index) => (
              <Introduction
                key={title}
                title={title}
                index={index}
                imageUrl={imageUrl}
                imagePos={imagePos}
                description={description}
              />
            ))}
          </>
        )}
      </main>
    </Layout>
  );
}

export default Home;
