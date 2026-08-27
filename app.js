/*
=================================================
CONFIGURAÇÕES DO SISTEMA
=================================================
*/
/*
=================================================
ALTERAR TÍTULO DA TELA
=================================================
*/

document.getElementById(
  'tituloInspecao'
).innerText =
  configuracaoAtual.titulo;
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
SEGURANÇA PARA TEXTO MOSTRADO NA TELA
=================================================
*/

function escaparHtml(valor) {

  return String(
    valor ?? ''
  )

    .replaceAll(
      '&',
      '&amp;'
    )

    .replaceAll(
      '<',
      '&lt;'
    )

    .replaceAll(
      '>',
      '&gt;'
    )

    .replaceAll(
      '"',
      '&quot;'
    )

    .replaceAll(
      "'",
      '&#039;'
    );

}


/*
=================================================
CONTROLE DA TELA DE INSPEÇÕES
=================================================
*/

let telaAntesPainel =
  'formulario';


async function abrirTelaInspecoes() {

  const formulario =
    document.getElementById(
      'formulario'
    );


  const resultado =
    document.getElementById(
      'resultado'
    );


  if (
    resultado.style.display !==
    'none'
  ) {

    telaAntesPainel =
      'resultado';

  } else {

    telaAntesPainel =
      'formulario';

  }


  formulario.style.display =
    'none';


  resultado.style.display =
    'none';


  document.getElementById(
    'painelInspecoes'
  ).style.display =
    'block';


  await atualizarTelaInspecoes();


  window.scrollTo(
    {
      top: 0,
      behavior: 'smooth'
    }
  );

}


function fecharTelaInspecoes() {

  document.getElementById(
    'painelInspecoes'
  ).style.display =
    'none';


  if (
    telaAntesPainel ===
    'resultado'
  ) {

    document.getElementById(
      'resultado'
    ).style.display =
      'block';

  } else {

    document.getElementById(
      'formulario'
    ).style.display =
      'block';

  }

}


/*
=================================================
DESENHAR HISTÓRICO LOCAL
=================================================
*/

async function atualizarTelaInspecoes() {

  const painel =
    document.getElementById(
      'painelInspecoes'
    );


  if (
    !painel ||
    painel.style.display === 'none'
  ) {

    return;

  }


  const registros =
    await obterResumoInspecoes();


  const pendentes =
    registros.filter(
      item =>
        item.statusSync ===
        'PENDENTE'
    ).length;


  const sincronizadas =
    registros.filter(
      item =>
        item.statusSync ===
        'SINCRONIZADA'
    ).length;


  document.getElementById(
    'resumoInspecoes'
  ).innerHTML = `

    <div class="resumo-local">

      <b>
        Total neste aparelho:
      </b>
      ${registros.length}

      <br>

      <b>
        Pendentes:
      </b>
      ${pendentes}

      <br>

      <b>
        Sincronizadas:
      </b>
      ${sincronizadas}

    </div>

  `;


  const lista =
    document.getElementById(
      'listaInspecoes'
    );


  if (
    registros.length === 0
  ) {

    lista.innerHTML = `

      <div class="sem-inspecoes">

        Nenhuma inspeção registrada
        neste aparelho.

      </div>

    `;

    return;

  }


  lista.innerHTML =
    registros
      .map(
        function(item) {

          const momento =
            item.timestampInspecao
              ? new Date(
                  item.timestampInspecao
                )
              : null;


          const data =
            momento
              ? momento.toLocaleDateString(
                  'pt-BR'
                )
              : '-';


          const hora =
            momento
              ? momento.toLocaleTimeString(
                  'pt-BR',
                  {
                    hour:
                      '2-digit',

                    minute:
                      '2-digit'
                  }
                )
              : '-';


          const sincronizada =
            item.statusSync ===
            'SINCRONIZADA';


          const badge =
            sincronizada

              ? `
                <span
                  class="status-sync sync-ok">

                  ✅ SINCRONIZADA

                </span>
              `

              : `
                <span
                  class="status-sync sync-pendente">

                  ⏳ PENDENTE

                </span>
              `;


          let simboloResultado =
            '🟢';


          if (
            item.resultado ===
            'APROVADO COM PENDÊNCIA'
          ) {

            simboloResultado =
              '🟡';

          }


          if (
            item.resultado ===
            'NÃO LIBERADO'
          ) {

            simboloResultado =
              '🔴';

          }


          return `

            <div class="inspecao-local">

              <div
                class="inspecao-local-topo">

                <div
                  class="inspecao-id">

                  ${escaparHtml(
                    item.id
                  )}

                </div>

                ${badge}

              </div>


              <div class="linha">

                <b>Placa</b>

                <span>
                  ${escaparHtml(
                    item.placa
                  )}
                </span>

              </div>


              <div class="linha">

                <b>Motorista</b>

                <span>
                  ${escaparHtml(
                    item.nome
                  )}
                </span>

              </div>


              <div class="linha">

                <b>Data</b>

                <span>
                  ${data} ${hora}
                </span>

              </div>


              <div class="linha">

                <b>Resultado</b>

                <span
                  class="resultado-local">

                  ${simboloResultado}
                  ${escaparHtml(
                    item.resultado
                  )}

                </span>

              </div>


              <div class="linha">

                <b>NC</b>

                <span>
                  ${item.quantidadeNC}
                </span>

              </div>


              <div class="linha">

                <b>Impeditivos</b>

                <span>
                  ${item.quantidadeImpedimentos}
                </span>

              </div>

            </div>

          `;

        }
      )
      .join('');

}
async function atualizarContadorFila() {

  try {

    const quantidade =
      await contarInspecoesPendentes();


    const elemento =
      document.getElementById(
        'filaStatus'
      );


    if (!elemento) {

      return;

    }


    if (
      quantidade === 0
    ) {

      elemento.innerText =
        '0 inspeções aguardando sincronização';

    } else if (
      quantidade === 1
    ) {

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

const botaoSincronizar =
  document.getElementById(
    'botaoSincronizar'
  );


if (botaoSincronizar) {

  botaoSincronizar.disabled =
    !online;

}
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

    tipo:
  tipoVeiculo,

versaoChecklist:
  configuracaoAtual.versao,
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
    if (navigator.onLine) {

  tentarSincronizacaoAutomatica();
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
  idComprovanteAtual =
  dados.id;

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

  <b>Tipo</b>

  <span>
    ${
      dados.tipo === 'pesado'
        ? 'VEÍCULO PESADO'
        : 'VEÍCULO LEVE'
    }
  </span>

</div>

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

  <h3
    id="statusServidor"
    style="text-align:center">

    ${
      navigator.onLine
        ? '☁️ Aguardando confirmação do servidor'
        : '📴 INSPEÇÃO REGISTRADA OFFLINE'
    }

  </h3>


  <p
    id="textoServidor"
    style="text-align:center">

    ${
      navigator.onLine

        ? 'A inspeção está armazenada neste dispositivo e está aguardando confirmação do sistema.'

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


function atualizarComprovanteSincronizado(id) {

  if (id !== idComprovanteAtual) {
    return;
  }

  const titulo =
    document.getElementById(
      'statusServidor'
    );

  const texto =
    document.getElementById(
      'textoServidor'
    );

  if (titulo) {

    titulo.innerText =
      '✅ SINCRONIZADA COM O SISTEMA';

  }

  if (texto) {

    texto.innerText =
      'A inspeção foi recebida e registrada no sistema da empresa.';

  }

}
/*
=================================================
BOTÃO SINCRONIZAR AGORA
=================================================
*/



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
    
    iniciarSincronizacaoAutomatica();

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
