document.addEventListener('DOMContentLoaded',()=>{

    if(document.querySelector('main[mv-app=chants]')) {
      initChants();
    }

    if(document.querySelector('main[mv-app=bible]')) {
      initBible();
    }

    if(document.querySelector('main[mv-app=recherche]'))
      fullSearch(document.location.href.split('texte=')[1]);

    let contactAppId = document.querySelector('main[mv-app=contact]') ? 'contact'
      : document.querySelector('main[mv-app=activites]') ? 'activites'
      : null;
    if(contactAppId) {
      Mavo.inited
        .then(() => Mavo.all[contactAppId].dataLoaded)
        .then(() => {
          setTimeout(() => {
            loadContacts();
            addContactsSearch();
          }, 500);
        });
    }

})