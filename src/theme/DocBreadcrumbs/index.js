import React from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {useSidebarBreadcrumbs} from '@docusaurus/plugin-content-docs/client';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import {translate} from '@docusaurus/Translate';
import styles from './styles.module.css';

function HomeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={styles.breadcrumbHomeIcon}>
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}

function HomeBreadcrumbItem({href}) {
  return (
    <li className="breadcrumbs__item">
      <Link
        aria-label={translate({
          id: 'theme.docs.breadcrumbs.home',
          message: 'Home page',
          description: 'The ARIA label for the home page in the breadcrumbs',
        })}
        className="breadcrumbs__link"
        href={href}>
        <HomeIcon />
      </Link>
    </li>
  );
}

function BreadcrumbsItemLink({children, href, isLast}) {
  const className = 'breadcrumbs__link';
  if (isLast) {
    return (
      <span className={className} itemProp="name">
        {children}
      </span>
    );
  }
  return href ? (
    <Link className={className} href={href} itemProp="item">
      <span itemProp="name">{children}</span>
    </Link>
  ) : (
    <span className={className} itemProp="name">
      {children}
    </span>
  );
}

function BreadcrumbsItem({children, active, index, addMicrodata}) {
  return (
    <li
      {...(addMicrodata && {
        itemScope: true,
        itemProp: 'itemListElement',
        itemType: 'https://schema.org/ListItem',
      })}
      className={clsx('breadcrumbs__item', {
        'breadcrumbs__item--active': active,
      })}>
      {children}
      <meta itemProp="position" content={String(index + 1)} />
    </li>
  );
}

export default function DocBreadcrumbs() {
  const breadcrumbs = useSidebarBreadcrumbs();
  const location = useLocation();

  if (!breadcrumbs) {
    return null;
  }

  // Determine section home based on current path
  const getSectionHomeHref = (pathname) => {
    if (pathname.startsWith('/docs/php')) {
      return '/docs/php';
    } else if (pathname.startsWith('/docs/devops')) {
      return '/docs/devops';
    } else if (pathname.startsWith('/docs/js')) {
      return '/docs/js';
    } else if (pathname.startsWith('/docs/helm')) {
      return '/docs/helm';
    }
    return '/';
  };

  const sectionHomeHref = getSectionHomeHref(location.pathname);

  return (
    <nav
      className={clsx(
        ThemeClassNames.docs.docBreadcrumbs,
        styles.breadcrumbsContainer,
      )}
      aria-label={translate({
        id: 'theme.docs.breadcrumbs.navAriaLabel',
        message: 'Breadcrumbs',
        description: 'The ARIA label for the breadcrumbs',
      })}>
      <ul
        className="breadcrumbs"
        itemScope
        itemType="https://schema.org/BreadcrumbList">
        <HomeBreadcrumbItem href={sectionHomeHref} />
        {breadcrumbs.map((item, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <BreadcrumbsItem
              key={idx}
              active={isLast}
              index={idx + 1}
              addMicrodata={!!item.href}>
              <BreadcrumbsItemLink href={item.href} isLast={isLast}>
                {item.label}
              </BreadcrumbsItemLink>
            </BreadcrumbsItem>
          );
        })}
      </ul>
    </nav>
  );
}
