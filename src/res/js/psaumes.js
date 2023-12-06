
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
      if(date==new Date(date.getFullYear(),11,25)) { // 25 décembre
        numeroSemaine = 'Nativité du Seigneur';
      }
      else if(date==new Date(date.getFullYear(),11,31)) { // 31 décembre
        numeroSemaine = 'La Sainte Famille';
      }
      else if(date==new Date(date.getFullYear(),0,1)) { // 1er janvier
        numeroSemaine = 'Sainte Marie, Mère de Dieu';
      }
      else if(date>=dimancheQuiSuitLEpiphanie && date<=dimancheQuiSuitLEpiphanie) { // Epiphanie
        numeroSemaine = 'L\'Epiphanie du Seigneur';
      }
      else if(date==new Date(dimancheQuiSuitLEpiphanie.getFullYear(),dimancheQuiSuitLEpiphanie.getMonth(),dimancheQuiSuitLEpiphanie.getDate()+1)) { // le lundi qui suit l'Epihpanie
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
      if(date==new Date(datePaques.getFullYear(),datePaques.getMonth(),datePaques.getDate()-1)) { // Samedi saint
        numeroSemaine = 'Veillée pascale';
      }
      else if(date==new Date(datePaques.getFullYear(),datePaques.getMonth(),datePaques.getDate()-2)) { // Vendredi saint
        numeroSemaine = 'Vendredi saint';
      }
      else if(date==new Date(datePaques.getFullYear(),datePaques.getMonth(),datePaques.getDate()-3)) { // Jeudi saint
        numeroSemaine = 'Jeudi saint';
      }
      else if(date==new Date(datePaques.getFullYear(),datePaques.getMonth(),datePaques.getDate()-7)) { // le dimanche qui précède Pâques
        numeroSemaine = 'Dimanche des Rameaux et de la Passion';
      }
      else if(date==dateMercrediCendres) { // Mercredi des Cendres
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
      if(date == datePaques) { // Pâques
        numeroSemaine = 'Dimanche de la Résurrection';
      }
      else if(date==new Date(datePaques.getFullYear(),datePaques.getMonth(),datePaques.getDate()+39)) { // 39 jours après Pâques
        numeroSemaine = 'Ascension du Seigneur';
      }
      else if(date==datePentecote) { // Pentecôte
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

      if(date==new Date(datePentecote.getFullYear(),datePentecote.getMonth(),datePentecote.getDate()+7)) { // 7 jours après la Pentecôte
        numeroSemaine = 'Sainte Trinité';
      }
      else if(date==new Date(datePentecote.getFullYear(),datePentecote.getMonth(),datePentecote.getDate()+14)) { // 14 jours après la Pentecôte
        numeroSemaine = 'Saint Sacrement';
      }
      else if(date==new Date(datePentecote.getFullYear(),datePentecote.getMonth(),datePentecote.getDate()+19)) { // 19 jours après la Pentecôte
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
    return `${id}(${annee})${temps}`
}

function renderDateliturgique(tempsLiturgique) {
    var a = tempsLiturgique.anneeLiturgique;
    var t = tempsLiturgique.tempsLiturgique;
    var s = tempsLiturgique.numeroSemaine;
    return s+"e semaine du temps "+t+" année "+a;
}

function renderPsaume(psaume) {
    return psaume.nom+' - '+psaume.titre+' <a href="'+psaume.pdf+'" target="_blank">PDF</a><a href="'+psaume.mp3+'" target="_blank">MP3</a>'
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

  document.querySelector('input[name="date"]').addEventListener('change', (e)=>{
    var date = new Date(e.target.value);
    var t = determinerTempsLiturgique(date);
    var psaume = searchPsaume('', t.anneeLiturgique, t.tempsLiturgique, t.numeroSemaine)[0];
    var html = date.toLocaleDateString("fr-FR",{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    html += ' - '+renderDateliturgique(t);
    html += ' : '+renderPsaume(psaume);
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