// parce que les regex, c'est la vie!
String.prototype.replaceAll=function(s,r){return this.replace(new RegExp(s,'gm'),r)};

var fullSearchIndex, fullSearchData;

function fullSearch(text) {
  if(!text) return;
  text = decodeURIComponent(text);
  Array.from(document.querySelectorAll('input[type=text][name=texte]')).forEach(i=>{
    i.value = text
  })
  fetch('/index/full-search.json')
  .then(r => r.json())
  .then(data => {
    fullSearchData = data;
    fullSearchIndex = lunr(function() {
        this.ref("i");
        this.field("i", {boost: 10});
        this.field("t", {boost: 10});
        this.field("c", {boost: 5});
        idx = this;
        data.forEach(function(page, index, array) {
          idx.add(page);
        });
    });
    var ol = document.createElement('ol');
    var results = fullSearchIndex.search('*'+text+'*').map(item => fullSearchData.find(doc => item.ref === doc.i));
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