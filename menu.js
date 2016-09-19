(function(app) {
  app.init = function() {
    function cardSpriteOffset() {
      return 53 * Math.floor(53 * Math.random()); // 53 pixels, 52 cards (0..52) inclusive
    }
    function randomCoords() {
      var width = $(window).width(),
          height = $(window).height(),
          radius = Math.sqrt(Math.pow(width/2+200, 2) + Math.pow(height, 2)),
          radians = Math.PI * Math.random(),
          dirx = Math.cos(radians) * radius + width/2,
          diry = Math.sin(radians) * radius;

      // console.log('radius, coords: '+radius+', '+dirx+'&'+diry);
      return {x: dirx, y: diry};
    }
    var cnt=0;
    $('#navmenu li .menu-item').each( function(key,elm) {
      var $elem = $(this),
          cardBg = $elem.children('.card-bg'),
          textBg = $elem.children('.text-bg'),
          hovSound = new Audio('/sfx/cardSlide5.wav'),
          clickSound = new Audio('/sfx/cardShove1.wav');

      cardBg.click(function(e) {
        $(this).css('position', 'absolute');
        var link = $(this).children('a')[0],
            coords = randomCoords();
        clickSound.play();
        $(this).animate(
          {
            'left': '' + coords.x + 'px',
            'top': '' + coords.y + 'px'
          },
          {
            duration: 600,
            complete: function(e){
              document.location = link.href;
            },
          });
      });
      cnt++;

      $(this).hover(
        function() {
          var cardx = cardSpriteOffset();
          var bgposx = "-" + (cardx) + "px";
          randomCoords();
          cardBg.css({'background-position-x': bgposx});
          cardBg.animate({'top': '0px'}, 200, 'swing', function(){hovSound.play();});
          textBg.animate({'top': '0px'}, 200);
        },
        function() {
          cardBg.animate({'top': '-70px'}, 400);
          textBg.animate({'top': '-70px'}, 400);
        }
      );
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    app.init();
  });
})(window.app || (window.app = {}));
