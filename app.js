/*
=================================================
CONFIGURAÇÕES DO SISTEMA
=================================================
*/

const DB_NAME = 'INSP_IPE_PROJETELE';
const DB_VERSION = 1;
const STORE_NAME = 'inspecoes';
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxulJAYuJ_CzJMU6BAsiQPkzcSuUJVJ3fr4UupFjPeNjGytzI7sqwW2ZhlbvGqoLLr-/exec';


/*
=================================================
ITENS DO CHECKLIST
=================================================
*/

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


/*
=================================================
MATRIZ DE CRITICIDADE

true  = impeditivo
false = não impeditivo
=================================================
*/

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


/*
=================================================
CRIAR CHECKLIST NA TELA
=================================================
*/

const checklist =
  document.getElementById('checklist');


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


/*
=================================================
DATA AUTOMÁTICA
=================================================
*/

const hoje =
  new Date();

const ano =
  hoje.getFullYear();

const mes =
  String(
    hoje.getMonth() + 1
  ).padStart(2, '0');

const dia =
  String(
    hoje.getDate()
  ).padStart(2, '0');


document.getElementById('data').value =
  `${ano}-${mes}-${dia}`;


/*
=================================================
ABRIR INDEXEDDB
=================================================
*/

function abrirBanco() {

  return new Promise(
    function(resolve, reject) {

      const requisicao =
        indexedDB.open(
          DB_NAME,
          DB_VERSION
        );


      requisicao.onupgradeneeded =
        function(event) {

          const db =
            event.target.result;


          if (
            !db.objectStoreNames.contains(
              STORE_NAME
            )
          ) {

            const store =
              db.createObjectStore(
                STORE_NAME,
                {
                  keyPath: 'id'
                }
              );


            store.createIndex(
              'statusSync',
              'statusSync',
              {
                unique: false
              }
            );


            store.createIndex(
              'timestampInspecao',
              'timestampInspecao',
              {
                unique: false
              }
            );

          }

        };


      requisicao.onsuccess =
        function(event) {

          resolve(
            event.target.result
          );

        };


      requisicao.onerror =
        function(event) {

          reject(
            event.target.error
          );

        };

    }
  );

}


/*
=================================================
SALVAR INSPEÇÃO NO INDEXEDDB
=================================================
*/

async function salvarInspecaoLocal(
  dados
) {

  const db =
    await abrirBanco();


  return new Promise(
    function(resolve, reject) {

      const transacao =
        db.transaction(
          STORE_NAME,
          'readwrite'
        );


      const store =
        transacao.objectStore(
          STORE_NAME
        );


      const requisicao =
        store.put(dados);


      requisicao.onsuccess =
        function() {

          resolve(true);

        };


      requisicao.onerror =
        function(event) {

          reject(
            event.target.error
          );

        };

    }
  );

}


/*
=================================================
LISTAR INSPEÇÕES PENDENTES
=================================================
*/

async function obterInspecoesPendentes() {

  const db =
    await abrirBanco();


  return new Promise(
    function(resolve, reject) {

      const transacao =
        db.transaction(
          STORE_NAME,
          'readonly'
        );


      const store =
        transacao.objectStore(
          STORE_NAME
        );


      const indice =
        store.index(
          'statusSync'
        );


      const requisicao =
        indice.getAll(
          'PENDENTE'
        );


      requisicao.onsuccess =
        function() {

          resolve(
            requisicao.result || []
          );

        };


      requisicao.onerror =
        function(event) {

          reject(
            event.target.error
          );

        };

    }
  );

}


/*
=================================================
CONTADOR DE INSPEÇÕES PENDENTES
=================================================
*/

