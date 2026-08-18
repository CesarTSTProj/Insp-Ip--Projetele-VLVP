const itens = [

  ['documento',
   'Documento do veículo presente?'],

  ['iluminacao',
   'Sistema de iluminação funcionando? (faróis alto e baixo / setas / luz de freio / luz de ré)'],

  ['sirene',
   'Sirene de ré funcionando?'],

  ['giroflex',
   'Giroflex funcionando?'],

  ['antena',
   'Antena de sinalização e bandeirola presente?'],

  ['ar',
   'Ar condicionado funcionando?'],

  ['limpadores',
   'Limpadores de para-brisa e sistema de esguicho funcionando?'],

  ['cinto',
   'Cinto de segurança em boas condições?'],

  ['emergencia',
   'Equipamento de emergência presente? (chave de roda, macaco, pneu estepe, triângulo)'],

  ['pneus',
   'Pneu em boas condições e dentro do limite do TWI?'],

  ['freios',
   'Freio de estacionamento e de serviço funcionando?'],

  ['hidraulico',
   'Sistema hidráulico está em boas condições?'],

  ['radiador',
   'Água do reservatório do radiador no nível?'],

  ['cincoS',
   '5S do veículo foi feito?']

];


const matriz = {

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

};


const checklist =
  document.getElementById(
    'checklist'
  );


itens.forEach(function(item) {

  const div =
    document.createElement('div');

  div.className = 'item';

  div.innerHTML = `

    <label>
      ${item[1]}
    </label>

    <div class="simnao">

      <label>

        <input
          type="radio"
          name="${item[0]}"
          value="SIM">

        SIM

      </label>

      <label>

        <input
          type="radio"
          name="${item[0]}"
          value="NÃO">

        NÃO

      </label>

    </div>

  `;

  checklist.appendChild(div);

});


document.getElementById(
  'data'
).value =
  new Date()
    .toISOString()
    .split('T')[0];


function atualizarStatus() {

  const online =
    navigator.onLine;

  document.getElementById(
    'statusIcon'
  ).innerText =
    online ? '🟢' : '🔴';

  document.getElementById(
    'statusTexto'
  ).innerText =
    online
      ? 'ONLINE'
      : 'OFFLINE';

}


window.addEventListener(
  'online',
  atualizarStatus
);


window.addEventListener(
  'offline',
  atualizarStatus
);


atualizarStatus();


async function enviarInspecao() {

  const dados = {

    nome:
      document.getElementById(
        'nome'
      ).value,

    matricula:
      document.getElementById(
        'matricula'
      ).value,

    placa:
      document.getElementById(
        'placa'
      ).value
      .toUpperCase(),

    km:
      document.getElementById(
        'km'
      ).value,

    dataInspecao:
      document.getElementById(
        'data'
      ).value,

    observacao:
      document.getElementById(
        'observacao'
      ).value || ''

  };


  let incompleto = false;


  itens.forEach(
    function(item) {

      const resposta =
        document.querySelector(
          `input[name="${item[0]}"]:checked`
        );


      if (!resposta) {

        incompleto = true;

      } else {

        dados[item[0]] =
          resposta.value;

      }

    }
  );


  if (

    !dados.nome ||

    !dados.matricula ||

    !dados.placa ||

    !dados.km ||

    incompleto

  ) {

    alert(
      'Preencha todos os campos obrigatórios e responda todas as verificações.'
    );

    return;

  }


  dados.id =
    gerarId();


  dados.timestamp =
    new Date()
      .toISOString();


  const resultado =
    calcularResultado(dados);


  dados.resultado =
    resultado;


  salvarLocalmente(dados);


  mostrarComprovanteOffline(
    dados
  );


  if (navigator.onLine) {

    sincronizar();

  }

}


function gerarId() {

  const agora =
    new Date();

  const parteData =
    agora
      .toISOString()
      .replace(
        /[-:.TZ]/g,
        ''
      );

  const aleatorio =
    Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase();

  return (
    'INS-' +
    parteData +
    '-' +
    aleatorio
  );

}


