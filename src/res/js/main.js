String.prototype.replaceAll=function(s,r){return this.replace(new RegExp(s,'gm'),r)};

/* custom code */
function addMenuInteraction() {
    var navButton = document.querySelector('nav button');
    navButton.addEventListener('click', function() {
        let expanded = this.getAttribute('aria-expanded') === 'true' || false;
        this.setAttribute('aria-expanded', !expanded);
        let menu = this.nextElementSibling;
        navButton.querySelector('span').innerText = expanded ? '☰' : '✕';
    });
}

function loadContacts() {
    let $datalist = document.getElementById('contacts');
    if($datalist) {
        fetch('/contacts.json')
        .then(r => r.json())
        .then(r => {
            let contacts = {};
            r.contact.forEach(c => {
                $datalist.innerHTML += '<option value="'+c.id+'"></option>';
                contacts[c.id] = c;
            });
            Array.from(document.querySelectorAll('span[mv-editor-list="contacts"]:not(:empty)')).forEach(span=>{
                let c = contacts[span.innerText];
                span.setAttribute('for', c.id);
                let d = document.createElement('div');
                d.setAttribute('id', c.id);
                d.setAttribute('class', 'contact');
                d.innerHTML += '<span class="nom">'+c.nom+'</span>';
                d.innerHTML += '<a href="mailto:'+c.email+']"><span class="fa-solid fa-envelope">'+c.email+'</span></a>';
                d.innerHTML += '<a href="tel:'+c.telephone.replaceAll(' ','')+']"><span class="fa-solid fa-phone">'+c.telephone+'</span></a>';
                span.parentNode.append(d);
            });
        })
        .catch(e => {console.error('Error:', e)});
    }
}

document.addEventListener('DOMContentLoaded',()=>{
    addMenuInteraction();    

    Mavo.inited
    .then(() => Mavo.all[0].dataLoaded)
    .then(()=>{
      loadContacts();
    });
})