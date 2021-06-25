import React from 'react';
import Layout from '@theme/Layout';
import styles from './resource.module.css';
// import { resource, summary } from './constants/resource';

function Resource() {
  return (
    <>
      <Layout>
        {/* <header className={styles.resourceBanner}>
          <h1>{summary.title}</h1>
          <p className={styles.description}>{summary.description}</p>
        </header>

        <div className="container">
          <div className={styles.content}>
            {
              resource.map((item, index) => (
                <div className={styles.item} key={index}>
                  <a href={item.info.href} target="_blank" className={styles.body}>
                    <div className={styles.img}>
                      <img src={item.img} />
                    </div>
                    <div className={styles.meta}>
                      <h5>{item.info.title}</h5>
                    </div>
                  </a>
                </div>
              ))
            }
          </div>
        </div> */}
      </Layout>
    </>
  );
}

export default Resource;
