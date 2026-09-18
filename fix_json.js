const fs = require('fs');
const data = JSON.parse(fs.readFileSync('database/seeders/data/pages_export.json', 'utf8'));

data.forEach(page => {
  if (page.blocks) {
    page.blocks.forEach(block => {
      // The current block.content is an object (e.g., {"en": {...}})
      // We want to turn it into an array of blocks that FlexibleContentBuilder expects
      const currentContent = block.content;
      
      block.content = [
        {
          id: `block-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          type: "custom",
          label: block.label || block.component_name, // e.g. "HomeIntro"
          content: currentContent
        }
      ];
    });
  }
});

fs.writeFileSync('database/seeders/data/pages_export.json', JSON.stringify(data, null, 2));
console.log('Fixed pages_export.json');
