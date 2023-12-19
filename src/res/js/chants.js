
function calculer1erDimancheAvent(annee) {
    var date = new Date(annee, 11, 25);
    date.setDate(date.getDate() - 22);
    while (date.getDay() !== 0) {
        date.setDate(date.getDate() - 1);
    }
    return date;
}

function calculerDatePaques(annee) {
    var a = annee % 19;
    var b = Math.floor(annee / 100);
    var c = annee % 100;
    var d = Math.floor(b / 4);
    var e = b % 4;
    var f = Math.floor((b + 8) / 25);
    var g = Math.floor((b - f + 1) / 3);
    var h = (19 * a + b - d - g + 15) % 30;
    var i = Math.floor(c / 4);
    var k = c % 4;
    var l = (32 + 2 * e + 2 * i - h - k) % 7;
    var m = Math.floor((a + 11 * h + 22 * l) / 451);
    var mois = Math.floor((h + l - 7 * m + 114) / 31);
    var jour = ((h + l - 7 * m + 114) % 31) + 1;

    // Conversion en objet Date JavaScript.
    var datePaques = new Date(annee, mois - 1, jour);

    return datePaques;
}

function nbJours(d1, d2) {
  return Math.floor(Math.abs(d1 - d2) / (1000 * 60 * 60 * 24));
}

