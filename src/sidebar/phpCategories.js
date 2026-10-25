/**
 * Groups the PHP components of the sidebar by category.
 *
 * Each component declares its category in the front matter of its README
 * (`sidebar_category: data-access`), which add-doc copies as it is. The categories
 * themselves, their labels, order and descriptions, are in data/php-categories.json.
 *
 * Only the sidebar is grouped: the documents stay where they are, so every URL
 * (/docs/php/<component>/) is unchanged. A component without a known category is
 * listed under "Other", so it is never dropped from the sidebar.
 */
const categories = require('../../data/php-categories.json');

const PHP_DIR = 'php';

// The id of the document that represents a top-level sidebar item: the page itself,
// or the README a component folder links to.
function docIdOf(item) {
  if (item.type === 'doc') {
    return item.id;
  }
  if (item.type === 'category' && item.link?.type === 'doc') {
    return item.link.id;
  }
  return null;
}

function groupByCategory(items, docs) {
  const categoryOf = new Map(docs.map((doc) => [doc.id, doc.frontMatter.sidebar_category]));
  const known = new Set(categories.map((category) => category.key));

  const head = [];
  const grouped = new Map(categories.map((category) => [category.key, []]));
  const other = [];

  for (const item of items) {
    const id = docIdOf(item);
    // The page of the php folder itself (the dependency graph) stays on top.
    if (id === `${PHP_DIR}/README`) {
      head.push(item);
      continue;
    }
    const category = categoryOf.get(id);
    if (known.has(category)) {
      grouped.get(category).push(item);
    } else {
      other.push(item);
    }
  }

  const sections = categories
    .filter((category) => grouped.get(category.key).length > 0)
    .map((category) => ({
      type: 'category',
      label: category.label,
      collapsed: true,
      link: {
        type: 'generated-index',
        title: category.label,
        description: category.description,
        slug: `/${PHP_DIR}/category/${category.key}`,
      },
      items: grouped.get(category.key),
    }));

  if (other.length > 0) {
    sections.push({type: 'category', label: 'Other', collapsed: true, items: other});
  }

  return [...head, ...sections];
}

module.exports = async function sidebarItemsGenerator({defaultSidebarItemsGenerator, ...args}) {
  const items = await defaultSidebarItemsGenerator(args);
  if (args.item.dirName !== PHP_DIR) {
    return items;
  }
  return groupByCategory(items, args.docs);
};
