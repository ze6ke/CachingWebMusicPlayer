/* eslint-disable no-console */ //this comment isn't necessary because it's been disabled in the eslint config file

var express = require('express')
var app = express()

//add routes and middelware
//an extra comment


app.use(express.static('dist/public'))

app.listen(8000, () => {
  console.log('listening on port 8000')
})
