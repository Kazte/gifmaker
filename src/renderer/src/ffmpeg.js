import { ffprobeGetData } from './ffprobe'
import EventEmmiter from 'events'
import { fpsToMs } from './utils/fpsToMs'
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

  const newDuration = cutTo - cutFrom;

  const newFixedTotalFrames = Math.round(newDuration * fpsSample);

  ffmpeg.stderr.on('data', (data) => {
    const frames = data.toString().match(/frame=\s*(\d+)/)
    if (frames) {
      progress = frames[1]
      returnData.percent = Math.round((progress / newFixedTotalFrames) * 100)
      ffmpegEvents.emit('conversion', returnData)
    }
  })

  ffmpeg.on('close', (code) => {
    console.log(`ffmpeg done with code ${code}`)

    if (code === 0) {
      returnData.done = true
      // returnData.percent = 100
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
