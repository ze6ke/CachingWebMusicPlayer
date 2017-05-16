const isPhantom = () =>
{
  return navigator.userAgent.toLowerCase().indexOf('phantom') > -1
}

export {isPhantom}
