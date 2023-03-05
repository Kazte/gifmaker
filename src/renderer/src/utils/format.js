import _ from 'lodash'

export const formatDuration = (_seconds) => {
  let seconds = _seconds || 0
  let minutes = seconds / 60
  let hours = minutes / 60

  const hoursPadded = _.padStart(Math.floor(hours), 2, '0')
  const minutesPadded = _.padStart(Math.floor(minutes % 60), 2, '0')
  const secondsPadded = _.padStart(Math.floor(seconds) % 60, 2, '0')
  const msPadded = _.padStart(Math.floor((seconds - Math.floor(seconds)) * 1000), 3, '0')

  return `${hoursPadded}:${minutesPadded}:${secondsPadded}.${msPadded}`
}
