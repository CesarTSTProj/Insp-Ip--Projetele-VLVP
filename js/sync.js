/*
=================================================
INSP - SINCRONIZAÇÃO
=================================================

Responsabilidades:

- Preparar dados para envio
- Converter foto para Base64
- Comunicar com Google Apps Script
- Sincronizar inspeções pendentes
- Sincronização manual
- Validar resposta do servidor

=================================================
*/

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxulJAYuJ_CzJMU6BAsiQPkzcSuUJVJ3fr4UupFjPeNjGytzI7sqwW2ZhlbvGqoLLr-/exec';
let idComprovanteAtual = null;

function blobParaBase64(blob) {

  return new Promise(
    function(resolve, reject) {

      const reader =
        new FileReader();


      reader.onload =
        function() {

          const resultado =
            reader.result;


          const base64 =
            resultado
              .split(',')[1];


          resolve(base64);

        };


      reader.onerror =
        function() {

          reject(
            reader.error
          );

        };


      reader.readAsDataURL(
        blob
      );

    }
  );

}

async function prepararPayload(
  dados
) {

  const payload = {
    ...dados
  };


  if (
    dados.foto &&
    dados.foto.blob
  ) {

    payload.foto = {

      nome:
        dados.foto.nome,

      tipo:
        dados.foto.tipo,

      base64:
        await blobParaBase64(
          dados.foto.blob
        )

    };

  } else {

    payload.foto =
      null;

  }


  return payload;

}

function origemGoogleValida(
  origem
) {

  try {

    const url =
      new URL(origem);


    return (

      url.protocol === 'https:' &&

      (
        url.hostname ===
          'script.google.com'

        ||

        url.hostname.endsWith(
          '.googleusercontent.com'
        )
      )

    );

  } catch (erro) {

    return false;

  }

}
async function enviarParaServidor(
  dados
) {

  const payload =
    await prepararPayload(
      dados
    );


  return new Promise(
    function(resolve, reject) {

      const nomeIframe =
        'sync_' +
        Date.now() +
        '_' +
        Math.random()
          .toString(36)
          .substring(2);


      const iframe =
        document.createElement(
          'iframe'
        );


      iframe.name =
        nomeIframe;


      iframe.style.display =
        'none';


      document.body.appendChild(
        iframe
      );


      const formulario =
        document.createElement(
          'form'
        );


      formulario.method =
        'POST';


      formulario.action =
        APPS_SCRIPT_URL;


      formulario.target =
        nomeIframe;


      formulario.style.display =
        'none';


      const input =
        document.createElement(
          'input'
        );


      input.type =
        'hidden';


      input.name =
        'payload';


      input.value =
        JSON.stringify(
          payload
        );


      formulario.appendChild(
        input
      );


      document.body.appendChild(
        formulario
      );


      let timer;


      function limpar() {

        window.removeEventListener(
          'message',
          receberResposta
        );


        formulario.remove();


        setTimeout(
          function() {

            iframe.remove();

          },
          500
        );

      }


      function receberResposta(
        event
      ) {

        if (
          !origemGoogleValida(
            event.origin
          )
        ) {

          return;

        }


        const resposta =
          event.data;


        if (
          !resposta ||

          resposta.source !==
            'INSP_IPE_BACKEND' ||

          resposta.id !==
            dados.id
        ) {

          return;

        }


        clearTimeout(
          timer
        );


        limpar();


        if (
          resposta.sucesso
        ) {

          resolve(
            resposta
          );

        } else {

          reject(
            new Error(
              resposta.erro ||
              'Servidor não confirmou a inspeção.'
            )
          );

        }

      }


      window.addEventListener(
        'message',
        receberResposta
      );


      timer =
        setTimeout(
          function() {

            limpar();


            reject(
              new Error(
                'Tempo limite de sincronização excedido.'
              )
            );

          },
          45000
        );


      document.body.appendChild(
        formulario
      );


      formulario.submit();

    }
  );

}
let sincronizacaoEmAndamento =
  false;


