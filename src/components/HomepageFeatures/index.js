import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import Link from "@docusaurus/Link";
import {useState, useEffect} from 'react';

// Highlighted Projects - These are the featured/important projects
const HighlightedProjects = [
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
    link: '#', // TBD - will be updated when documentation is ready
    Svg: require('@site/static/img/docker_logo.svg').default,
    description: (
      <>
        GitOps workflow automation with N8N (Coming Soon).
      </>
    ),
    disabled: true,
  },
  {
    title: 'PHP Rest Reference',
    link: '/docs/php/rest-reference-architecture',
    Svg: require('@site/static/img/php_logo.svg').default,
    description: (
      <>
        Complete reference architecture for building REST APIs in PHP.
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

// Main Groups - These are the category navigation
const MainGroups = [
  {
    title: 'PHP Components',
    link: '/docs/php',
    Svg: require('@site/static/img/php_logo.svg').default,
    description: (
      <>
          Check the documentation for the Opensource PHP components.
      </>
    ),
  },
  {
    title: 'Docker & DevOps',
    link: '/docs/devops',
    Svg: require('@site/static/img/docker_logo.svg').default,
    description: (
      <>
        Docker images and DevOps tools.
      </>
    ),
  },
  {
    title: 'Node & JS',
    link: '/docs/js',
    Svg: require('@site/static/img/nodejs_logo.svg').default,
    description: (
      <>
        Components for Node and JS.
      </>
    ),
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

function MainGroup({Svg, link, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Link to={link}><Svg className={styles.featureSvg} role="img" /></Link>
      </div>
      <div className="text--center padding-horiz--md">
        <Link to={link}><Heading as="h3">{title}</Heading>
        <p>{description}</p></Link>
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

      {/* Main Groups Section */}
      <section className={styles.features}>
        <div className="container">
          <div className="text--center margin-bottom--lg">
            <Heading as="h2">Explore by Category</Heading>
          </div>
          <div className="row">
            {MainGroups.map((props, idx) => (
              <MainGroup key={idx} {...props} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
