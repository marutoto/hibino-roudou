# hibino-roudou

## Usage
```
const scriptName = 'core-script.ent.js'
const ele = document.createElement('script')
ele.type = 'text/javascript'
ele.src = `https://cdn.jsdelivr.net/gh/marutoto/hibino-roudou/misc/${scriptName}?d=${new Date().getTime()}`
document.body.appendChild(ele)
```

This script calls via CDN

```
x https://rawgit.com/marutoto/hibino-roudou/master/misc/core-script.ent.js
o https://raw.githubusercontent.com/marutoto/hibino-roudou/master/misc/core-script.ent.js
o https://cdn.jsdelivr.net/gh/marutoto/hibino-roudou/misc/core-script.ent.js
```

ref. https://stackoverflow.com/questions/17341122/link-and-execute-external-javascript-file-hosted-on-github

## Core Script
- https://github.com/marutoto/hibino-roudou/blob/master/misc/core_script.js
- https://github.com/marutoto/hibino-roudou/blob/master/misc/core-script-dd.js
- https://github.com/marutoto/hibino-roudou/blob/master/misc/core-script.ent.js

~~ref. https://gist.github.com/marutoto/22091f36edc85091aa4c600e01dc0494~~
