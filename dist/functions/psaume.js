const lunr = require('lunr');

exports.handler = async function (event, context) {
  const { texte, annee, temps, semaine } = event.queryStringParameters;
  if(!texte && !annee && !temps && !semaine) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        help: 'les paramètres sont incomplets',
        available_parameters:[
          {texte: 'un texte à rechercher'},
          {annee: 'l\'année liturgique'},
          {temps: 'le temps liturgique'},
          {semaine: 'la semaine liturgique'}
        ]
      })
    };
  }
  const {psaumeIndex, psaumeData} = await initPsaumes();
  var psaumes = searchPsaume(psaumeIndex, psaumeData, texte, annee, temps,semaine);
  return {
    statusCode: 200,
    body: JSON.stringify(psaumes)
  };
};


function idifyPsaume(annee, temps, id) {
  id = (id+'').replaceAll(' ','');
  return `${id}(${annee})${temps}`
}
async function initPsaumes() {
  await fetch("https://paroisseschateaubriant.fr/index/psaumes.json").then(r => r.json()).then(function(data) {    
    psaumeData = data;
    psaumeIndex = lunr(function() {
      this.ref("ref");
      this.field("ref", {boost: 1});
      this.field("id", {boost: 10});
      this.field("type", {boost: 10});
      this.field("temps", {boost: 5});
      this.field("annee", {boost: 1});
      this.field("date", {boost: 2});
      this.field("nom", {boost: 8});
      this.field("titre", {boost: 10});
      this.field("text", {boost: 1});
      this.field("pdf", {boost: 1});
      this.metadataWhitelist = ['position', 'type', 'temps', 'annee']
      idx = this;
      psaumeData.forEach(function(page, index, array) {
        page.ref = idifyPsaume(page.annee,page.temps,page.id)
        idx.add(page);
      });
    });
  })
  return {psaumeIndex, psaumeData};
}
function searchPsaume(psaumeIndex, psaumeData, texte, annee, temps, id) {
  var q = '';
  if(id&&temps&&annee) {
    q = `+ref:${idifyPsaume(annee, temps, id)}`
  }
  else {
    if(id) q += `+id:${id} `;
    if(temps) q += `+temps:${temps} `;
    if(annee) q += `+annee:${annee} `;
    if(texte) q += `+${texte}`;
  }
  return psaumeIndex.search(q).map(i=>psaumeData.find(d => i.ref==idifyPsaume(d.annee, d.temps, d.id)))
}
