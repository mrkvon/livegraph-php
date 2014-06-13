(function(){
  document.getElementById('captcha_reload').addEventListener('click',
    function(e){
      e.preventDefault();
      e.stopPropagation();
      document.getElementById("captcha").src = "/libs/php/securimage/securimage_show.php?" + Math.random();
      return false;
    },false
  );
})();