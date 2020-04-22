const Dione = require('../index')

/*
This is the main server definition for this example,
the only required fields are 'port' and 'onRequest',
but we can add whatever we want after that. Especially
a 'resources' object that can contain all the functions
for each request.
*/

Dione.server({
  port: 3000,
  onRequest: [
    // Parse the raw HTTP request and get useful values
    request => ({
      url: new URL(
          request.url,
          process.env.NODE_ENV === 'production'
            ? `https://${request.headers.host}`
            : `http://${request.headers.host}`),
      method: request.method,
      payload: Dione.request.parsePayload(request)
    }),

    // Find the resource that the request is asking
    request => {
      const resource = Dione.router.findResource(resources, request.url.pathname, request.method)

      return resource
        ? resource(request)
        : {
          status: 404,
          payload: 'Resource not found'
        }
    }
  ],
  resources: {
    '/': {
      GET: data => ({
        status: 200,
        payload: 'OK'
      })
    }
  }
})
