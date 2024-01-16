import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import Link from "@docusaurus/Link";

const FeatureList = [
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

function Feature({Svg, link, title, description}) {
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
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
