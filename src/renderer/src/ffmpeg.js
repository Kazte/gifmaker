import { ffprobeGetData } from './ffprobe'
import EventEmmiter from 'events'
export const ffmpegEvents = new EventEmmiter()

const { spawn } = window.require('node:child_process')

let ffmpeg

export const ffmpegConvertToGif = async ({ inputPath, outputPath, fpsSample = 12, cutFrom, cutTo }) => {
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
    '-ss',
    cutFrom,
    '-t',
    cutTo - cutFrom,
    outputPath,
    '-y'
  ])

  const fixedTotalFrame = (fpsSample * videoData.totalFrames) / videoData.fps
  const fixedDuration = (cutFrom + cutFrom) - videoData.duration

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
  })

  ffmpeg.on('close', (code) => {
    console.log(`ffmpeg done with code ${code}`)

    if (code === 0) {
      returnData.done = true
    } else if (code === 1) {
      returnData.error = true
      returnData.errorMessage = 'Error converting to gif'
    } else {
      returnData.percent = 0

    }

    ffmpegEvents.emit('conversion', returnData)
  })
}

export const ffmpegCancel = () => {
  if (ffmpeg) {
    console.log('ffmpeg cancel');
    ffmpeg.stderr.pause();
    ffmpeg.kill(2)
  }
}
