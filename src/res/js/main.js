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