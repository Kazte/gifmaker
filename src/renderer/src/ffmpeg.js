import { ffprobeGetData } from '../ffprobe'
import EventEmmiter from 'events'
export const ffmpegEvents = new EventEmmiter()

const { spawn } = window.require('node:child_process')

let ffmpeg

export const ffmpegConvertToGif = async ({ inputPath, outputPath, fpsSample = 12 }) => {
  const videoData = await ffprobeGetData(inputPath)
  let progress = 0
  let returnData = {
    percent: 0,
    done: false,
    outputPath: outputPath,
    error: false,
    errorMessage: ''
  }

  ffmpeg = await spawn('ffmpeg', [
    '-i',
    inputPath,
    '-vf',
    `fps=${fpsSample},scale=320:-1:flags=lanczos`,
    outputPath,
    '-y'
  ])

  const fixedTotalFrame = (fpsSample * videoData.totalFrames) / videoData.fps

  ffmpeg.stderr.on('data', (data) => {
    const split = data.toString().split('frame=')
    const frame = parseInt(split[split.length - 1])
    progress = (frame / fixedTotalFrame) * 100
    progress = Math.round(progress)

    if (isNaN(progress)) {
      progress = 0
    }

    returnData.percent = progress

    ffmpegEvents.emit('conversion', returnData)

    // window.dispatchEvent(conversionEvent)
  })

  ffmpeg.on('close', (code) => {
    console.log(`ffmpeg done with code ${code}`)

    if (code === 0) {
      returnData.done = true
    } else {
      returnData.error = true
      returnData.errorMessage = 'Error converting to gif'
    }

    ffmpegEvents.emit('conversion', returnData)
  })
}
