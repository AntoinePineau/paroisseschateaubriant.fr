// parce que les regex, c'est la vie!
String.prototype.replaceAll=function(s,r){return this.replace(new RegExp(s,'gm'),r)};

function fullSearch(text) {
  if(!text) return;
  Array.from(document.querySelectorAll('input[type=text][name=texte]')).forEach(i=>{
    i.value = decodeURIComponent(text)
  })
  fetch(`/.netlify/functions/recherche/?texte=${text}`, { mode: 'no-cors' })
  .then(r => r.json())
  .then(results => {    
    var ol = document.createElement('ol');
    var resultsSection = document.getElementById('results');
    if(!results.length) {
      resultsSection.innerHTML = '<h2 property="pasderesultats" class="center">Pas de résultat</h2>';
      return;
    } 
    results.forEach(r=>{
        var result = document.createElement('li');
        var description = JSON.parse(r.c).description || "";
        description = description.replaceAll("<img [^>]+>", "");
        result.innerHTML = '<article class="result"><h3><a href="'+r.i+'">'+r.t+'</a></h3><span>'+description+'</span></article>';
        ol.append(result);
    });
    var resultsSection = document.getElementById('results');
    resultsSection.innerHTML = '<h2 property="resultats">Résultats:</h2>';
    resultsSection.append(ol);
  });
}