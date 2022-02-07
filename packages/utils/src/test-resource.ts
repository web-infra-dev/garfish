export const vueAppRootNode = 'vue-app';
export const vueAppRootText = 'vue app init page';
export const vueAppHtml = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <title>vue sub app</title>
    </head>
    <body>
      <div id="app"></div>
      <script>
        if (__GARFISH_EXPORTS__) {
          __GARFISH_EXPORTS__.provider = ()=>{
            return {
              render ({ dom , basename }) {
                let newContent = document.createElement('div');
                newContent.setAttribute('id','${vueAppRootNode}');
                newContent.innerHTML = "${vueAppRootText}"
                dom.querySelector('#app').appendChild(newContent);
              },
              destroy ({ dom , basename }){
                dom.querySelector('#app').removeChild(dom.querySelector('#${vueAppRootNode}'));
              }
            }
          }
        }
      </script>
    </body>
  </html>
`;

export const reactAppRootNode = 'react-app';
export const reactAppRootText = 'react app init page';
export const reactAppHtml = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <title>react sub app</title>
    </head>
    <body>
      <div id="app"></div>
      <script>
        if (__GARFISH_EXPORTS__) {
          __GARFISH_EXPORTS__.provider = ()=>{
            return {
              render ({ dom , basename }) {
                let newContent = document.createElement('div');
                newContent.setAttribute('id','${reactAppRootNode}');
                newContent.innerHTML = "${reactAppRootText}"
                dom.querySelector('#app').appendChild(newContent);
              },
              destroy ({ dom , basename }){
                dom.querySelector('#app').removeChild(dom.querySelector('#${reactAppRootNode}'));
              }
            }
          }
        }
      </script>
    </body>
  </html>
`;
