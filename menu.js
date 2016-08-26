<script type="text/javascript">
  cardSuits = new Array('d','c','h','s');
  cardRanks = new Array('2','3','4','5','6','7','8','9','10','J','Q','K','A');

  function cardUrl()
  {
    suit = cardSuits[Math.floor( Math.random() * (cardSuits.length) )];
    rank = cardRanks[Math.floor( Math.random() * (cardRanks.length) )];
    cardImg = "/img/cards/s" + rank + suit + ".gif";
    console.log("chosen card: " + cardImg);
    return cardImg;
  }
   
  $(document).ready(function() {
    MENU.rollover.init();
  });
  MENU = {};
  MENU.rollover =
  {
    init: function() {
      var imgUrls=new Array(5);
      for (i=0; i<5; i++) {
        imgUrls[i] = new Image();
        imgUrls[i].src = cardUrl();
        console.log("imgUrl["+i+"]="+imgUrls[i].src);
      }
      $('#navmenu li a').each( function(key,elm) { 
        $(this).hover( function() {
          $(this).css('background-image: url(' + imgUrls[key].src + ')'); },
        function() {
          $(this).css('background-image: "non"');
        });
      }
    }
  };
</script> 