async function atualizarContadorFila() {

  try {

    const db = await abrirBanco();

    const quantidade = await new Promise(function(resolve, reject) {

      const transacao = db.transaction(
        STORE_NAME,
        'readonly'
      );

      const store = transacao.objectStore(
        STORE_NAME
      );

      const indice = store.index(
        'statusSync'
      );

      const requisicao = indice.count(
        'PENDENTE'
      );

      requisicao.onsuccess = function() {
        resolve(requisicao.result);
      };

      requisicao.onerror = function(event) {
        reject(event.target.error);
      };

    });


    const elemento =
      document.getElementById('filaStatus');


    if (!elemento) {
      return;
    }


    if (quantidade === 0) {

      elemento.innerText =
        '0 inspeções aguardando sincronização';

    } else if (quantidade === 1) {

      elemento.innerText =
        '1 inspeção aguardando sincronização';

    } else {

      elemento.innerText =
        quantidade +
        ' inspeções aguardando sincronização';

    }

  } catch (erro) {

    console.error(
      'Erro ao contar inspeções pendentes:',
      erro
    );

  }

}

/*
=================================================
STATUS ONLINE / OFFLINE
=================================================
*/

function atualizarStatus() {

  const online =
    navigator.onLine;


  document.getElementById(
    'statusIcon'
  ).innerText =
    online
      ? '🟢'
      : '🔴';


  document.getElementById(
    'statusTexto'
  ).innerText =
    online
      ? 'ONLINE'
      : 'OFFLINE';


  atualizarContadorFila();

}


window.addEventListener(
  'online',
  function() {

    atualizarStatus();

    sincronizar();

  }
);


window.addEventListener(
  'offline',
  atualizarStatus
);


/*
=================================================
GERAR ID ÚNICO
=================================================
*/

function gerarId() {

  const agora =
    new Date();


  const ano =
    agora.getFullYear();


  const mes =
    String(
      agora.getMonth() + 1
    ).padStart(2, '0');


  const dia =
    String(
      agora.getDate()
    ).padStart(2, '0');


  const hora =
    String(
      agora.getHours()
    ).padStart(2, '0');


  const minuto =
    String(
      agora.getMinutes()
    ).padStart(2, '0');


  const segundo =
    String(
      agora.getSeconds()
    ).padStart(2, '0');


  const aleatorio =
    Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();


  return (
    'INS-' +
    ano +
    mes +
    dia +
    '-' +
    hora +
    minuto +
    segundo +
    '-' +
    aleatorio
  );

}


/*
=================================================
CALCULAR RESULTADO
=================================================
*/

function calcularResultado(
  dados
) {

  let quantidadeNC = 0;

  let quantidadeImpedimentos = 0;

  const listaNC = [];

  const listaImpedimentos = [];


  itens.forEach(
    function(item) {

      const chave =
        item[0];

      const nome =
        item[1];


      if (
        dados[chave] === 'NÃO'
      ) {

        quantidadeNC++;


        const impeditivo =
          matriz[chave] === true;


        listaNC.push({

          chave: chave,

          nome: nome,

          impeditivo: impeditivo

        });


        if (impeditivo) {

          quantidadeImpedimentos++;

          listaImpedimentos.push(
            nome
          );

        }

      }

    }
  );


  let resultado;


  if (
    quantidadeImpedimentos > 0
  ) {

    resultado =
      'NÃO LIBERADO';

  } else if (
    quantidadeNC > 0
  ) {

    resultado =
      'APROVADO COM PENDÊNCIA';

  } else {

    resultado =
      'APROVADO';

  }


  return {

    resultado:
      resultado,

    quantidadeNC:
      quantidadeNC,

    quantidadeImpedimentos:
      quantidadeImpedimentos,

    listaNC:
      listaNC,

    listaImpedimentos:
      listaImpedimentos

  };

}


/*
=================================================
ENVIAR INSPEÇÃO
=================================================
*/

