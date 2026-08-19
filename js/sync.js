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
