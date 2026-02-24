import React, {useState, useCallback} from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {useSidebarBreadcrumbs, useDoc} from '@docusaurus/plugin-content-docs/client';
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

function getRawGitHubUrl(editUrl) {
  // editUrl: https://github.com/owner/repo/tree/branch/path/to/file.md
  // raw URL: https://raw.githubusercontent.com/owner/repo/branch/path/to/file.md
  return editUrl
    .replace('https://github.com/', 'https://raw.githubusercontent.com/')
    .replace('/tree/', '/');
}

function CopyToLLMButton() {
  const [state, setState] = useState('idle'); // idle | loading | copied | error
  const doc = useDoc();
  const editUrl = doc?.metadata?.editUrl;

  const handleCopy = useCallback(async () => {
    if (!editUrl || state === 'loading') return;

    setState('loading');
    try {
      const rawUrl = getRawGitHubUrl(editUrl);
      const response = await fetch(rawUrl);
      if (!response.ok) throw new Error('Failed to fetch');
      const markdown = await response.text();
      await navigator.clipboard.writeText(markdown);
      setState('copied');
      setTimeout(() => setState('idle'), 2000);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 2000);
    }
  }, [editUrl, state]);

  if (!editUrl) return null;

  const label = {
    idle: 'Copy to LLM',
    loading: 'Copying...',
    copied: '✓ Copied!',
    error: 'Error!',
  }[state];

  return (
    <button
      className={clsx('button button--sm button--secondary', styles.copyLLMButton)}
      onClick={handleCopy}
      disabled={state === 'loading'}
      title="Copy raw markdown content for use with an LLM">
      {label}
    </button>
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
      {!location.pathname.includes('/category/') && <CopyToLLMButton />}
    </nav>
  );
}