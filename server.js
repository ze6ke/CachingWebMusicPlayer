/* eslint-disable no-console */ //this comment isn't necessary because it's been disabled in the eslint config file

var express = require('express')
var app = express()

//add routes and middelware


app.use(express.static('dist'))

app.listen(8888, () => {
  console.log('listening on port 8888')
})
