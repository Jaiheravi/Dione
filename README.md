# Dione

This project aims to provide a full web development environment for both client-side and server-side websites.

## Client-side sites, a.k.a Static sites

When a server.js file is omitted, the CLI will start its own server to process the source files in the indicated directory.

The content of a static website is divided into two main components, the data and the templates. Templates are further divided into layouts and sections. Then there is the style sheets and the scripts; Dione also processes those, stylesheets written in a custom PostCSS-based language but scripts remain unprocessed (for now).

### The development server

The CLI starts creating a small in-memory "filesystem" which consists of an object containing HTML and CSS files. These files are built by reading all the files inside the directory and subdirectories trying to find all the compatible sources, which are currently YAML and PostCSS files. Those source files are compiled in-memory to HTML and CSS to be served by the web server. For each incoming request we first try to find the file in memory and then on the real filesystem as backup, if none of those contain the file then we return 404. All this is to avoid the creation of temporal files during development which are often the cause of confusion and pollute the working directory, this is also more intuitive because it gives the impression of working directly in the source files.

We should be able to update our filesystem every time the real file system changes so the change is reflected in the browser, but in the early stages restarting the whole thing is a quick option too.

### Each YAML file is a page

Each page in a static site starts from a YAML file, where the only mandatory field is the "sections" key which indicates what section templates to include in the page. And a "meta" key which becomes a global object that can be accessed across all the section templates in the page and in the layout itself.

The following is a sample of to show the structure of a typical blog site:

```yaml
# index.yml
layout: default.pug
meta:
  title: My Blog
  stylesheet: blog.css
sections:
  header:
    headline: Welcome
    subheading: To my blog
  articles:
    - title: Test 1
      tags:
        - sample
        - test
      content: |
        Maybe some **markdown** here

        and *here*
    - title: Test 2
      tags:
        - sample
        - test
      content: |
        Maybe some **markdown** here

        and *here*
  footer:
    copyright: Some dude in 2021

```

This Yaml file is then processed to create a new page, to do this we take the layout file and replace a placeholder tag where we include as imports the list of section templates in the "sections" key, we do this because Pug doesn't support dynamic imports (I'll create an alternative language to Pug later). Each section template is a pug file. Then we compile the whole thing (layout and sections) using the Pug compiler by passing the data for each section in the YAML file to the template and the "meta" key as well, then it returns our HTML, this HTML is the whole page that can be stored in the virtual filesystem during development or written to disk for production.

### Stylesheets

These are not special, we just compile custom CSS files with PostCSS and store them in memory for development or on disk for production.

### Going to production

To create a production site we just write to disk the contents of the in-memory filesystem and copy the remaining files found in the working directory with the exception of the source files (YAML and PostCSS).

## Server Side websites

If the CLI finds a server.js file in the top level of the working directory then it just uses it to start a server instead of starting the default server for static sites. By writing a server.js file we have complete control over what the server does and is low level enough to handle Node.js HTTP requests and responses directly.
