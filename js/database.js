/*
=================================================
INSP - BANCO DE DADOS LOCAL
=================================================

Responsabilidades:

- Abrir o IndexedDB
- Criar estrutura do banco
- Salvar inspeções
- Consultar inspeções pendentes
- Consultar histórico local
- Contar inspeções pendentes
- Marcar inspeções como sincronizadas

=================================================
*/


/*
=================================================
CONFIGURAÇÃO DO BANCO
=================================================
*/

var DB_NAME =
  'INSP_IPE_PROJETELE';

var DB_VERSION =
  1;

var STORE_NAME =
  'inspecoes';


/*
=================================================
ABRIR BANCO
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


          let store;


          if (
            !db.objectStoreNames.contains(
              STORE_NAME
            )
          ) {

            store =
              db.createObjectStore(
                STORE_NAME,
                {
                  keyPath: 'id'
                }
              );

          } else {

            store =
              event.target.transaction
                .objectStore(
                  STORE_NAME
                );

          }


          /*
          Índice para sincronização
          */

          if (
            !store.indexNames.contains(
              'statusSync'
            )
          ) {

            store.createIndex(
              'statusSync',
              'statusSync',
              {
                unique: false
              }
            );

          }


          /*
          Índice por data/hora
          */

          if (
            !store.indexNames.contains(
              'timestampInspecao'
            )
          ) {

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

          console.error(
            'Erro ao abrir IndexedDB:',
            event.target.error
          );

          reject(
            event.target.error
          );

        };

    }
  );

}


/*
=================================================
SALVAR INSPEÇÃO NO APARELHO
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
        store.put(
          dados
        );


      requisicao.onsuccess =
        function() {

          resolve(
            dados
          );

        };


      requisicao.onerror =
        function(event) {

          console.error(
            'Erro ao salvar inspeção:',
            event.target.error
          );

          reject(
            event.target.error
          );

        };

    }
  );

}


/*
=================================================
OBTER INSPEÇÕES PENDENTES
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

          const registros =
            requisicao.result || [];


          registros.sort(
            function(a, b) {

              return (
                new Date(
                  a.timestampInspecao
                ) -
                new Date(
                  b.timestampInspecao
                )
              );

            }
          );


          resolve(
            registros
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
CONTAR INSPEÇÕES PENDENTES
=================================================
*/

async function contarInspecoesPendentes() {

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
        indice.count(
          'PENDENTE'
        );


      requisicao.onsuccess =
        function() {

          resolve(
            requisicao.result
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
HISTÓRICO LOCAL
=================================================
*/

async function obterResumoInspecoes() {

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


      const requisicao =
        store.openCursor();


      const registros =
        [];


      requisicao.onsuccess =
        function(event) {

          const cursor =
            event.target.result;


          if (cursor) {

            const dados =
              cursor.value;


            /*
            A foto não é carregada para
            a listagem do histórico.
            */

            registros.push({

              id:
                dados.id,

              tipo:
                dados.tipo || 'leve',

              versaoChecklist:
                dados.versaoChecklist || '',

              placa:
                dados.placa || '',

              nome:
                dados.nome || '',

              matricula:
                dados.matricula || '',

              km:
                dados.km || '',

              resultado:
                dados.resultado || '',

              statusSync:
                dados.statusSync ||
                'PENDENTE',

              timestampInspecao:
                dados.timestampInspecao ||
                '',

              timestampSincronizacao:
                dados.timestampSincronizacao ||
                null,

              quantidadeNC:
                dados.quantidadeNC || 0,

              quantidadeImpedimentos:
                dados.quantidadeImpedimentos ||
                0

            });


            cursor.continue();

          } else {

            registros.sort(
              function(a, b) {

                return (
                  new Date(
                    b.timestampInspecao
                  ) -
                  new Date(
                    a.timestampInspecao
                  )
                );

              }
            );


            resolve(
              registros
            );

          }

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
MARCAR COMO SINCRONIZADA
=================================================
*/

async function marcarComoSincronizada(
  id,
  timestampSincronizacao
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
        store.get(
          id
        );


      requisicao.onsuccess =
        function() {

          const dados =
            requisicao.result;


          if (!dados) {

            reject(
              new Error(
                'Inspeção não encontrada no banco local: ' +
                id
              )
            );

            return;

          }


          dados.statusSync =
            'SINCRONIZADA';


          dados.timestampSincronizacao =
            timestampSincronizacao ||
            new Date().toISOString();


          const atualizacao =
            store.put(
              dados
            );


          atualizacao.onsuccess =
            function() {

              resolve(
                dados
              );

            };


          atualizacao.onerror =
            function(event) {

              reject(
                event.target.error
              );

            };

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
