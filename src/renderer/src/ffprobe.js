const { spawn } = window.require('node:child_process')

let ffprobe

export const ffprobeGetData = async (inputPath) => {
  return new Promise((resolve, reject) => {
    let returnData = ''

    ffprobe = spawn('ffprobe', [
      '-v',
      'quiet',
      '-print_format',
      'json',
      '-show_format',
      '-show_streams',
      inputPath
    ])

    ffprobe.stdout.on('data', (data) => {
      returnData += data.toString()
    })

    ffprobe.on('close', (code) => {
      console.log(`ffprobe done with code ${code}`)

      const data = JSON.parse(returnData)

      const videoData = {
        fps: eval(data.streams[0].r_frame_rate),
        totalFrames: parseInt(data.streams[0].nb_frames),
        duration: parseFloat(data.streams[0].duration)
      }

      resolve(videoData)
    })
  })
}