function determinerTempsLiturgique(date) {
    date.setHours(0);
    var annee = date.getFullYear();

    // Calculer les dates clés
    var dateAvent = calculer1erDimancheAvent(annee);
    var dateNoel = new Date(annee, 11, 25);
    var anneeLiturgique=annee;
    if(date>=calculer1erDimancheAvent(annee)) anneeLiturgique++;
    else {
      dateAvent = calculer1erDimancheAvent(annee - 1);
    var dateNoel = new Date(annee - 1, 11, 25);
    }
    anneeLiturgique = (anneeLiturgique % 3 === 0) ? "C" : ((anneeLiturgique % 3 === 1) ? "A" : "B");

    var dimancheQuiSuitLEpiphanie = new Date(dateNoel.getFullYear(), dateNoel.getMonth(), dateNoel.getDate()+12);
    do {
      dimancheQuiSuitLEpiphanie.setDate(dimancheQuiSuitLEpiphanie.getDate() + 1);
    }
    while (dimancheQuiSuitLEpiphanie.getDay() !== 0);

    var datePaques = calculerDatePaques(annee);    
    var dateMercrediCendres = new Date(datePaques);
    dateMercrediCendres.setDate(datePaques.getDate() - 46);
    var datePentecote = new Date(datePaques);
    datePentecote.setDate(datePaques.getDate() + 49);

    // déterminer le temps liturgique
    var tempsLiturgique = '';
    var numeroSemaine = 0;
    // du 1er dimanche de l'avent jusqu'à Noël exclus => temps de l'avent
    if(date>=calculer1erDimancheAvent(annee) && date<dateNoel) {
      tempsLiturgique = "Avent";
      var nb = nbJours(dateAvent, date);
      numeroSemaine = Math.floor(nb / 7) + 1;
    }
    // de Noël jusqu'au dimanche  qui suit le 6 janvier => temps de Noël
    else if(date>=dateNoel && date<=dimancheQuiSuitLEpiphanie) {
      tempsLiturgique = "Noël";
      if(date.getTime()==new Date(date.getFullYear(),11,25).getTime()) { // 25 décembre
        numeroSemaine = 'Nativité du Seigneur';
      }
      else if(date.getTime()==new Date(date.getFullYear(),11,31).getTime()) { // 31 décembre
        numeroSemaine = 'La Sainte Famille';
      }
      else if(date.getTime()==new Date(date.getFullYear(),0,1).getTime()) { // 1er janvier
        numeroSemaine = 'Sainte Marie, Mère de Dieu';
      }
      else if(date.getTime()==dimancheQuiSuitLEpiphanie.getTime()) { // Epiphanie
        numeroSemaine = 'L\'Epiphanie du Seigneur';
      }
      else if(date.getTime()==new Date(dimancheQuiSuitLEpiphanie.getFullYear(),dimancheQuiSuitLEpiphanie.getMonth(),dimancheQuiSuitLEpiphanie.getDate()+1).getTime()) { // le lundi qui suit l'Epihpanie
        numeroSemaine = 'Le Baptême du Seigneur';
      }
      else {
        var nb = nbJours(dateNoel, date);
        numeroSemaine = Math.floor(nb / 7) + 1;
      }
    }
    // du dimanche qui suit le 6 janvier au mercredi des cendres exclus => temps ordinaire
    else if(date>dimancheQuiSuitLEpiphanie && date<dateMercrediCendres) {
      tempsLiturgique = "Ordinaire";
      var nb = nbJours(new Date(dimancheQuiSuitLEpiphanie.getFullYear(), dimancheQuiSuitLEpiphanie.getMonth(), dimancheQuiSuitLEpiphanie.getDate()+1), date);
      numeroSemaine = Math.floor(nb / 7) + 1;
    }
    // du mercredi des cendres jusqu'à Pâques exclus => temps du carême
    else if(date>=dateMercrediCendres && date<datePaques) {
      tempsLiturgique = "Carême";
      if(date.getTime()==new Date(datePaques.getFullYear(),datePaques.getMonth(),datePaques.getDate()-1).getTime()) { // Samedi saint
        numeroSemaine = 'Veillée pascale';
      }
      else if(date.getTime()==new Date(datePaques.getFullYear(),datePaques.getMonth(),datePaques.getDate()-2).getTime()) { // Vendredi saint
        numeroSemaine = 'Vendredi saint';
      }
      else if(date.getTime()==new Date(datePaques.getFullYear(),datePaques.getMonth(),datePaques.getDate()-3).getTime()) { // Jeudi saint
        numeroSemaine = 'Jeudi saint';
      }
      else if(date.getTime()==new Date(datePaques.getFullYear(),datePaques.getMonth(),datePaques.getDate()-7).getTime()) { // le dimanche qui précède Pâques
        numeroSemaine = 'Dimanche des Rameaux et de la Passion';
      }
      else if(date.getTime()==dateMercrediCendres.getTime()) { // Mercredi des Cendres
        numeroSemaine = 'Mercredi des Cendres';
      }
      /*else if(date==new Date(datePaques.getFullYear(),datePaques.getMonth(),datePaques.getDate()-3)) { // Le jeudi saint au matin
        numeroSemaine = 'Messe christmale';
      }*/
      else {
        var premierDimancheDeCareme = new Date(dateMercrediCendres.getFullYear(),dateMercrediCendres.getMonth(), dateMercrediCendres.getDate()+5);
        var nb = nbJours(premierDimancheDeCareme, date);
        numeroSemaine = Math.floor(nb / 7) + 1;
      }
    }
    // du dimanche de pâques au dimanche de la pentecôte => temps pascal
    else if(date>=datePaques && date<=datePentecote) {
      tempsLiturgique = "Pascal";
      if(date.getTime() == datePaques.getTime()) { // Pâques
        numeroSemaine = 'Dimanche de la Résurrection';
      }
      else if(date.getTime()==new Date(datePaques.getFullYear(),datePaques.getMonth(),datePaques.getDate()+39).getTime()) { // 39 jours après Pâques
        numeroSemaine = 'Ascension du Seigneur';
      }
      else if(date.getTime()==datePentecote.getTime()) { // Pentecôte
        numeroSemaine = 'Pentecôte';
      }
      else {
        var nb = nbJours(datePaques, date);
        numeroSemaine = Math.floor(nb / 7) + 1;
      }
    }
    // du lundi de pentecôte à la veille du 1er dimanche de l'avent => temps ordinaire
    else {
      tempsLiturgique = "Ordinaire";

      if(date.getTime()==new Date(datePentecote.getFullYear(),datePentecote.getMonth(),datePentecote.getDate()+7).getTime()) { // 7 jours après la Pentecôte
        numeroSemaine = 'Sainte Trinité';
      }
      else if(date.getTime()==new Date(datePentecote.getFullYear(),datePentecote.getMonth(),datePentecote.getDate()+14).getTime()) { // 14 jours après la Pentecôte
        numeroSemaine = 'Saint Sacrement';
      }
      else if(date.getTime()==new Date(datePentecote.getFullYear(),datePentecote.getMonth(),datePentecote.getDate()+19).getTime()) { // 19 jours après la Pentecôte
        numeroSemaine = 'Sacré-Cœur de Jésus';
      }
      else {
        var dateFuturAvent = calculer1erDimancheAvent(dateAvent.getFullYear()+1);
        var nb = nbJours(dateFuturAvent, date);
        numeroSemaine = 36 - Math.ceil(nb / 7 + 1);
      }
    }

    return {
        numeroSemaine: numeroSemaine,
        tempsLiturgique: tempsLiturgique,
        anneeLiturgique: anneeLiturgique
    };
}

