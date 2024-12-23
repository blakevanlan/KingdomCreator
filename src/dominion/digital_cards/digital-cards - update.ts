import type { DigitalCard } from "./digital-cards-type"


export let Work_Card:DigitalCard = {  id: "souk", frenchName: "",  artwork:"",
    
text_html: '<div class="card-text" style="top:20px;">\
<div style="position:relative; top:-10px;"><div style="line-height:20px;">\
<div style="display:inline;"><div style="display:inline; font-weight: bold; font-size:24px;">+1 Achat</div></div><br>\
<div style="display:inline;"><div style="display:inline; font-weight: bold; font-size:24px;">+    </div></div><br>\
</div>\
<div style="line-height:18px;"><div style="display:inline;">\
<div style="display:inline; font-size:18px;">-       par carte en main. (Vous ne</div></div><br>\
<div style="display:inline;"><div style="display:inline; font-size:18px;">pouvez pas aller en-dessous de     .)</div></div><br>\
</div></div>\
<div class="horizontal-line" style="width:200px;height: 2px;margin-top:0px;"></div>\
<div style="position:relative; top:5px;"><div style="line-height: 16px;">\
<div style="display:inline;"><div style="display:inline; font-size:18px;">Quand vous recevez cette carte, écartez</div></div><br>\
<div style="display:inline;"><div style="display:inline; font-size:18px;">jusqu\'à 2 cartes de votre main.</div></div><br>\
</div></div>\
<div class="card-text-coin-icon" style="transform: scale(0.18);top: 30px;display: inline;left: 140px;">\
<div class="card-text-coin-text-container" style="display:inline;">\
<div class="card-text-coin-text" style="color: black; display:inline; top:8px;">7</div>\
</div></div>\
<div class="card-text-coin-icon" style="transform: scale(0.13);top: 55px;display: inline;left: 20px;">\
<div class="card-text-coin-text-container" style="display:inline;">\
<div class="card-text-coin-text" style="color: black; display:inline; top:8px;">1</div>\
</div></div>\
<div class="card-text-coin-icon" style="transform: scale(0.13);top: 72px;display: inline;left: 203px;">\
<div class="card-text-coin-text-container" style="display:inline;">\
<div class="card-text-coin-text" style="color: black; display:inline; top:8px;">0</div>\
</div></div>\
</div>'




/*
'<div class="card-text" style="top:30px;">\
<div style="position:relative; top:10px;"><div style="font-weight: bold;">\
<div style="line-height:20px;"><div style="display:inline;"><div style="display:inline; font-size:28px;">+1 Achat</div></div><br>\
</div></div></div>\
<div style="position:relative; top:20px;"><div style="line-height:20px;">\
<div style="display:inline;"><div style="display:inline; font-size:20px;">Vous pouvez défausser un</div></div><br>\
<div style="display:inline;"><div style="display:inline; font-size:20px;">Domaine pour +      . Si vous ne</div></div><br>\
<div style="display:inline;"><div style="display:inline; font-size:20px;">le faites pas, recevez un Domaine.</div></div><br>\
</div></div>\
<div class="card-text-coin-icon" style="transform:scale(0.19); top:65px; display: inline;left:148px;">\
<div class="card-text-coin-text-container" style="display:inline;">\
<div class="card-text-coin-text" style="color: black; display:inline; top:8px;">4</div></div></div>\
</div>'*/

};
/*


Recevez une carte coûtant jusqu'à [4],//
en la mettant de côté. Au début de votre//
prochain tour, prenez-là en main//<div class="card-text" style="top:20px;"><div style="position:relative; top:15px;"><div style="line-height:14px;"><div style="display:inline;"><div style="display:inline; font-size:28px;"><div style="display: inline; font-weight: bold;">+1 Action</div></div></div><br></div></div><div style="position:relative; top:25px;"><div style="line-height:14px;"><div style="display:inline;"><div style="display:inline; font-size:16px;">Une fois durant ce tour, quand vous</div></div><br><div style="display:inline;"><div style="display:inline; font-size:16px;">recevez une carte Durée, vous pouvez</div></div><br><div style="display:inline;"><div style="display:inline; font-size:16px;"> la jouer. Au début de votre prochain tour,</div></div><br><div style="display:inline;"><div style="display:inline; font-size:16px;">+     et vous pouvez écarter.</div></div><br><div style="display:inline;"><div style="display:inline; font-size:16px;">une carte de votre main.</div></div><br></div></div><div class="card-text-coin-icon" style="transform:scale(0.13); top:98px; display: inline;left:65px;"><div class="card-text-coin-text-container" style="display:inline;"><div class="card-text-coin-text" style="color: black; display:inline; top:8px;">2</div></div></div></div>
Tant qu'elle est mise de côté,//
quand un autre joueur en reçoit//
un exemplaire durant leur tour,//
il reçoit une Malédiction.
*/
/*
1 ligne
<div style="display:inline;"><div style="display:inline; font-size:18px;">......</div></div><br>\

---
<div class="horizontal-line" style="width:200px; height:3px; margin-top:25px;"></div>\

|+3 Cartes|
<div style="display:inline;"><div style="display:inline; font-size:22px; font-weight:bold;">+3 Cartes</div></div><br>\



<div style="display:inline;"><div style="display:inline; font-size:18px;">Maintenant et au d\xE9but de</div></div><br>\
<div style="display:inline;"><div style="display:inline; font-size:18px;">votre prochain tour :</div></div><br>\
<div style="display:inline;"><div style="display:inline; font-size:18px;">jouez une carte Action</div></div><br>\
<div style="display:inline;"><div style="display:inline; font-size:18px;">non-Dur\xE9e, non-Ordre depuis</div></div><br>\
<div style="display:inline;"><div style="display:inline; font-size:18px;">la r\xE9serve co\xFBtant jusqu'\xE0 [4],</div></div><br>\
<div style="display:inline;"><div style="display:inline; font-size:18px;">en la laissant dans la r\xE9serve.

<div class="card-text" style="top:47px;">\
<div style="position:relative; top:10px;"><div style="line-height:20px;">\
<div style="display:inline;"><div style="display:inline; font-size:20px;">Vaut         pour chaque 10 cartes</div></div><br>\
<div style="display:inline;"><div style="display:inline; font-size:20px;">que vous avez</div></div><br>\
<div style="display:inline;"><div style="display:inline; font-size:20px;">(arrondi à l\'unité inférieure).</div></div><br>\
</div></div>\
<div class="card-text-vp-icon-container" style="display:inline; transform:scale(0.2); top:10px;left:68px;">\
<div class="card-text-vp-text-container"><div class="card-text-vp-text" style="top:8px;">1</div></div>\
<div class="card-text-vp-icon"></div></div></div>\

<div class="card-text" style="top:29px;">\
<div style="position:relative; top:8px;"><div style="line-height:21px;">\
<div style="display:inline;"><div style="display:inline; font-size:21px;">Vous pouvez écarter une carte</div></div><br>\
<div style="display:inline;"><div style="display:inline; font-size:21px;">Trésor de votre main pour choisir</div></div><br>\
<div style="display:inline;"><div style="display:inline; font-size:21px;">
    <div style="display: inline; font-weight: bold;">+2 Cartes</div> et <div style="display: inline; font-weight: bold;">+1 Action</div>;</div></div><br>\
<div style="display:inline;"><div style="display:inline; font-size:21px;">ou<div style="display: inline; font-weight: bold;"> +</div>      et<div style="display: inline; font-weight: bold;"> +1 Achat</div>.</div></div><br>\
</div></div>\
<div class="card-text-coin-icon" style="transform:scale(0.2); top:82px; display: inline;left:93px;">\
<div class="card-text-coin-text-container" style="display:inline;">\
<div class="card-text-coin-text" style="color: black; display:inline; top:8px;">2</div></div></div>\
</div>'



*/