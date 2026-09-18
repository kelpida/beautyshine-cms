import fs from 'fs';
const data = JSON.parse(fs.readFileSync('database/seeders/data/pages_export.json', 'utf8'));

data.forEach(page => {
  if (page.blocks) {
    page.blocks.forEach(block => {
      const currentContent = block.content;
      // if it's not already an array
      if (!Array.isArray(currentContent)) {
        block.content = [
          {
            id: `block-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            type: "custom",
            label: block.label || block.component_name,
            content: currentContent
          }
        ];
      }
    });
  }
});

fs.writeFileSync('database/seeders/data/pages_export.json', JSON.stringify(data, null, 2));
console.log('Fixed pages_export.json');
