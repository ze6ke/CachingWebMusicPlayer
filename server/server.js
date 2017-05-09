/* eslint-disable no-console */ //this comment isn't necessary because it's been disabled in the eslint config file

const express = require('express')
let app = express()
//const path = require('path')
const morgan = require('morgan')


//add routes and middelware
//an extra comment

//app.use(morgan('dev'))
if(process.env.NODE_ENV !== 'unittest') {
  app.use(morgan(':date :method :status :response-time[1]ms\t:url\t\tsize-:res[content-length]\ttype-:res[content-type]'))
}
/*app.get('/cache.manifest', function (req, res) {
  res.type('text/cache-manifest').sendFile(path.join(__dirname + '/cache.appcache'))
})*/

app.use(express.static('dist/public'))//host application files
app.use('/data', express.static('music')) //host the music files (this is my full music library)
app.use((req, res) => {
  res.status(404).send('something didn\'t work right')
})

const port=8000
app.listen(port, () => {
  console.log(`listening on port ${port}`)
})

export default app
module.exports = app
