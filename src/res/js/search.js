var fullSearchIndex, fullSearchData;

function fullSearch(text) {
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
    fullSearchIndex.search('*'+text+'*').map(item => fullSearchData.find(doc => item.ref === doc.i)).forEach(r=>{
        var result = document.createElement('li');
        result.innerHTML = '<article class="result"><h3><a href="'+r.i+'">'+r.t+'</a></h3><span>'+JSON.parse(r.c).description+'</span></article>';
        ol.append(result);
    });
    document.getElementById('results').append(ol);
  });
}