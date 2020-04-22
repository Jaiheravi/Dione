const http = require('http')
const subtext = require('@hapi/subtext')

/*
The pipe function allows us to process an array of functions
where the result of the first function is the input for
the second function and so on until all the functions
in the array are processed.

This is similar to how .then() behaves in promises but
I'm not sure if they can be applied in the same way here.
Having an array of functions seems cleaner in practice.
*/

const pipe = fns => x =>
  fns.reduce((v, f) => v.then(f), Promise.resolve(x))

/*
This is the main function used to define and start a server.
Everything related to the server being specified is found in
a single object called serverDefinition.
*/

module.exports.server = serverDefinition =>
  http.createServer(async (httpRequest, httpResponse) => {
    // Get the response by processing the array of 'onRequest' functions.
    const response =
      await pipe(serverDefinition.onRequest || [])(httpRequest)

    // Send response to the client
    httpResponse.writeHead(response.status, response.headers)
    httpResponse.end(response.payload)
  }).listen(
    // Start server
    serverDefinition.port,
    () => console.log(`Running on port ${serverDefinition.port}`)
  )

/*
This object contains all the most used functions to handle requests,
the one especially useful is 'parse' that converts the raw request
to an easy to handle object.
*/

module.exports.request = {
  parsePayload: async (request, options = { output: 'data' }) =>
    await subtext.parse(request, null, {
      parse: true,
      output: options.output,
      ...options
    })
}

/*
Before sending our response to the client we have to make sure we are
sending plain data and other useful info like the size in bytes.
*/

module.exports.response = {
  serialize: preResponse => {
    // Convert the JSON response into a string
    const serializedPayload = preResponse.headers && preResponse.headers['Content-Type'] === 'application/json'
      ? JSON.stringify(preResponse.payload)
      : preResponse.payload

    // Return the final response to the client
    return {
      status: preResponse.status,
      headers: {
        'Content-Length': Buffer.byteLength(serializedPayload, preResponse.encoding || 'utf8'),
        ...preResponse.headers || {}
      },
      payload: serializedPayload
    }
  }
}

/*
This is a quick router to find the appropriate resource for a request
*/

module.exports.router = {
  findResource: (resources, path, method) =>
    getResource(getRequestRoute(path, method), resources)
}

const getRequestRoute = (path, method) =>
  path === '/' || path === 'index.html'
    ? ['/', method]
    : path.split('/').slice(1).concat(method)

// TODO: Rewrite this to avoid stack-overflow on long paths, or limit the amount of elements
const getResource = (requestRoute, resourceTree) => {
  const currentBranch = resourceTree[requestRoute[0]]

  // Check if the current request segment matched a key in the resource tree
  // Return false if it didn't match, otherwise continue
  if (!currentBranch) return false

  // If there is another segment in the request route to check then continue the recursion
  // Otherwise return the current branch of the resource three
  return requestRoute[1]
    ? getResource(requestRoute.slice(1), currentBranch)
    : currentBranch
}
