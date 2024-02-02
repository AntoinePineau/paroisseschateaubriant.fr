exports.handler = async function (event, context) {
  const { date, debug } = event.queryStringParameters;
  const sep = '[- ,/_]';
  if(!date || !date.match(new RegExp('[0-9]{2}('+sep+')[0-9]{2}\\1[0-9]{4}'))) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        help: 'query string parameter "date" is missing or does not contain a date with format dd/MM/yyyy',
        available_parameters:[
          {date: 'date in dd/MM/yyyy format'},
          {debug: 'debug boolean value to add more information in the calculation. default: 0'}
        ]
      })
    };
  }
  let dateArray = date.split(new RegExp(sep));
  let d = new Date(dateArray[2], dateArray[1]-1, dateArray[0]);
  let year = d.getFullYear();
  let tempsLiturgique = determinerTempsLiturgique(d, debug);

  result = {};
  result['date'] = {
    asString: `${d.toLocaleDateString('fr')}`,
    day: `${d.getDate()}`,
    month: `${d.getMonth()+1}`,
    year: `${year}`
  }
  result['tempsLiturgique'] = tempsLiturgique;
  return {
    statusCode: 200,
    body: JSON.stringify(result)
  };
};

function renderDateLiturgique(jourSemaine, numeroSemaine, tempsLiturgique, anneeLiturgique) {  
  if(numeroSemaine=='1') numeroSemaine += 'ère semaine';
  else if(/\d+/.test(numeroSemaine)) numeroSemaine += 'e semaine';
  if(tempsLiturgique=='Carême') t = 'du '+tempsLiturgique;
  if(tempsLiturgique=='Noël') t = 'de '+tempsLiturgique;
  if(tempsLiturgique=='Avent') t = 'de l\''+tempsLiturgique;
  return frenchDays[(jourSemaine+1)%7]+', '+numeroSemaine+" du temps "+tempsLiturgique+" - Année "+anneeLiturgique;
}

function calculer1erDimancheAvent(annee) {
  var date = new Date(annee, 11, 25);
  date.setDate(date.getDate() - 22);
  while (date.getDay() !== 0) {
      date.setDate(date.getDate() - 1);
  }
  return date;
}

  const frenchDays = [
  "Dimanche", // Sunday
  "Lundi",    // Monday
  "Mardi",    // Tuesday
  "Mercredi", // Wednesday
  "Jeudi",    // Thursday
  "Vendredi", // Friday
  "Samedi",    // Saturday
];

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

function determinerTempsLiturgique(date, debug) {
  let result = {};
  date.setHours(0);
  var annee = date.getFullYear();
  var jour = (date.getDay()+6)%7; // (Monday is 0, Sunday is 6)

  // Calculer les dates clés
  var dateAvent = calculer1erDimancheAvent(annee);
  var dateNoel = new Date(annee, 11, 25);
  var anneeLiturgique=annee;
  if(date>=calculer1erDimancheAvent(annee)) anneeLiturgique++;
  else {
    dateAvent = calculer1erDimancheAvent(annee - 1);
  var dateNoel = new Date(annee - 1, 11, 25);
  }
  if(debug) result['date1erDimancheAvent'] = dateAvent.toLocaleDateString('fr');
  anneeLiturgique = (anneeLiturgique % 3 === 0) ? "C" : ((anneeLiturgique % 3 === 1) ? "A" : "B");

  var dimancheQuiSuitLEpiphanie = new Date(dateNoel.getFullYear(), dateNoel.getMonth(), dateNoel.getDate()+12);
  do {
    dimancheQuiSuitLEpiphanie.setDate(dimancheQuiSuitLEpiphanie.getDate() + 1);
  }
  while (dimancheQuiSuitLEpiphanie.getDay() !== 0);
  if(debug) result['dimancheQuiSuitLEpiphanie'] = dimancheQuiSuitLEpiphanie.toLocaleDateString('fr');

  var baptemeDuSeigneur = new Date(dimancheQuiSuitLEpiphanie.getFullYear(),dimancheQuiSuitLEpiphanie.getMonth(),dimancheQuiSuitLEpiphanie.getDate()+1);
  if(debug) result['baptemeDuSeigneur'] = baptemeDuSeigneur.toLocaleDateString('fr');

  var datePaques = calculerDatePaques(annee);
  var dateMercrediCendres = new Date(datePaques);
  dateMercrediCendres.setDate(datePaques.getDate() - 46);
  if(debug) result['dateMercrediCendres'] = dateMercrediCendres.toLocaleDateString('fr');
  if(debug) result['datePaques'] = datePaques.toLocaleDateString('fr');
  var datePentecote = new Date(datePaques);
  datePentecote.setDate(datePaques.getDate() + 49);
  if(debug) result['datePentecote'] = datePentecote.toLocaleDateString('fr');
  

  // déterminer le temps liturgique
  var tempsLiturgique = '';
  var numeroSemaine = 0;
  // du 1er dimanche de l'avent jusqu'à Noël exclus => temps de l'avent
  if(date>=calculer1erDimancheAvent(annee) && date<dateNoel) {
    tempsLiturgique = "Avent";
    var nb = nbJours(dateAvent, date);
    numeroSemaine = Math.floor(nb / 7) + 1;
  }
  // de Noël jusqu'au baptême du Christ (dimanche qui suit le 6 janvier) => temps de Noël
  else if(date>=dateNoel && date<=baptemeDuSeigneur) {
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
    else if(date.getTime()==baptemeDuSeigneur.getTime()) { // le lundi qui suit l'Epihpanie
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
    var nb = nbJours(dimancheQuiSuitLEpiphanie, date);
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
      var nb = nbJours(dateMercrediCendres, date);
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
  result['asString'] = renderDateLiturgique(jour, numeroSemaine, tempsLiturgique, anneeLiturgique);
  result['jourSemaine'] = jour;
  result['numeroSemaine']  = numeroSemaine;
  result['tempsLiturgique']  = tempsLiturgique;
  result['anneeLiturgique']  = anneeLiturgique;

  return result;
}
