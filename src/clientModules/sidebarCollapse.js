let allTopicsHidden = false;

function toggleSidebarTopics(hideOthers = true) {
  const sidebar = document.querySelector('.theme-doc-sidebar-menu');
  if (!sidebar) return;

  // Get all top-level list items (categories/topics)
  const topLevelItems = sidebar.querySelectorAll(':scope > li');

  // Find the active item - could be a category or a link with active state
  let activeItem = null;
  topLevelItems.forEach(item => {
    if (item.querySelector('.menu__link--active, .menu__list-item-collapsible--active')) {
      activeItem = item;
    }
  });

  if (!hideOthers) {
    // Show all topics
    topLevelItems.forEach(item => {
      item.style.display = '';
    });
    allTopicsHidden = false;
    removeBackButton();
    return;
  }

  // Hide non-active topics
  let hasHiddenItems = false;
  topLevelItems.forEach(item => {
    if (item !== activeItem && activeItem !== null) {
      item.style.display = 'none';
      hasHiddenItems = true;
    } else {
      item.style.display = '';
    }
  });

  if (hasHiddenItems) {
    allTopicsHidden = true;
    addBackButton(sidebar);
  } else {
    removeBackButton();
  }
}

function addBackButton(sidebar) {
  // Remove existing button if any
  removeBackButton();

  const backButton = document.createElement('button');
  backButton.id = 'sidebar-show-all';
  backButton.textContent = '← Show All Topics';
  backButton.className = 'button button--secondary button--sm';
  backButton.style.cssText = 'margin: 10px; width: calc(100% - 20px);';

  backButton.onclick = () => toggleSidebarTopics(false);

  sidebar.parentElement.insertBefore(backButton, sidebar);
}

function removeBackButton() {
  const existingButton = document.getElementById('sidebar-show-all');
  if (existingButton) {
    existingButton.remove();
  }
}

export function onRouteDidUpdate({location, previousLocation}) {
  if (typeof window === 'undefined') return;

  setTimeout(() => {
    // Don't collapse on index pages (README pages)
    const indexPages = ['/docs/php', '/docs/devops', '/docs/js', '/docs/helm'];
    const isIndexPage = indexPages.some(page => location.pathname === page || location.pathname === page + '/');

    if (isIndexPage) {
      // Show all topics on index pages
      toggleSidebarTopics(false);
    } else {
      // Collapse to show only active topic on detail pages
      toggleSidebarTopics(true);
    }
  }, 100);
}
