import type { Feature } from '@rspress/shared';
import { NoSSR, usePageData } from 'rspress/runtime';
import { HomeFeature, HomeFooter } from 'rspress/theme';
import { HomeHero, type Hero } from './HomeHero';
import { UserDetail } from './UserDetail/index';

export function HomeLayout() {
  const { page } = usePageData();
  const { frontmatter } = page;

  return (
    <div>
      {/* Landing Page */}
      <div
        className="relative border-b dark:border-dark-50"
        style={{
          background: 'var(--rp-home-bg)',
          paddingBottom: '56px',
        }}
      >
        <div className="pt-14">
          <HomeHero hero={frontmatter.hero as Hero} />
          <HomeFeature frontmatter={frontmatter} routePath={''} />
          <UserDetail />
        </div>
      </div>
      {/* Benchmark Page */}
      {/* <NoSSR>
        <Benchmark />
      </NoSSR> */}
      {/* <Contributors /> */}
      {/* Footer */}
      {/* <HomeFooter /> */}
    </div>
  );
}
