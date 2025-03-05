function quickPartialRefresh() {
  const refreshedPages = ['/config/site-styles/colors/theme-editor', '/config/site-styles/fonts/assign-styles'];

  if (refreshedPages.some((page) => window.location.href.includes(page))) {
    const alreadyRefreshed = sessionStorage.getItem('partial-refreshed'); // Check if already refreshed
    if (!alreadyRefreshed) {
      sessionStorage.setItem('partial-refreshed', 'true'); // Mark as refreshed

      // Remove old elements
      const oldInfo = document.querySelector('.info');
      const oldSearchBarContainer = document.querySelector('.search-bar-container');
      if (oldInfo) oldInfo.remove();
      if (oldSearchBarContainer) oldSearchBarContainer.remove();

      // Reinitialize components
      addSearchBar();
    }
  } else {
    sessionStorage.removeItem('partial-refreshed'); // Reset for other pages
  }
}


function toggleVisibility() {
  const visiblePages = ['/config/site-styles/colors/theme-editor', '/config/site-styles/fonts/assign-styles'];
  const shouldBeVisible = visiblePages.some((page) => window.location.href.includes(page));

  const infoDiv = document.querySelector('.info');
  const searchBarContainer = document.querySelector('.search-bar-container');

  if (infoDiv) infoDiv.style.display = shouldBeVisible ? 'block' : 'none';
  if (searchBarContainer) searchBarContainer.style.display = shouldBeVisible ? 'flex' : 'none';
}

function monitorUrlChanges(callback) {
  let lastUrl = window.location.href;

  const observer = new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      callback(); // Trigger the callback on URL change
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function addSearchBar() {
  const panelContent = document.querySelector('.sqs-damask-panel .sqs-damask-panel-content');

  if (panelContent && !document.querySelector('.search-bar-container')) {
    // Create a container for the search bar and buttons
    const searchBarContainer = document.createElement('div');
    searchBarContainer.className = 'search-bar-container';

    // Create the info div
    const infoDiv = document.createElement('div');
    infoDiv.className = 'info';

    // Add an <h1> and <p> inside the info div
    const infoHeader = document.createElement('h1');
    infoHeader.textContent = 'Style search - by Mary Philip';
    infoHeader.className = 'info-header';

    const infoParagraph = document.createElement('p');
    infoParagraph.textContent =
      'Press Enter to submit, Up Arrow for Previous, Down Arrow for Next, and Clear to reset. Use color profile dropdown to change colour sections.';
    infoParagraph.className = 'info-paragraph';

    // Append header and paragraph to info div
    infoDiv.appendChild(infoHeader);
    infoDiv.appendChild(infoParagraph);

    // Create the search bar
    const searchBar = document.createElement('input');
    searchBar.type = 'text';
    searchBar.placeholder = 'Search styles...';
    searchBar.className = 'search-bar';

    // Create the submit button
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Search';
    submitButton.className = 'submit-button';

    // Create the clear button
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear';
    clearButton.className = 'clear-button';

    // Create a div to display the result count
    const resultCountDiv = document.createElement('div');
    resultCountDiv.className = 'result-count';
    resultCountDiv.textContent = 'Results: 0'; // Default text

    // Add functionality
    let matches = [];
    let currentIndex = -1;

    function clearHighlights() {
      matches.forEach((item) => item.classList.remove('highlight'));
    }

    function updateResultCount() {
      resultCountDiv.textContent = `Results: ${matches.length}`;
    }

    function filterItems(query) {
      clearHighlights();
      matches = [];

      const items = panelContent.querySelectorAll('.css-1axxlay, .KofNk8v8V1kYSCxICQHW, .css-orbjoe, .css-1am4twh'); // Update selector as needed
      items.forEach((item) => {
        if (item.textContent.toLowerCase().includes(query)) {
          matches.push(item);
          item.classList.add('highlight');
        }
      });

      updateResultCount();

      if (matches.length > 0) {
        currentIndex = 0;
        scrollToMatch();
      } else {
        alert('No matches found.');
        currentIndex = -1;
      }
    }

    function scrollToMatch() {
      if (currentIndex >= 0 && matches[currentIndex]) {
        matches[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    function nextMatch() {
      if (matches.length > 0) {
        currentIndex = (currentIndex + 1) % matches.length;
        scrollToMatch();
      }
    }

    function prevMatch() {
      if (matches.length > 0) {
        currentIndex = (currentIndex - 1 + matches.length) % matches.length;
        scrollToMatch();
      }
    }

    function clearSearch() {
      searchBar.value = '';
      clearHighlights();
      matches = [];
      currentIndex = -1;
      updateResultCount();

      // Scroll to the top of the .css-1xrktrz div
      const targetDiv = document.querySelector('.css-1xrktrz, .css-1nssvvk');
      if (targetDiv) {
        targetDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    // Add event listeners
    submitButton.addEventListener('click', () => filterItems(searchBar.value.toLowerCase()));
    clearButton.addEventListener('click', clearSearch);
    searchBar.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        filterItems(searchBar.value.toLowerCase());
      } else if (event.key === 'ArrowDown') {
        nextMatch();
      } else if (event.key === 'ArrowUp') {
        prevMatch();
      }
    });

    // Append elements to the search bar container
    searchBarContainer.appendChild(searchBar);
    searchBarContainer.appendChild(submitButton);
    searchBarContainer.appendChild(clearButton);
    searchBarContainer.appendChild(resultCountDiv);

    // Append info div and search bar container to the body
    document.body.appendChild(infoDiv);
    document.body.appendChild(searchBarContainer);
  }
}

function monitorDomChanges() {
  const observer = new MutationObserver(() => {
    const panelContent = document.querySelector('.sqs-damask-panel .sqs-damask-panel-content');

    if (panelContent) {
      addSearchBar();
      toggleVisibility();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Initialize the search bar, monitor DOM and URL changes
quickPartialRefresh(); // Perform an initial refresh if necessary
addSearchBar();
monitorDomChanges();
monitorUrlChanges(() => {
  quickPartialRefresh(); // Handle URL changes dynamically
  addSearchBar(); // Reinitialize the search bar on URL change
  toggleVisibility(); // Toggle visibility on URL change
});