function idifyPsaume(annee, temps, id) {
    id = (id+'').replaceAll(' ','');
    return `${id}(${annee})${temps}`
}

function renderDateLiturgique(tempsLiturgique) {
    var a = tempsLiturgique.anneeLiturgique;
    var t = tempsLiturgique.tempsLiturgique;
    var s = tempsLiturgique.numeroSemaine;
    if(s=='1') s += 'ère semaine';
    else if(/\d+/.test(s)) s += 'e semaine';
    if(t=='Carême') t = 'du '+t;
    if(t=='Noël') t = 'de '+t;
    if(t=='Avent') t = 'de l\''+t;
    return s+" du temps "+t+" année "+a;
}

function renderPsaumes(psaumes, caption) {
    console.log(psaumes);
    var s = '<table cellpadding="0" cellspacing="0">';
    s+= '<caption>'+caption+'</caption>';
    s+= '<thead><tr>';
    s+= '<th>Année</th>'; 
    s+= '<th>Nom</th>';
    s+= '<th>Titre</th>';    
    s+= '<th>Partition</th>';
    s+= '<th>Musique</th></thead>';
    s+= '<tbody>';
    psaumes.forEach(psaume=>{
      s+= '<tr>';
      s+= `<td>${psaume.annee}</td>`;
      s+= `<td>${psaume.nom}</td>`;
      s+= `<td>${psaume.titre}</td>`;
      s+= `<td><a href="${psaume.pdf}" target="_blank">PDF</a></td>`;
      s+= '<td>';
      psaume.mp3.forEach(m=>{
        s+= `<a href="${m.file}" target="_blank">${m.nom}</a><br/>`;
      })
      s+= '</td>';
      s+= '</tr>';
    })
    s+= '</tbody>';
    s+= '</table>';
    return s
}

