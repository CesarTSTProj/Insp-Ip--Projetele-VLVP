/*
=================================================
INSP - CONFIGURAÇÃO DOS CHECKLISTS
=================================================

Este arquivo define:

- Tipo de veículo recebido pelo QR Code
- Checklist de veículos leves
- Checklist de veículos pesados
- Matriz de criticidade
- Versão de cada checklist
=================================================
*/


/*
=================================================
TIPO DE VEÍCULO
=================================================
*/

var parametrosURL =
  new URLSearchParams(
    window.location.search
  );


var tipoVeiculo =
  parametrosURL.get('tipo') === 'pesado'
    ? 'pesado'
    : 'leve';


/*
=================================================
CHECKLISTS
=================================================
*/

var checklists = {


  /*
  ===============================================
  VEÍCULOS LEVES
  ===============================================
  */

  leve: {

    titulo:
      'INSPEÇÃO DE VEÍCULOS LEVES',

    versao:
      'VL-2026-01',

    itens: [

      [
        'documento',
        'Documento do veículo presente?'
      ],

      [
        'iluminacao',
        'Sistema de iluminação funcionando? (faróis alto e baixo / setas / luz de freio / luz de ré)'
      ],

      [
        'sirene',
        'Sirene de ré funcionando?'
      ],

      [
        'giroflex',
        'Giroflex funcionando?'
      ],

      [
        'antena',
        'Antena de sinalização e bandeirola presente?'
      ],

      [
        'ar',
        'Ar condicionado funcionando?'
      ],

      [
        'limpadores',
        'Limpadores de para-brisa e sistema de esguicho funcionando?'
      ],

      [
        'cinto',
        'Cinto de segurança em boas condições?'
      ],

      [
        'emergencia',
        'Equipamento de emergência presente? (chave de roda, macaco, pneu estepe, triângulo)'
      ],

      [
        'pneus',
        'Pneu em boas condições e dentro do limite do TWI?'
      ],

      [
        'freios',
        'Freio de estacionamento e de serviço funcionando?'
      ],

      [
        'hidraulico',
        'Sistema hidráulico está em boas condições?'
      ],

      [
        'radiador',
        'Água do reservatório do radiador no nível?'
      ],

      [
        'cincoS',
        '5S do veículo foi feito?'
      ]

    ],


    matriz: {

      documento: true,
      iluminacao: true,

      sirene: false,
      giroflex: false,
      antena: false,
      ar: false,
      limpadores: false,

      cinto: true,
      emergencia: true,
      pneus: true,
      freios: true,
      hidraulico: true,
      radiador: true,

      cincoS: false

    }

  },


  /*
  ===============================================
  VEÍCULOS PESADOS
  ===============================================
  */

  pesado: {

    titulo:
      'INSPEÇÃO DE VEÍCULOS PESADOS',

    versao:
      'VP-2026-01',

    itens: [

      [
        'documento',
        'Documento do veículo presente?'
      ],

      [
        'iluminacao',
        'Sistema de iluminação funcionando? (faróis alto e baixo / setas / luz de freio e lanterna / luz de ré)'
      ],

      [
        'sirene',
        'Sirene de ré funcionando?'
      ],

      [
        'giroflex',
        'Giroflex presente?'
      ],

      [
        'ar',
        'Ar condicionado funcionando?'
      ],

      [
        'limpadores',
        'Limpadores de para-brisa e sistema de esguicho funcionando?'
      ],

      [
        'cinto',
        'Cinto de segurança em boas condições?'
      ],

      [
        'emergencia',
        'Equipamento de emergência presente? (cone e triângulo)'
      ],

      [
        'pneus',
        'Pneus e sobressalente em boas condições e dentro do limite do TWI?'
      ],

      [
        'freios',
        'Freios funcionando? (retarder / freio motor / freio de estacionamento / freio de serviço)'
      ],

      [
        'extintor',
        'Extintor de incêndio presente e dentro do prazo de validade?'
      ],

      [
        'oleoMotor',
        'Óleo de motor está com a cor e no nível adequado?'
      ],

      [
        'radiador',
        'Água do reservatório do radiador no nível?'
      ],

      [
        'vazamentoAr',
        'Está isento de vazamento de ar?'
      ],

      [
        'cincoS',
        '5S do veículo foi feito?'
      ],

      [
        'saidasEmergencia',
        'Saídas de emergência desobstruídas?'
      ],

      [
        'marteloEmergencia',
        'Martelo de emergência presente?'
      ]

    ],


    matriz: {

      documento: true,
      iluminacao: true,

      sirene: false,
      giroflex: false,
      ar: false,
      limpadores: false,

      cinto: true,

      emergencia: false,

      pneus: true,
      freios: true,
      extintor: true,
      oleoMotor: true,
      radiador: true,
      vazamentoAr: true,

      cincoS: false,
      saidasEmergencia: false,
      marteloEmergencia: false

    }

  }

};


/*
=================================================
CHECKLIST ATUAL
=================================================
*/

var configuracaoAtual =
  checklists[tipoVeiculo];


var itens =
  configuracaoAtual.itens;


var matriz =
  configuracaoAtual.matriz;


/*
=================================================
TÍTULO DA INTERFACE
=================================================
*/

document.addEventListener(
  'DOMContentLoaded',
  function() {

    var titulo =
      document.getElementById(
        'tituloInspecao'
      );


    if (titulo) {

      titulo.innerText =
        configuracaoAtual.titulo;

    }

  }
);
