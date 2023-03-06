import { execa } from 'execa'

const getTotalFrames = async (inputPath) => {
  const { stdout } = await execa('ffprobe', [
    '-v',
    'error',
    '-select_streams',
    'v:0',
    '-show_entries',
    'stream=nb_frames',
    '-of',
    'default=nokey=1:noprint_wrappers=1',
    inputPath
  ])
  const totalFrames = parseInt(stdout)
  const fps = await getFps(inputPath)
  return { totalFrames, fps }
}

const getFps = async (inputPath) => {
  const { stdout } = await execa('ffprobe', [
    '-v',
    'error',
    '-select_streams',
    'v',
    '-of',
    'default=noprint_wrappers=1:nokey=1',
    '-show_entries',
    'stream=r_frame_rate',
    inputPath
  ])
  const split = stdout.split('/')
  return parseInt(split[0]) / parseInt(split[1])
}

const getDuration = async (inputPath) => {
  const { stdout } = await execa('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'default=noprint_wrappers=1:nokey=1',
    inputPath
  ])
  return parseFloat(stdout)
}

const getVideoInfo = async (inputPath) => {
  const { totalFrames, fps } = await getTotalFrames(inputPath)
  const duration = await getDuration(inputPath)
  return { totalFrames, fps, duration }
}

export default getVideoInfo
