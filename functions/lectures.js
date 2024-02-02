const lunr = require('lunr');

exports.handler = async function (event, context) {
  const { texte, annee, temps, semaine, jour } = event.queryStringParameters;
  if(!jour && !annee && !temps && !semaine) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        help: 'les paramètres sont incomplets',
        available_parameters:[
          {texte: 'un texte à rechercher'},
          {annee: 'l\'année liturgique'},
          {temps: 'le temps liturgique'},
          {semaine: 'la semaine liturgique'},
          {jour: 'le jour dans la semaine liturgique'}
        ]
      })
    };
  }
  const {lecturesIndex, lecturesData} = await initLecturesIndex();
  var lectures = searchLecturesByTempsLiturgique(lecturesIndex, lecturesData, texte, annee, temps, semaine, jour);
  return {
    statusCode: 200,
    body: JSON.stringify(lectures)
  };
};

function idifyLecture(annee, temps, semaine, jour) {
  return `${jour},${semaine}(${annee})${temps}`
}

async function initLecturesIndex() {
  await fetch("https://paroisseschateaubriant.fr/index/lectures.json").then(r => r.json()).then(function(data) {    
    lecturesData = data;
    lecturesIndex = lunr(function() {
      this.ref("ref");
      this.field("ref", {boost: 1});
      this.field("id", {boost: 10});
      this.field("annee", {boost: 10});
      this.field("temps", {boost: 5});
      this.field("semaine", {boost: 1});
      this.field("jour", {boost: 2});
      this.field("date", {boost: 8});
      this.field("originalDate", {boost: 10});
      this.field("lectures", {boost: 1});
      idx = this;
      lecturesData.forEach(function(page, index, array) {
        page.ref = idifyLecture(page.annee,page.temps,page.semaine,page.jour)
        idx.add(page);
      });
    });
  })
  return {lecturesIndex, lecturesData}
}

function searchLecturesByTempsLiturgique(lecturesIndex, lecturesData, texte, annee, temps, semaine, jour) {
  var q = '';
  if(jour&&semaine&&temps&&annee) {
    q = `+ref:${idifyLecture(annee, temps, semaine, jour)}`
  }
  else {
    if(jour) q += `+jour:${jour} `;
    if(semaine) q += `+semaine:${semaine} `;
    if(temps) q += `+temps:${temps} `;
    if(annee) q += `+annee:${annee} `;
    if(texte) q += `+"${texte}"`;
  }
  return lecturesIndex.search(q).map(i=>lecturesData.find(d => i.ref==idifyLecture(d.annee, d.temps, d.semaine, d.jour)))
}