function calcularResultado(dados) {

  let nc = 0;

  let impeditivos = 0;


  itens.forEach(
    function(item) {

      if (
        dados[item[0]] === 'NÃO'
      ) {

        nc++;


        if (
          matriz[item[0]]
        ) {

          impeditivos++;

        }

      }

    }
  );


  if (
    impeditivos > 0
  ) {

    return 'NÃO LIBERADO';

  }


  if (
    nc > 0
  ) {

    return 'APROVADO COM PENDÊNCIA';

  }


  return 'APROVADO';

}


function salvarLocalmente(dados) {

  const fila =
    JSON.parse(
      localStorage.getItem(
        'inspecoes_pendentes'
      ) || '[]'
    );


  fila.push(dados);


  localStorage.setItem(
    'inspecoes_pendentes',
    JSON.stringify(fila)
  );

}


function obterFila() {

  return JSON.parse(

    localStorage.getItem(
      'inspecoes_pendentes'
    ) || '[]'

  );

}


function mostrarComprovanteOffline(dados) {

  document.getElementById(
    'formulario'
  ).style.display =
    'none';


  const div =
    document.getElementById(
      'resultado'
    );


  let classe =
    'aprovado';

  let titulo =
    '🟢 APROVADO';


  if (
    dados.resultado ===
    'APROVADO COM PENDÊNCIA'
  ) {

    classe =
      'pendencia';

    titulo =
      '🟡 APROVADO COM PENDÊNCIA';

  }


  if (
    dados.resultado ===
    'NÃO LIBERADO'
  ) {

    classe =
      'reprovado';

    titulo =
      '🔴 NÃO LIBERADO';

  }


  div.innerHTML = `

    <div class="resultado ${classe}">

      <h1>
        ${titulo}
      </h1>

    </div>


    <div class="card">

      <h2>
        COMPROVANTE
      </h2>

      <div class="linha">
        <b>Motorista</b>
        <span>${dados.nome}</span>
      </div>

      <div class="linha">
        <b>Matrícula</b>
        <span>${dados.matricula}</span>
      </div>

      <div class="linha">
        <b>Placa</b>
        <span>${dados.placa}</span>
      </div>

      <div class="linha">
        <b>KM</b>
        <span>${dados.km}</span>
      </div>

      <div class="linha">
        <b>Data</b>
        <span>${dados.dataInspecao}</span>
      </div>

    </div>


    <div class="id">

      ID DA INSPEÇÃO<br><br>

      ${dados.id}

    </div>


    <div class="card">

      <h3>
        ${
          navigator.onLine
            ? '☁️ Enviando ao sistema...'
            : '📴 Inspeção armazenada neste dispositivo'
        }
      </h3>

      <p>
        ${
          navigator.onLine
            ? 'A inspeção será sincronizada com o sistema.'
            : 'Quando a conexão retornar, ela será enviada automaticamente.'
        }
      </p>

    </div>


    <div class="print">

      📱 Tire um print desta tela
      para seus registros.

    </div>

  `;


  div.style.display =
    'block';

}


window.addEventListener(
  'online',
  sincronizar
);


async function sincronizar() {

  if (
    !navigator.onLine
  ) {

    return;

  }


  const fila =
    obterFila();


  if (
    fila.length === 0
  ) {

    return;

  }


  /*
   * AQUI ENTRARÁ A COMUNICAÇÃO
   * COM O GOOGLE APPS SCRIPT.
   *
   * NÃO VAMOS COLOCAR AINDA.
   */


  console.log(
    'Inspeções aguardando sincronização:',
    fila.length
  );

}


if (
  'serviceWorker'
  in navigator
) {

  window.addEventListener(
    'load',
    function() {

      navigator
        .serviceWorker
        .register(
          'service-worker.js'
        );

    }
  );

}
