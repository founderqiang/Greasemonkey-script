// Function to expand all collapse items
async function expandAllCollapseItems() {
    const collapseHeaders = document.querySelectorAll('.fish-collapse-header[aria-expanded="false"]');
    for (const header of collapseHeaders) {
      header.click();
      // Wait a bit for the expansion animation to complete
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  // Function to find all resource items
  async function findAllResourceItems() {
    // First, expand all collapse items
    await expandAllCollapseItems();
  
    // Now find all elements with class "resource-item" and "resource-item-train"
    const resourceItems = document.querySelectorAll('.resource-item.resource-item-train');
  
    console.log(`Total resource items found: ${resourceItems.length}`);
  
    // Log details of each resource item
    resourceItems.forEach((item, index) => {
      const titleElement = item.querySelector('div:first-child');
      const statusElement = item.querySelector('.status-icon i');
      console.log(`Item ${index + 1}:`);
      console.log(`  Title: ${titleElement ? titleElement.textContent.trim() : 'N/A'}`);
      console.log(`  Status: ${statusElement ? statusElement.getAttribute('title') : 'N/A'}`);
    });
  
    return resourceItems;
  }
  
  // Execute the function
  findAllResourceItems().then(() => {
    console.log("Search completed. Check the results above.");
  }).catch(error => {
    console.error("An error occurred:", error);
  });
  
  // Set up a MutationObserver to watch for changes in the DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        console.log("DOM changed. Rechecking for resource items...");
        findAllResourceItems();
      }
    });
  });
  
  // Start observing the document with the configured parameters
  observer.observe(document.body, { childList: true, subtree: true });