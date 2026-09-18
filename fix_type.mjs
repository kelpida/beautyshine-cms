import fs from 'fs';
const data = JSON.parse(fs.readFileSync('database/seeders/data/pages_export.json', 'utf8'));

data.forEach(page => {
  if (page.blocks) {
    page.blocks.forEach(block => {
      if (Array.isArray(block.content)) {
        block.content.forEach(c => {
          if (c.type === "custom") {
            c.type = "feature";
          }
        });
      }
    });
  }
});

fs.writeFileSync('database/seeders/data/pages_export.json', JSON.stringify(data, null, 2));
console.log('Fixed types in pages_export.json');
