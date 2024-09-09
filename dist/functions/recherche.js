const lunr = require('lunr');

exports.handler = async function (event, context) {
  const { texte } = event.queryStringParameters;
  if(!texte) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        help: 'les paramètres sont incomplets',
        available_parameters:[
          {texte: 'un texte à rechercher'}
        ]
      })
    };
  }
  const {fullsearchIndex, fullsearchData} = await initFullsearch();
  var results = search(fullsearchIndex, fullsearchData, decodeURIComponent(texte));
  return {
    statusCode: 200,
    body: JSON.stringify(results)
  };
};

async function initFullsearch() {
  await fetch("https://saintefamille44.fr/index/full-search.json").then(r => r.json()).then(function(data) {    
    fullsearchData = data;
    fullsearchIndex = lunr(function() {
      this.ref("i");
      this.field("i", {boost: 10});
      this.field("t", {boost: 10});
      this.field("c", {boost: 5});
      idx = this;
      fullsearchData.forEach(function(page, index, array) {
        idx.add(page);
      });
    });
  })
  return {fullsearchIndex, fullsearchData};
}
function search(fullsearchIndex, fullsearchData, texte) {
  return fullsearchIndex.search('*'+texte+'*').map(item => fullsearchData.find(doc => item.ref === doc.i))
}
