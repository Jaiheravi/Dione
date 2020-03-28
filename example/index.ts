import { server, request } from '../src/index'

/*
This is the main server definition for this example,
the only required fields are 'port' and 'onRequest',
but we can add whatever we want after that. Especially
a 'resources' object that can contain all the functions
for each request.
*/

server({
  port: 3000,
  onRequest: [
    data => ({
      ...data,
      request: request.parse(data.request)
    })
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