async function enviarInspecao() {

  const botao =
    document.getElementById(
      'botaoEnviar'
    );


  const dados = {

    nome:
      document.getElementById(
        'nome'
      ).value.trim(),

    matricula:
      document.getElementById(
        'matricula'
      ).value.trim(),

    placa:
      document.getElementById(
        'placa'
      ).value
      .trim()
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
      ).value.trim()

  };


  let incompleto =
    false;


  itens.forEach(
    function(item) {

      const resposta =
        document.querySelector(
          `input[name="${item[0]}"]:checked`
        );


      if (!resposta) {

        incompleto =
          true;

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

    !dados.dataInspecao ||

    incompleto

  ) {

    alert(
      'Preencha todos os campos obrigatórios e responda todas as verificações.'
    );

    return;

  }


  botao.disabled =
    true;


  botao.innerText =
    'REGISTRANDO INSPEÇÃO...';


  try {

    /*
    FOTO
    */

    const inputFoto =
      document.getElementById(
        'foto'
      );


    const arquivo =
      inputFoto.files[0];


    if (arquivo) {

      dados.foto = {

        nome:
          arquivo.name,

        tipo:
          arquivo.type,

        tamanho:
          arquivo.size,

        blob:
          arquivo

      };

    } else {

      dados.foto =
        null;

    }


    /*
    IDENTIFICAÇÃO
    */

    dados.id =
      gerarId();


    dados.timestampInspecao =
      new Date().toISOString();


    dados.fusoHorarioMinutos =
      new Date()
        .getTimezoneOffset();


    dados.statusSync =
      'PENDENTE';


    dados.timestampSincronizacao =
      null;


    /*
    RESULTADO
    */

    const analise =
      calcularResultado(
        dados
      );


    dados.resultado =
      analise.resultado;


    dados.quantidadeNC =
      analise.quantidadeNC;


    dados.quantidadeImpedimentos =
      analise.quantidadeImpedimentos;


    dados.listaNC =
      analise.listaNC;


    dados.listaImpedimentos =
      analise.listaImpedimentos;


    /*
    SALVAR NO APARELHO
    */

    await salvarInspecaoLocal(
      dados
    );


    await atualizarContadorFila();


    /*
    MOSTRAR COMPROVANTE
    */

    mostrarComprovante(
      dados
    );


    /*
    SE ESTIVER ONLINE,
    TENTA SINCRONIZAR
    */

    if (
      navigator.onLine
    ) {

      sincronizar();

    }

  } catch (erro) {

    console.error(
      erro
    );


    alert(
      'Não foi possível armazenar a inspeção neste dispositivo. ' +
      'Não considere a inspeção registrada. ' +
      'Erro: ' +
      erro.message
    );


    botao.disabled =
      false;


    botao.innerText =
      'ENVIAR INSPEÇÃO';

  }

}


/*
=================================================
COMPROVANTE
=================================================
*/

function mostrarComprovante(
  dados
) {

  document.getElementById(
    'formulario'
  ).style.display =
    'none';


  const div =
    document.getElementById(
      'resultado'
    );


  let classe;
  let titulo;
  let mensagem;


  if (
    dados.resultado ===
    'APROVADO'
  ) {

    classe =
      'aprovado';

    titulo =
      '🟢 APROVADO';

    mensagem =
      'Veículo liberado para operação.';

  } else if (
    dados.resultado ===
    'APROVADO COM PENDÊNCIA'
  ) {

    classe =
      'pendencia';

    titulo =
      '🟡 APROVADO COM PENDÊNCIA';

    mensagem =
      'Veículo liberado com pendências não impeditivas.';

  } else {

    classe =
      'reprovado';

    titulo =
      '🔴 NÃO LIBERADO';

    mensagem =
      'VEÍCULO NÃO LIBERADO PARA OPERAÇÃO.';

  }


  const dataHora =
    new Date(
      dados.timestampInspecao
    );


  const dataFormatada =
    dataHora.toLocaleDateString(
      'pt-BR'
    );


  const horaFormatada =
    dataHora.toLocaleTimeString(
      'pt-BR',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    );


  let blocoNC = '';


  if (
    dados.listaNC.length > 0
  ) {

    blocoNC = `

      <div class="card">

        <h2>
          Não conformidades
        </h2>

        ${dados.listaNC
          .map(function(item) {

            return `

              <div class="linha">

                <span>
                  ${item.nome}
                </span>

                <span>
                  ${
                    item.impeditivo
                      ? '🔴 IMPEDITIVO'
                      : '🟡 NÃO IMPEDITIVO'
                  }
                </span>

              </div>

            `;

          })
          .join('')
        }

      </div>

    `;

  }


  div.innerHTML = `

    <div
      class="resultado ${classe}">

      <h1>
        ${titulo}
      </h1>

    </div>


    <div class="card">

      <h2>
        COMPROVANTE
      </h2>


      <div class="linha">
        <b>Placa</b>
        <span>${dados.placa}</span>
      </div>


      <div class="linha">
        <b>Motorista</b>
        <span>${dados.nome}</span>
      </div>


      <div class="linha">
        <b>Matrícula</b>
        <span>${dados.matricula}</span>
      </div>


      <div class="linha">
        <b>Data</b>
        <span>${dataFormatada}</span>
      </div>


      <div class="linha">
        <b>Hora</b>
        <span>${horaFormatada}</span>
      </div>


      <div class="linha">
        <b>KM</b>
        <span>${dados.km}</span>
      </div>


      <div class="linha">
        <b>Verificações</b>
        <span>${itens.length}</span>
      </div>


      <div class="linha">
        <b>Não conformidades</b>
        <span>${dados.quantidadeNC}</span>
      </div>


      <div class="linha">
        <b>Impedimentos</b>
        <span>${dados.quantidadeImpedimentos}</span>
      </div>

    </div>


    <div class="id">

      ID DA INSPEÇÃO<br><br>

      ${dados.id}

    </div>


    <div class="card">

      <h2 style="text-align:center">

        ${mensagem}

      </h2>

    </div>


    ${blocoNC}


    ${
      dados.observacao
        ? `

          <div class="card">

            <h2>
              Observações
            </h2>

            <p>
              ${dados.observacao}
            </p>

          </div>

        `
        : ''
    }


    <div class="card">

      <h3 style="text-align:center">

        ${
          navigator.onLine
            ? '☁️ Aguardando confirmação do servidor'
            : '📴 INSPEÇÃO REGISTRADA OFFLINE'
        }

      </h3>


      <p style="text-align:center">

        ${
          navigator.onLine

            ? 'A inspeção está armazenada neste dispositivo e será sincronizada com o sistema.'

            : 'Esta inspeção está armazenada neste dispositivo e será enviada quando houver conexão.'
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


/*
=================================================
SINCRONIZAÇÃO

NA PRÓXIMA ETAPA VAMOS LIGAR AO APPS SCRIPT.
=================================================
*/

async function sincronizar() {

  if (
    !navigator.onLine
  ) {

    return;

  }


  const pendentes =
    await obterInspecoesPendentes();


  if (
    pendentes.length === 0
  ) {

    return;

  }


  console.log(
    pendentes.length +
    ' inspeção(ões) aguardando sincronização.'
  );


  /*
  A conexão com o Google Apps Script
  será adicionada aqui na próxima etapa.
  */

}


/*
=================================================
INICIAR SISTEMA
=================================================
*/

async function iniciarSistema() {

  try {

    await abrirBanco();

    atualizarStatus();

    await atualizarContadorFila();

  } catch (erro) {

    console.error(
      'Erro ao iniciar IndexedDB:',
      erro
    );

  }

}


iniciarSistema();


/*
=================================================
SERVICE WORKER
=================================================
*/

if (
  'serviceWorker' in navigator
) {

  window.addEventListener(
    'load',
    function() {

      navigator.serviceWorker
        .register(
          './service-worker.js'
        )
        .catch(
          function(erro) {

            console.error(
              'Erro no Service Worker:',
              erro
            );

          }
        );

    }
  );

}
