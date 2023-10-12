const fs = require('fs');
const path = require('path');
//const lunr = require('lunr');

/* REMOVE TO TEST
var env = {
    JSON_PATH: "dist/contents/",
    INDEX_PATH: "dist/index/full-search.json"
};
*/

function readJsonFilesFromDirectory(directoryPath, callback) {
    fs.readdir(directoryPath, (error, files) => {
      if (error) {
        console.error('Error reading directory:', error);
        return;
      }
  
      files.forEach((file) => {
        const filePath = path.join(directoryPath, file);
  
        fs.stat(filePath, (error, stats) => {
          if (error) {
            console.error('Error getting file stats:', error);
            return;
          }
  
          if (stats.isDirectory()) {
            // If it's a directory, recursively call the function
            readJsonFilesFromDirectory(filePath, callback);
          } else if (path.extname(filePath).toLowerCase() === '.json') {
            // If it's a JSON file, read and process it
            fs.readFile(filePath, 'utf8', (error, data) => {
              if (error) {
                console.error('Error reading JSON file:', error);
                return;
              }
  
              try {
                const jsonData = JSON.parse(data);
                callback(filePath, jsonData);
              } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
              }
            });
          }
        });
      });
    });
}
  
/* Créer un index de recherche avec Lunr.js
var index;
const lunrIndex = lunr(function () {
    index = this;
    this.ref('i');
    this.field('i');
    this.field('t'); 
    this.field('c');
});
*/
var array = [];
readJsonFilesFromDirectory(env.JSON_PATH, function(filepath, json){
    // console.log(filepath, json);
    var doc = {
        "i": '/'+filepath.split('/').slice(2).join('/').replace('.json', '/'),
        "t": json.titre,
        "c": JSON.stringify(json)
    };
    //console.log(doc);
    //index.add(doc);
    array.push(doc);

    // Sauvegarder l'index dans un fichier JSON
    //fs.writeFileSync(env.INDEX_PATH, JSON.stringify(lunrIndex), 'utf-8');
    fs.writeFileSync(env.INDEX_PATH, JSON.stringify(array), 'utf-8');
});

