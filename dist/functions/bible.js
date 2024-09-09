const lunr = require('lunr');

exports.handler = async function (event, context) {
  const { ref } = event.queryStringParameters;
  if(!ref) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        help: 'aucune référence fournie',
        available_parameters:[
          {ref: 'une référence biblique du type "Mc 6, 7-13"'}
        ]
      })
    };
  }
  const {bibleIndex, bibleData} = await initBibleIndex();
  var lectures = searchLecturesByReference(lecturesIndex, lecturesData, bibleIndex, bibleData);
  return {
    statusCode: 200,
    body: JSON.stringify(lectures)
  };
};

async function initBibleIndex() {
  await fetch("https://saintefamille44.fr/index/bible/livres.json").then(r => r.json()).then(function(data) {    
    bibleData = data;
    bibleIndex = lunr(function() {
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
      idx = this;
      bibleData.forEach(function(page, index, array) {
        idx.add(page);
      });
    });
  })
  return {bibleIndex, bibleData}
}

function searchLecturesByReference(lecturesIndex, lecturesData, ref) {
  // TODO
  return []
  //var q = `+ref:${idifyLecture(lecturesIndex, lecturesData, t.anneeLiturgique, t.tempsLiturgique, t.numeroSemaine, t.jourSemaine)}`;
  //return lecturesIndex.search(q).map(i=>lecturesData.find(d => i.ref==idifyLecture(d.annee, d.temps, d.semaine, d.jour)))
}