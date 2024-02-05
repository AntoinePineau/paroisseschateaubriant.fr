
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

function initPsaumes() {
  document.querySelector('#psaumes input[name="date"]').addEventListener('change', e =>{
    var date = new Date(e.target.value);
    fetch(`/.netlify/functions/temps-liturgique/?date=${date.getDate()<=9?0:''}${date.getDate()}/${date.getMonth()<9?0:''}${date.getMonth() + 1}/${date.getFullYear()}`, { mode: 'no-cors' })
    .then(r => r.json())
    .then(result => {
      var t = result.tempsLiturgique;
      fetch(`/.netlify/functions/psaume/?annee=${t.anneeLiturgique}&temps=${t.tempsLiturgique}&semaine=${t.numeroSemaine}`, { mode: 'no-cors' })
      .then(r => r.json())
      .then(psaumes => {    
        var psaume = psaumes[0];
        var html = renderPsaumes([psaume], date.toLocaleDateString("fr-FR",{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' : ' + t.asString);
        document.getElementById('psaumesResults').innerHTML = html;
      })
    });
  })
  document.querySelector('#psaumes input[name="texte"]').addEventListener('input', e =>{
    var texte = e.target.value;
    fetch(`/.netlify/functions/psaume/?texte=${texte}`, { mode: 'no-cors' })
    .then(r => r.json())
    .then(psaumes => {    
      var html = renderPsaumes(psaumes, `<em>${psaumes.length}</em> résultats pour <em>${texte}</em>`);
      document.getElementById('psaumesResults').innerHTML = html;
    })
  })
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
  document.querySelector('#autres input[name="texte"]').addEventListener('input', e =>{
    fetch(`/.netlify/functions/chants/?texte=${e.target.value}`, { mode: 'no-cors' })
    .then(r => r.json())
    .then(chants => {      
      var html = renderAutresChants(chants, `<em>${chants.length}</em> résultats pour <em>${e.target.value}</em>`);
      document.getElementById('chantsResults').innerHTML = html;
    })
  })
  Array.from(document.querySelectorAll('#autres select')).forEach(s=>{
    s.addEventListener('change', e =>{
      var temps = document.querySelector('#autres select[name="temps"]').value;
      var etape = document.querySelector('#autres select[name="etape"]').value;
      var tags = temps=="_"?[etape]:etape=="_"?[temps]:[temps,etape];
      var labels = temps=="_"?getLabelForTag(etape):etape=="_"?getLabelForTag(temps):getLabelForTag(temps)+ " - "+getLabelForTag(etape);
      console.log(temps, etape)      
      fetch(`/.netlify/functions/chants/?tag=${tags}`, { mode: 'no-cors' })
      .then(r => r.json())
      .then(chants => {
        var html = renderAutresChants(chants, `<em>${chants.length}</em> résultats pour <em>${labels}</em>`);
        document.getElementById('chantsResults').innerHTML = html;
      })
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
// ↓ INIT CHANTS


function initChants() {
  initPsaumes();
  initAutresChants();
  Array.from(document.querySelectorAll('form')).forEach(f=>{
    f.classList.add('hide');
  });
  Array.from(document.querySelectorAll('form.active')).forEach(f=>{
    f.classList.remove('hide');
  });
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

// ↑ INIT CHANTS
// ------------------------------------------------------------------------------------------------------------------------------
// ↓ INIT BIBLE



function idifyLecture(annee, temps, semaine, jour) {
  return `${jour},${semaine}(${annee})${temps}`
}

function renderLectures(lectures, caption) {
  console.log(lectures);
  var s = '<table cellpadding="0" cellspacing="0">';
  s+= '<caption>'+caption+'</caption>';
  s+= '<thead><tr>';
  s+= '<th>Lecture de la messe</th>'; 
  s+= '<th>Titre</th>';
  s+= '<th>Identifiant</th>';    
  s+= '<tbody>';
  lectures.forEach(l=>{
    s+= '<tr>';
    s+= `<td>${l.type}</td>`;
    s+= `<td>${l.titre}</td>`;
    s+= `<td>${l.id}</td>`;
    s+= '</tr>';
  })
  s+= '</tbody>';
  s+= '</table>';
  return s
}

var bibleIndex, bibleData, lecturesIndex, lecturesData;
function initBibleIndex() {
  fetch("/index/bible/livres.json").then(r => r.json()).then(function(data) {    
    bibleData = data;
    bibleIndex = lunr(function() {
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
      idx = this;
      bibleData.forEach(function(page, index, array) {
        page.ref = idifyLecture(page.annee,page.temps,page.semaine,page.jour)
        idx.add(page);
      });
    });
  })
  fetch("/index/lectures.json").then(r => r.json()).then(function(data) {    
    lecturesData = data;
    lecturesIndex = lunr(function() {
      this.ref("ref");
      this.field("ref", {boost: 1});
      this.field("id", {boost: 10});
      this.field("annee", {boost: 10});
      this.field("temps", {boost: 5});
      this.field("semaine", {boost: 1});
      this.field("jour", {boost: 2});
      this.field("date", {boost: 8});
      this.field("originalDate", {boost: 10});
      this.field("lectures", {boost: 1});
      idx = this;
      lecturesData.forEach(function(page, index, array) {
        page.ref = idifyLecture(page.annee,page.temps,page.semaine,page.jour)
        idx.add(page);
      });
    });
  })

  document.querySelector('#filters input[name="date"]').addEventListener('change', e =>{
    var date = new Date(e.target.value);
    var t = determinerTempsLiturgique(date);
    var result = searchLecturesByTempsLiturgique(t)[0];
    console.log('result', result);
    var html = renderLectures(result.lectures, date.toLocaleDateString("fr-FR",{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' : ' + renderDateLiturgique(t));
    document.getElementById('results').innerHTML = html;
  });
  
  document.querySelector('#filters input[name="id"]').addEventListener('input', e =>{
    var result = searchLecturesById(e.target.value);
    console.log('result', result);
    var html = renderLectures(result.lectures, `Lectures pour <em>${e.target.value}</em>`);
    document.getElementById('results').innerHTML = html;
  });
  
  document.querySelector('#filters select[name="type"]').addEventListener('input', e =>{
    var result = searchLecturesByText(e.target.value);
    console.log('result', result);
    var html = renderLectures(result.lectures, `Lectures pour <em>${e.target.value}</em>`);
    document.getElementById('results').innerHTML = html;
  });
}

function searchLecturesByTempsLiturgique(t) {  
  var q = `+ref:${idifyLecture(t.anneeLiturgique, t.tempsLiturgique, t.numeroSemaine, t.jourSemaine)}`;
  return searchLectures(q);
}

function searchLecturesById(id) {  
  var q = `+id=${id}`;
  return searchLectures(q);
}

function searchLectures(q) {
  console.log(q);
  return lecturesIndex.search(q).map(i=>lecturesData.find(d => i.ref==idifyLecture(d.annee, d.temps, d.semaine, d.jour)))
}

function initBible() {
  initBibleIndex();
  Array.from(document.querySelectorAll('form')).forEach(f=>{
    f.classList.add('hide');
  });
  Array.from(document.querySelectorAll('form.active')).forEach(f=>{
    f.classList.remove('hide');
  });
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