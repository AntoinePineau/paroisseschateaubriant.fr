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