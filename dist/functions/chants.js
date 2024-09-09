const lunr = require('lunr');

exports.handler = async function (event, context) {
  const { texte, tag } = event.queryStringParameters;
  if(!texte && !tag) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        help: 'les paramètres sont incomplets',
        available_parameters:[
          {texte: 'un texte à rechercher'},
          {tag: 'une catégorie (étape de la célébration ou temps liturgique spécifique)'}
        ]
      })
    };
  }
  const {chantsIndex, chantsData} = await initChants();
  var chants = searchChant(chantsIndex, chantsData, texte, tag);
  return {
    statusCode: 200,
    body: JSON.stringify(chants)
  };
};

async function initChants() {
  await fetch("https://saintefamille44.fr/index/chants.json").then(r => r.json()).then(function(data) {    
    chantsData = data;
    chantsIndex = lunr(function() {
        this.ref("ref");
        this.field("ref", {boost: 1});
        this.field("id", {boost: 10});
        this.field("tag", {boost: 10});
        this.field("titre", {boost: 10});
        this.field("text", {boost: 1});
        this.field("pdf", {boost: 1});
        idx = this;
        chantsData.forEach(function(page, index, array) {
            page.ref = page.id
            idx.add(page);
        });
    });
  })
  return {chantsIndex, chantsData};
}
function searchChant(chantsIndex, chantsData, texte, tag) {
    var q = '';
    if(tag) {
      tag.forEach(t=>{
        q += `+tag:${t} `;
      })
    }
    if(texte) q += `+${texte}`;
    console.log(q);
    return chantsIndex.search(q).map(i=>chantsData.find(d => i.ref==d.id))
}
