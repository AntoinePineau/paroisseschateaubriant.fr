const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

exports.onPreBuild = async ({ inputs }) => {
  const { jsonPath, indexPath } = inputs;

  // Chemin complet vers le script de génération d'index
  const scriptPath = path.join(__dirname, 'generate-index.js');

  // Exécuter le script de génération d'index
  const child = child_process.spawn('node', [scriptPath], {
    stdio: 'inherit',
    env: {
      JSON_PATH: jsonPath,
      INDEX_PATH: indexPath,
    },
  });

  await new Promise((resolve) => {
    child.on('close', resolve);
  });
};
