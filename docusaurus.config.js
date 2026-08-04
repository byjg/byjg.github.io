// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Opensource ByJG',
  tagline: 'A wide range of opensource projects ByJG',
  favicon: 'img/favicon.ico',
  staticDirectories: ['helm-charts', 'packages', 'static'],

  // Set the production url of your site here
  url: 'https://opensource.byjg.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Build performance + v4 readiness.
  // `faster: true` turns on the whole Rust toolchain (Rspack bundler + persistent cache,
  // SWC js/html loaders and minifiers, Lightning CSS minifier, the MDX cross-compiler cache
  // that compiles each doc once instead of twice, SSG worker threads and eager git VCS).
  // `removeLegacyPostBuildHeadAttribute` is a hard requirement of `ssgWorkerThreads`.
  // `mdx1CompatDisabledByDefault` turns off the MDX v1 back-compat pre-processing
  // (comments / admonitions / headingIds) that otherwise runs over every .md and .mdx file.
  // See `markdown.mdx1Compat` below: we keep the admonition pass, our content needs it.
  future: {
    faster: true,
    v4: {
      removeLegacyPostBuildHeadAttribute: true,
      mdx1CompatDisabledByDefault: true,
    },
  },

  markdown: {
    mermaid: true,
    // `mdx1CompatDisabledByDefault` above turns all of these off. We opt `admonitions` back
    // in: 174 admonitions across 87 files use the MDX v1 title form (`:::info Some title`),
    // and without this pass MDX v3 drops the title *silently* instead of failing the build.
    // `comments` and `headingIds` stay off — the content has no uses of either.
    mdx1Compat: {
      admonitions: true,
    },
    hooks: {
      onBrokenMarkdownImages: 'warn'
    },
  },
  themes: ['@docusaurus/theme-mermaid'],

  clientModules: [
    require.resolve('./src/clientModules/sidebarCollapse.js'),
  ],


  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pt'],
    path: 'i18n',
    localeConfigs: {
      en: {
        label: 'English',
        htmlLang: 'en-US',
        path: 'en',
        baseUrl: '/',
      },
      pt: {
        label: 'Português',
        htmlLang: 'pt-BR',
        path: 'pt',
        baseUrl: '/pt',
      },
    }
  },

  // vscode-languageserver-types (pulled in transitively by @docusaurus/theme-mermaid → mermaid →
  // @mermaid-js/parser → langium → vscode-languageserver) uses a UMD dynamic require() pattern
  // that webpack cannot statically analyze. The warning is harmless — it works fine at runtime —
  // so we suppress it here to keep the build output clean.
  plugins: [
    function() {
      return {
        name: 'suppress-vscode-languageserver-types-warning',
        configureWebpack() {
          return {
            ignoreWarnings: [
              { module: /vscode-languageserver-types/ }
            ]
          };
        }
      };
    }
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/byjg/byjg.github.io/tree/master/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/byjg/byjg.github.io/tree/master/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        gtag: {
          trackingID: 'G-T2GQTFR1XB',
          anonymizeIP: true,
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Opensource ByJG',
        logo: {
          alt: 'Opensource ByJG',
          src: 'img/logo.svg',
        },
        items: [
          {to: '/docs/php', label: 'PHP Components', position: 'left'},
          {to: '/docs/devops', label: 'Docker & DevOps', position: 'left'},
          {to: '/docs/js', label: 'Node & JS', position: 'left'},
          {to: '/docs/helm', label: 'Helm Chart', position: 'left'},
          {to: '/docs/packages', label: 'Linux Packages', position: 'left'},
          {to: '/blog', label: 'Blog', position: 'left'},
          {
            href: 'https://github.com/byjg',
            label: 'GitHub',
            position: 'right',
          },
          {
             type: 'localeDropdown', // This creates the language selector
             position: 'right', // Or 'left', depending on your preference
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'PHP',
                to: '/docs/php',
              },
              {
                label: 'Docker & DevOps',
                to: '/docs/devops',
              },
              {
                label: 'Node & Js',
                to: '/docs/js',
              },
              {
                label: 'Helm Charts',
                to: '/docs/helm',
              },
              {
                label: 'Linux Packages',
                to: '/docs/packages',
              },
              {
                label: 'About Opensource',
                to: '/docs/opensource',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/byjg',
              },
              {
                label: 'CodersRank',
                href: 'https://profile.codersrank.io/user/byjg',
              },
              {
                label: 'Mastodon',
                href: 'https://phpc.social/@byjg',
                // rel="me" is required for the Mastodon profile link verification.
                // Docusaurus sets rel="noopener noreferrer" on external links before
                // spreading item props, so we repeat those tokens to avoid dropping them.
                rel: 'me noopener noreferrer',
              },
              // {
              //   label: 'Twitter',
              //   href: 'https://twitter.com/docusaurus',
              // },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/byjg',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['php'],
      },
      algolia: {
        // The application ID provided by Algolia
        appId: '0B3ANWGIAF',

        // Public API key: it is safe to commit it
        apiKey: '2a19d51a8c5e298cc82369e4674ec8e1',

        indexName: 'Open Source ByJG Documentation',

        // Optional: see doc section below
        contextualSearch: true,

        // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
        externalUrlRegex: 'opensource\\.byjg\\.com',

        // Optional: Algolia search parameters
        searchParameters: {},

        // Optional: path for search page that enabled by default (`false` to disable it)
        searchPagePath: 'search',

        // Optional: whether the insights feature is enabled or not on Docsearch (`false` by default)
        insights: false,

        // Optional: whether you want to use the new Ask AI feature (undefined by default)
        //askAi: 'YOUR_ALGOLIA_ASK_AI_ASSISTANT_ID',
      },
    }),
};

export default config;
