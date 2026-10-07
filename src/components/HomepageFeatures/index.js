import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import Link from "@docusaurus/Link";
import {useState} from 'react';

// Highlighted Projects - These are the featured/important projects
const HighlightedProjects = [
  {
    title: 'Parolsh',
    link: '/docs/ai/parolsh',
    image: require('@site/docs/ai/parolsh/images/logo-mark.png').default,
    description: (
      <>
        A shell where natural language is the default command language, working with any ACP agent.
      </>
    ),
  },
  {
    title: 'DockNimbus',
    link: '/docs/devops/nimbus',
    image: require('@site/docs/devops/nimbus/docknimbus-transparent.png').default,
    description: (
      <>
        Turns bare metal machines into a platform with compute, networking, storage and clusters.
      </>
    ),
  },
  {
    title: 'EasyHAProxy',
    link: '/docs/devops/docker-easy-haproxy',
    image: require('@site/docs/devops/docker-easy-haproxy/logo.png').default,
    description: (
      <>
        Simple and powerful HAProxy configuration with Docker support and auto-discovery services.
      </>
    ),
  },
  {
    title: 'N8N-GitOps',
    link: '/docs/devops/n8n-gitops',
    image: require('@site/docs/devops/n8n-gitops/n8n-gitops-256.png').default,
    description: (
      <>
        GitOps CLI tool for n8n that brings version control and collaborative workflow development.
      </>
    ),
  },
  {
    title: 'Gluo — PHP REST API Starter',
    link: '/docs/php/gluo',
    Svg: require('@site/static/img/php_logo.svg').default,
    description: (
      <>
        Production-ready PHP REST API starter with an updatable framework core (Gluo).
      </>
    ),
  },
  {
    title: 'Docker PHP',
    link: '/docs/devops/docker-php',
    Svg: require('@site/static/img/docker_logo.svg').default,
    description: (
      <>
        Production-ready PHP Docker images with multiple versions.
      </>
    ),
  },
];

// Steps - the path described in docs/opensource/ecosystem.md
const Steps = [
  {
    title: '1. Build',
    description: 'Start an application from Gluo and independent, reusable components.',
    links: [
      {label: 'Gluo', to: '/docs/php/gluo'},
      {label: 'PHP Components', to: '/docs/php'},
      {label: 'Node & JS', to: '/docs/js'},
    ],
  },
  {
    title: '2. Test locally',
    description: 'Run it on your machine with the same Docker images used in production.',
    links: [
      {label: 'Docker PHP', to: '/docs/devops/docker-php'},
    ],
  },
  {
    title: '3. Deploy',
    description: 'CI/CD builds the image and deploys it to a platform made from your machines.',
    links: [
      {label: 'DockNimbus', to: '/docs/devops/nimbus'},
      {label: 'Docker & DevOps', to: '/docs/devops'},
    ],
  },
  {
    title: '4. Run in production',
    description: 'The image you tested, behind a load balancer with service discovery.',
    links: [
      {label: 'EasyHAProxy', to: '/docs/devops/docker-easy-haproxy'},
    ],
  },
  {
    title: 'One standard',
    description: 'Independent projects, joined by automation: tests, releases and publishing to apt, dnf, brew and Helm.',
    links: [
      {label: 'Guidelines', to: '/docs/opensource/guidelines'},
      {label: 'Helm Charts', to: '/docs/helm'},
      {label: 'Linux Packages', to: '/docs/packages'},
    ],
  },
  {
    title: 'Docs for humans and AI',
    description: 'One documentation, read on this site and served to AI assistants.',
    links: [
      {label: 'ByJG Docs MCP', to: '/docs/ai/mcpserver-byjg-docs'},
      {label: 'Parolsh', to: '/docs/ai/parolsh'},
    ],
  },
];

function CarouselItem({Svg, image, link, title, description, disabled, position, onClick}) {
  const content = (
    <>
      <div className="text--center">
        {image ? (
          <img src={image} className={styles.carouselImage} alt={title} />
        ) : (
          <Svg className={styles.carouselImage} role="img" />
        )}
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </>
  );

  const itemClass = clsx(
    styles.carouselItem,
    styles[`carouselItem--${position}`],
    {[styles.disabled]: disabled}
  );

  // Side items are clickable to navigate
  if (position === 'left' || position === 'right') {
    return (
      <div className={itemClass} onClick={onClick} style={{cursor: 'pointer'}}>
        {content}
      </div>
    );
  }

  // Center item links to the project page
  if (disabled) {
    return (
      <div className={itemClass}>
        {content}
      </div>
    );
  }

  return (
    <div className={itemClass}>
      <Link to={link} className={styles.carouselLink}>
        {content}
      </Link>
    </div>
  );
}

function ProjectCarousel({projects}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const getCircularIndex = (index) => {
    return ((index % projects.length) + projects.length) % projects.length;
  };

  const goToNext = () => {
    setActiveIndex((prev) => getCircularIndex(prev + 1));
  };

  const goToPrev = () => {
    setActiveIndex((prev) => getCircularIndex(prev - 1));
  };

  const prevIndex = getCircularIndex(activeIndex - 1);
  const nextIndex = getCircularIndex(activeIndex + 1);

  return (
    <div className={styles.carouselContainer}>
      <button
        className={clsx(styles.carouselButton, styles.carouselButtonPrev)}
        onClick={goToPrev}
        aria-label="Previous project"
      >
        ‹
      </button>

      <div className={styles.carouselTrack}>
        <div className={styles.carouselItemWrapper}>
          <CarouselItem {...projects[prevIndex]} position="left" onClick={goToPrev} />
        </div>
        <div className={styles.carouselItemWrapper}>
          <CarouselItem {...projects[activeIndex]} position="center" />
        </div>
        <div className={styles.carouselItemWrapper}>
          <CarouselItem {...projects[nextIndex]} position="right" onClick={goToNext} />
        </div>
      </div>

      <button
        className={clsx(styles.carouselButton, styles.carouselButtonNext)}
        onClick={goToNext}
        aria-label="Next project"
      >
        ›
      </button>

      <div className={styles.carouselIndicators}>
        {projects.map((_, index) => (
          <button
            key={index}
            className={clsx(styles.carouselIndicator, {
              [styles.carouselIndicatorActive]: index === activeIndex
            })}
            onClick={() => setActiveIndex(index)}
            aria-label={`Go to project ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function Step({title, description, links}) {
  return (
    <div className={clsx('col col--4', styles.stepCol)}>
      <div className={clsx('card', styles.stepCard)}>
        <div className="card__header">
          <Heading as="h3">{title}</Heading>
        </div>
        <div className="card__body">
          <p>{description}</p>
        </div>
        <div className="card__footer">
          {links.map(({label, to}) => (
            <Link key={to} to={to} className={styles.stepLink}>{label}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <>
      {/* Highlighted Projects Carousel */}
      <section className={styles.highlightedSection}>
        <div className="container">
          <div className="text--center margin-bottom--lg">
            <Heading as="h2">Featured Projects</Heading>
          </div>
          <ProjectCarousel projects={HighlightedProjects} />
        </div>
      </section>

      {/* Steps Section */}
      <section className={styles.features}>
        <div className="container">
          <div className="text--center margin-bottom--lg">
            <Heading as="h2">From Idea to Production</Heading>
            <p>
              One path, the same containers and the same standard. <Link to="/docs/opensource/ecosystem">See how it fits together</Link>.
            </p>
          </div>
          <div className="row">
            {Steps.map((props, idx) => (
              <Step key={idx} {...props} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
