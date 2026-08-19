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