async function sincronizar() {

  if (
    !navigator.onLine ||
    sincronizacaoEmAndamento
  ) {

    return;

  }


  sincronizacaoEmAndamento =
    true;


  try {

    const pendentes =
      await obterInspecoesPendentes();


    if (
      pendentes.length === 0
    ) {

      return;

    }


    for (
      const inspecao
      of pendentes
    ) {

      /*
      Se a internet cair no meio,
      paramos imediatamente.
      */

      if (
        !navigator.onLine
      ) {

        break;

      }


      try {

        console.log(
          'Sincronizando:',
          inspecao.id
        );


        const resposta =
          await enviarParaServidor(
            inspecao
          );


        /*
        SOMENTE depois da confirmação
        do Google marcamos como sincronizada.
        */

        await marcarComoSincronizada(

          inspecao.id,

          resposta.timestampSincronizacao

        );


        console.log(
          'Sincronizada:',
          inspecao.id
        );


        atualizarComprovanteSincronizado(
          inspecao.id
        );


      } catch (erro) {

        console.error(

          'Falha ao sincronizar ' +
          inspecao.id,

          erro

        );


        /*
        Não apagamos.
        Continua PENDENTE.
        */

      }

    }


  } finally {

    sincronizacaoEmAndamento =
      false;


    await atualizarContadorFila();

    await atualizarTelaInspecoes();

  }

}

async function sincronizarAgora() {

  if (
    !navigator.onLine
  ) {

    alert(
      'O aparelho está offline. As inspeções permanecem armazenadas e serão enviadas quando a conexão retornar.'
    );

    return;

  }


  const botao =
    document.getElementById(
      'botaoSincronizar'
    );


  if (botao) {

    botao.disabled =
      true;


    botao.innerText =
      '🔄 Sincronizando...';

  }


  try {

    await sincronizar();


    const pendentes =
      await obterInspecoesPendentes();


    if (
      pendentes.length === 0
    ) {

      alert(
        'Sincronização concluída. Todas as inspeções deste aparelho foram enviadas.'
      );

    } else {

      alert(
        'A sincronização foi executada, mas ' +
        pendentes.length +
        ' inspeção(ões) ainda aguardam envio.'
      );

    }


  } catch (erro) {

    console.error(
      'Erro na sincronização manual:',
      erro
    );


    alert(
      'Não foi possível concluir a sincronização. As inspeções permanecem armazenadas neste aparelho.'
    );

  } finally {

    if (botao) {

      botao.disabled =
        !navigator.onLine;


      botao.innerText =
        '🔄 Sincronizar agora';

    }


    await atualizarContadorFila();


    await atualizarTelaInspecoes();

  }

}
/*
=================================================
SINCRONIZAÇÃO AUTOMÁTICA
=================================================
*/

let timerSincronizacaoAutomatica = null;


/*
Tenta sincronizar sem incomodar
o usuário com alertas.
*/

async function tentarSincronizacaoAutomatica() {

  if (!navigator.onLine) {
    return;
  }

  if (sincronizacaoEmAndamento) {
    return;
  }

  try {

    const pendentes =
      await obterInspecoesPendentes();


    if (
      pendentes.length === 0
    ) {

      await atualizarContadorFila();

      return;

    }


    console.log(
      'Sincronização automática: ' +
      pendentes.length +
      ' inspeção(ões) pendente(s).'
    );


    await sincronizar();


  } catch (erro) {

    console.error(
      'Falha na sincronização automática:',
      erro
    );

  }

}


/*
=================================================
INICIAR ROTINA AUTOMÁTICA
=================================================
*/

function iniciarSincronizacaoAutomatica() {

  /*
  1. Ao abrir o sistema
  */

  setTimeout(
    tentarSincronizacaoAutomatica,
    2000
  );


  /*
  2. Internet voltou
  */

  window.addEventListener(
    'online',
    function() {

      console.log(
        'Conexão recuperada.'
      );

      tentarSincronizacaoAutomatica();

    }
  );


  /*
  3. Usuário voltou para o aplicativo
  */

  document.addEventListener(
    'visibilitychange',
    function() {

      if (
        document.visibilityState ===
        'visible'
      ) {

        tentarSincronizacaoAutomatica();

      }

    }
  );


  /*
  4. Janela recebeu foco novamente
  */

  window.addEventListener(
    'focus',
    function() {

      tentarSincronizacaoAutomatica();

    }
  );


  /*
  5. Página retomada pelo navegador
  */

  window.addEventListener(
    'pageshow',
    function() {

      tentarSincronizacaoAutomatica();

    }
  );


  /*
  6. Enquanto o aplicativo estiver aberto,
  verifica periodicamente.
  */

  if (
    timerSincronizacaoAutomatica
  ) {

    clearInterval(
      timerSincronizacaoAutomatica
    );

  }


  timerSincronizacaoAutomatica =
    setInterval(

      function() {

        if (
          navigator.onLine &&
          document.visibilityState ===
          'visible'
        ) {

          tentarSincronizacaoAutomatica();

        }

      },

      30000

    );

}
