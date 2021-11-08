(async function(window, document) {
'use strict';

var $lbr = document.getElementById('lbr');
var $usd = document.getElementById('usd');
var $brl = document.getElementById('brl');
var $ptax = document.getElementById('ptax');
var $iof = document.getElementById('iof');
var $spread = document.getElementById('spread');

var defaultUsd = 1.3563;
var defaultPtax = 5.5455;
var defaultIof = 6.38;
var defaultSpread = 0;

function onReceiveData(response, response2) {
    $iof.value = numToStr(defaultIof);
    $spread.value = numToStr(defaultSpread);
	$ptax.value = numToStr(defaultPtax);
	$usd.value = numToStr(defaultUsd);
    $brl.value = '0,00';
	
	try {
        $ptax.value = numToStr(response.conteudo[0].valorVenda);
		$usd.value = numToStr(response2.GBPUSD.high);
    } catch(e) {
        return;
    }

    calcula();
	
    $lbr.focus();    
};

function strToNum(str) {
    return +str.replace(',', '.');
}

function numToStr(num) {
    return ('' + num).replace('.', ',');
}

function queryStringParse(q) {
    var vars = q.split('&'),
        result = {},
        part,
        key, value;

    for (var i = 0, len = vars.length; i < len; i++) {
        part = vars[i].split('=');

        key = (part[0] && decodeURIComponent(part[0])) || '';
        value = (part[1] && decodeURIComponent(part[1])) || '';

        if (key) {
            result[key] = value;
        }
    }

    return result;
}

function getIof() {
    return strToNum($iof.value) / 100;
}

function getSpread() {
    return strToNum($spread.value) / 100;
}

function getDollar() {
    return strToNum($ptax.value) * (1 + getSpread());
}

function calcula() {
	// Valor da compra em libras
    var lbr = strToNum($lbr.value);
	
    // Converte a libra em dólar
    var usd = strToNum($usd.value) * lbr;

    // Multiplica pelo valor do dólar ptax com spread
    var value = usd * getDollar();

    // Adiciona o IOF
    value += getIof() * value;

    // Arredondar valor
    value = round(value);

    if (isNaN(value)) {
        return;
    }

    $brl.value = numToStr(value);

    location.replace('#dolar=' + $usd.value);
}

function round(value) {
    // Arredondar valor final (https://stackoverflow.com/a/18358056)
    value = +(Math.round(value + "e+2")  + "e-2");

    // Garantir que vai usar duas casas decimais
    value = value.toFixed(2);

    return value;
}

function zero(n) {
    return n < 10 ? '0' + n : n;
}

function include(url, callback) {
    var elem = document.createElement('script');
    elem.type = 'text/javascript';
    elem.async = 'async';
    elem.src = url;

    if (elem.readyState) {
        elem.onreadystatechange = function () {
            if (elem.readyState === 'loaded' ||
                elem.readyState === 'complete') {
                elem.onreadystatechange = null;
                callback && callback();
            }
        };
    }
    else {
        elem.onload = function() {
            elem.onload = null;
            callback && callback();
        };
    }

    document.body.appendChild(elem);
}

function onInput(obj, callback) {
    obj.addEventListener('input', function() {
        callback();
    });
}

function onClick(obj, callback) {
    obj.addEventListener('click', function(e) {
        callback(e);
    });
}

onInput($usd, calcula);
onInput($lbr, calcula);
onInput($iof, calcula);
onInput($spread, calcula);
onInput($ptax, calcula);

// Se a tela for pequena, já adiciona uma barra de rolagem
if (window.innerHeight < 627) {
    document.body.style.overflowY = 'scroll';
}

var d = new Date();
var nocache = '' + d.getFullYear() +
    zero(d.getMonth() + 1) +
    zero(d.getDate()) +
    zero(d.getHours());

let resp = await fetch('https://www.bcb.gov.br/api/conteudo/pt-br/PAINEL_INDICADORES/cambio?'+ nocache)
    .then(response => response.json())
    .catch(err => console.log(err));
	
let resplibra = await fetch('https://economia.awesomeapi.com.br/last/GBP-USD')
    .then(response => response.json())
    .catch(err => console.log(err));

onReceiveData(resp, resplibra);
})(window, document);