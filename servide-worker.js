const CACHE_NAME =
  'insp-ipe-proj-v2';


const ARQUIVOS = [

  './',

  './index.html',

  './style.css',

  './app.js'

];


self.addEventListener(
  'install',
  function(event) {

    self.skipWaiting();

    event.waitUntil(

      caches
        .open(CACHE_NAME)
        .then(
          function(cache) {

            return cache.addAll(
              ARQUIVOS
            );

          }
        )

    );

  }
);


self.addEventListener(
  'activate',
  function(event) {

    event.waitUntil(

      Promise.all([

        caches.keys()
          .then(
            function(chaves) {

              return Promise.all(

                chaves
                  .filter(
                    function(chave) {

                      return (
                        chave !==
                        CACHE_NAME
                      );

                    }
                  )
                  .map(
                    function(chave) {

                      return caches.delete(
                        chave
                      );

                    }
                  )

              );

            }
          ),

        self.clients.claim()

      ])

    );

  }
);


self.addEventListener(
  'fetch',
  function(event) {

    if (
      event.request.method !== 'GET'
    ) {

      return;

    }


    event.respondWith(

      fetch(
        event.request
      )

        .then(
          function(resposta) {

            const copia =
              resposta.clone();


            caches
              .open(CACHE_NAME)
              .then(
                function(cache) {

                  cache.put(
                    event.request,
                    copia
                  );

                }
              );


            return resposta;

          }
        )

        .catch(
          function() {

            return caches.match(
              event.request
            );

          }
        )

    );

  }
);
