document.addEventListener('DOMContentLoaded',()=>{
  
    if(document.querySelector('main[id=chants]')) {
      initChants();
    }

    if(document.querySelector('main[id=bible]')) {
      initBible();
    }

})