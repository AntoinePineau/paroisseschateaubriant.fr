// parce que les regex, c'est la vie!
String.prototype.replaceAll=function(s,r){return this.replace(new RegExp(s,'gm'),r)};

Mavo.Functions.telify = $.extend(readable => {
    return (readable + "")
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Convert accented letters to ASCII
        .replace(/[^\w\s-]/g, "") // Remove remaining non-ASCII characters
        .trim().replace(/\s+/g, "") // Remove whitespace
        .replace('0', '+33') // indicateur france
        .toLowerCase();
}, {
    multiValued: true
});

function openCalendar(url, w, h) {
  var t=screen.availTop + (screen.availHeight - h) / 2,
  l=screen.availLeft + (screen.availWidth - w) / 2;
  window.open(url, 'calendrier', 'menubar=no,status=no,location=no,resizable=no,scrollbars=no,toolbar=no,width='+w+',height='+h+',top='+t+',left='+l);
}

var contactLoaded = false;
function loadContacts() {
    if(contactLoaded) {
      return;
    }
    let $datalist = document.getElementById('contacts');
    if($datalist) {
        fetch('/contents/contacts.json')
        .then(r => r.json())
        .then(r => {
            let contacts = {};
            r.contact.forEach(c => {
                $datalist.innerHTML += '<option>'+c.id+'</option>';
                contacts[c.id] = c;
            });
            Array.from(document.querySelectorAll('span[mv-editor-list="contacts"]:not(:empty)')).forEach(span=>{
                let c = contacts[span.innerText];
                if(c && c.id) {
                    span.setAttribute('for', c.id);
                    let d = document.createElement('div');
                    d.setAttribute('id', c.id);
                    d.setAttribute('class', 'contact');
                    d.innerHTML += '<h5 class="nom">'+c.nom+'</h5>';
                    if(c.email) d.innerHTML += '<a href="mailto:'+c.email+'"><span class="fa-solid fa-envelope">'+c.email+'</span></a>';
                    if(c.telephone) d.innerHTML += '<a href="tel:'+Mavo.Functions.telify(c.telephone)+'"><span class="fa-solid fa-phone">'+c.telephone+'</span></a>';
                    span.parentNode.append(d);
                }
            });
            contactLoaded = true;
        })
        .catch(e => {console.error('Error:', e)});
    }
}

function addContactsSearch() {
    let $select = document.getElementById('fonction');
    if($select) {
        let options = [];
        // on cherche toutes les fonctions uniques
        Array.from(document.querySelectorAll('div[property="contact"] div[property="fonction"]:not(:empty)')).forEach(f=>{
            let o = f.innerText.split(/[, ]/)[0];
            if(!options.includes(o)) options.push(o)
        });
        // on remplit la datalist avec ces fonctions
        options.sort().forEach(f=>{
            $select.innerHTML += '<option value="'+f+'">'+f+'</option>';
        })
        // on ajoute l'interaction sur les champs de recherche
        $select.addEventListener('change',()=>{
            $text.value='';
            let $fonction = document.getElementById('fonction').value;
            Array.from(document.querySelectorAll('div.contact')).forEach(c=>{
                let fonction = c.getAttribute('data-fonction').split(/[, ]/)[0];
                if(!$fonction || fonction==$fonction) {
                    c.removeAttribute('hidden')
                } 
                else {
                    c.setAttribute('hidden','hidden')
                }
            });
        })
        let $text = document.getElementById('fulltext');
        $text.addEventListener('input',()=>{
            $select.value='';
            let text = $text.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            Array.from(document.querySelectorAll('div.contact')).forEach(c=>{
                let fulltext = c.getAttribute('data-fulltext');
                if(fulltext.indexOf(text)>-1) {
                    c.removeAttribute('hidden')
                } 
                else {
                    c.setAttribute('hidden','hidden')
                }
            });
        })
    }
}

var lunrIndex, pageIndex;
function initLunr() {
  fetch("/index/chants.json").then(r => r.json()).then(function(index) {    
    pagesIndex = index;
    lunrIndex = lunr(function() {
      this.ref("id");
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
      pagesIndex.forEach(function(page, index, array) {
        idx.add(page);
      });
    });
  })
}
  
function search(text, annee, temps, id, type) {
  return lunrIndex.search(query).map(function(result) {
    return pagesIndex.filter(function(page) {
      return page.id === result.id;
    })[0];
  });
}

var fullSearchIndex, fullSearchData;

function fullSearch(text) {
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

document.addEventListener('DOMContentLoaded',()=>{
    //initLunr();

    if(document.querySelector('main[mv-app=recherche]'))
        fullSearch(document.location.href.split('texte=')[1]);

    Mavo.inited
    //.then(() => Mavo.all[0].dataLoaded)
    .then(()=>{
      setTimeout(()=>{
        loadContacts();
      }, 500)
      return Mavo.all[0].dataLoaded
    })
    .then(()=>{
        setTimeout(()=>{
          loadContacts();
          addContactsSearch();
        }, 1000)
      });
})