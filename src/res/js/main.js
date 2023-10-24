// parce que les regex, c'est la vie!
String.prototype.replaceAll=function(s,r){return this.replace(new RegExp(s,'gm'),r)};

function openCalendar(url, w, h) {
  var t=screen.availTop + (screen.availHeight - h) / 2,
  l=screen.availLeft + (screen.availWidth - w) / 2;
  window.open(url, 'calendrier', 'menubar=no,status=no,location=no,resizable=no,scrollbars=no,toolbar=no,width='+w+',height='+h+',top='+t+',left='+l);
}

document.addEventListener('DOMContentLoaded',()=>{
  
    if(document.querySelector('main[mv-app=chants]')) {
      initPsaumes();
    }

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