var psaumeIndex, psaumeData;
function initPsaumes() {
  fetch("/index/psaumes.json").then(r => r.json()).then(function(data) {    
    psaumeData = data;
    psaumeIndex = lunr(function() {
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
      this.metadataWhitelist = ['position', 'type', 'temps', 'annee']
      idx = this;
      psaumeData.forEach(function(page, index, array) {
        page.ref = idifyPsaume(page.annee,page.temps,page.id)
        idx.add(page);
      });
    });
  })

  document.querySelector('#psaumes input[name="date"]').addEventListener('change', e =>{
    var date = new Date(e.target.value);
    var t = determinerTempsLiturgique(date);
    var psaume = searchPsaume('', t.anneeLiturgique, t.tempsLiturgique, t.numeroSemaine)[0];
    var html = renderPsaumes([psaume], date.toLocaleDateString("fr-FR",{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' : ' + renderDateLiturgique(t));
    document.getElementById('psaumesResults').innerHTML = html;
  })
  document.querySelector('#psaumes input[name="texte"]').addEventListener('input', e =>{
    var psaumes = searchPsaume(e.target.value);
    var html = renderPsaumes(psaumes, `<em>${psaumes.length}</em> résultats pour <em>${e.target.value}</em>`);
    document.getElementById('psaumesResults').innerHTML = html;
  })
}
  
function searchPsaume(texte, annee, temps, id) {
  var q = '';
  if(id&&temps&&annee) {
    q = `+ref:${idifyPsaume(annee, temps, id)}`
  }
  else {
    if(id) q += `+id:${id} `;
    if(temps) q += `+temps:${temps} `;
    if(annee) q += `+annee:${annee} `;
    if(texte) q += `+${texte}`;
  }
  console.log(q);
  return psaumeIndex.search(q).map(i=>psaumeData.find(d => i.ref==idifyPsaume(d.annee, d.temps, d.id)))
}

// ↑ PSAUMES
// ------------------------------------------------------------------------------------------------------------------------------
// ↓ AUTRE CHANTS

function getLabelForTag(tag) {
  try {
    return document.querySelector('#autres select option[value="'+tag.trim()+'"]').innerText
  }
  catch(e) {
    console.error(`Cannot find ${tag}`)
    return '';
  }
}

function renderAutresChants(chants, caption) {
  console.log(chants);
  var s = '<table cellpadding="0" cellspacing="0">';
  s+= '<caption>'+caption+'</caption>';
  s+= '<thead><tr>';
  s+= '<th>Titre</th>';    
  s+= '<th>Partition</th>';
  s+= '<th>Catégories</th></thead>';
  s+= '<tbody>';
  chants.forEach(chant=>{
    s+= '<tr>';
    s+= `<td>${chant.titre}</td>`;
    s+= `<td><a href="${chant.pdf}" target="_blank">PDF</a></td>`;
    s+= '<td>';
    labels = '';
    chant.tag.forEach(m=>{
      labels+= `${getLabelForTag(m)} - `;
    })
    s += labels.replaceAll('^(.*) - $', '$1');
    s+= '</td>';
    s+= '</tr>';
  })
  s+= '</tbody>';
  s+= '</table>';
  return s
}

var autresChantsIndex, autresChantsData;
function initAutresChants() {
  fetch("/index/chants.json").then(r => r.json()).then(function(data) {    
    autresChantsData = data;
    autresChantsIndex = lunr(function() {
      this.ref("ref");
      this.field("ref", {boost: 1});
      this.field("id", {boost: 10});
      this.field("tag", {boost: 10});
      this.field("titre", {boost: 10});
      this.field("text", {boost: 1});
      this.field("pdf", {boost: 1});
      idx = this;
      autresChantsData.forEach(function(page, index, array) {
        page.ref = page.id
        idx.add(page);
      });
    });
  })
  document.querySelector('#autres input[name="texte"]').addEventListener('input', e =>{
    var chants = searchAutresChants(e.target.value);
    var html = renderAutresChants(chants, `<em>${chants.length}</em> résultats pour <em>${e.target.value}</em>`);
    document.getElementById('chantsResults').innerHTML = html;
  })
  Array.from(document.querySelectorAll('#autres select')).forEach(s=>{
    s.addEventListener('change', e =>{
      var temps = document.querySelector('#autres select[name="temps"]').value;
      var etape = document.querySelector('#autres select[name="etape"]').value;
      var tags = temps=="_"?[etape]:etape=="_"?[temps]:[temps,etape];
      var labels = temps=="_"?getLabelForTag(etape):etape=="_"?getLabelForTag(temps):getLabelForTag(temps)+ " - "+getLabelForTag(etape);
      console.log(temps, etape)
      var chants = searchAutresChants('', tags);
      var html = renderAutresChants(chants, `<em>${chants.length}</em> résultats pour <em>${labels}</em>`);
      document.getElementById('chantsResults').innerHTML = html;
    })
  })
}

function searchAutresChants(texte, tag) {
    var q = '';
    if(tag) {
      tag.forEach(t=>{
        q += `+tag:${t} `;
      })
    }
    if(texte) q += `+${texte}`;
    console.log(q);
    return autresChantsIndex.search(q).map(i=>autresChantsData.find(d => i.ref==d.id))
}

// ↑ AUTRE CHANTS
// ------------------------------------------------------------------------------------------------------------------------------
// ↓ INIT


function initChants() {
  initPsaumes();
  initAutresChants();
  Array.from(document.querySelectorAll('form')).forEach(f=>{
    f.classList.add('hide');
  })
  Array.from(document.querySelectorAll('form.active')).forEach(f=>{
    f.classList.remove('hide');
  })
  Array.from(document.querySelectorAll('form.active')).forEach(f=>{
    f.classList.remove('hide');
  })
  Array.from(document.querySelectorAll('.tabs>li')).forEach(li=>{
    li.addEventListener('click', function(){
      Array.from(li.parentElement.parentElement.querySelectorAll('form')).forEach(f=>{
        f.classList.add('hide');
      });
      Array.from(li.parentElement.querySelectorAll('li')).forEach(li=>{
        li.classList.remove('active');
      })
      f = document.getElementById(li.attributes['data-tab'].value);
      f.classList.remove('hide');
      li.classList.add('active');
      
    })
  })
}
