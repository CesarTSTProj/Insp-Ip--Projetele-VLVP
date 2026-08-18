const CACHE_NAME =
  'insp-ipe-proj-v1';


const ARQUIVOS = [

  './',

  './index.html',

  './style.css',

  './app.js'

];


self.addEventListener(
  'install',
  function(event) {

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
        )

    );

  }
);


self.addEventListener(
  'fetch',
  function(event) {

    event.respondWith(

      caches
        .match(event.request)
        .then(
          function(resposta) {

            return (
              resposta ||
              fetch(event.request)
            );

          }
        )

    );

  }
);
