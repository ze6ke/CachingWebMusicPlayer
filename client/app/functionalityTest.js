export default function() {
  const DISPLAY = false
  let retval = ''

  retval += 'fetch is ' + (fetch?'':'not ') + 'available.\n'
  retval += 'window.URL.createObjectURL is ' + (window.URL.createObjectURL?'':'not ') + 'available.\n'

  DISPLAY && alert (retval)
}
