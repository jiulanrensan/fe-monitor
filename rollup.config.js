import dts from "rollup-plugin-dts";
import typescript from "rollup-plugin-typescript2";

/**
 * 需要打包的package
 */
const packageList = [ 'common', 'wechat-sdk' ]

function isProd() {
  return process.env.NODE_ENV === 'production'
}

function addWatch(opt, packageName) {
  Object.assign(opt, {
    watch: {
      buildDelay: 1000,
      include: `packages/${packageName}/**`,
      exclude: [
        `packages/${packageName}/dist/**`,
        `packages/${packageName}/node_modules/**`
      ]
    }
  })
}

function createConfig() {
  const configList = []
  packageList.forEach((packageName) => {
    const buildOpt = {
      input: `packages/${packageName}/src/index.ts`,
      output: {
        file: `packages/${packageName}/dist/index.js`,
        format: "es",
        sourcemap: true,
      },
      plugins: [
        typescript({
          tsconfig: `packages/${packageName}/tsconfig.json`
        }),
      ],
    }
    const dtsOpt = {
      input: `packages/${packageName}/src/index.ts`,
      output: {
        file: `packages/${packageName}/dist/index.d.ts`,
        format: "es",
      },
      plugins: [dts()]
    }
    if (!isProd()) {
      addWatch(buildOpt, packageName)
      addWatch(dtsOpt, packageName)
    }
    configList.push(buildOpt, dtsOpt)
  })
  console.log('NODE_ENV', process.env.NODE_ENV, JSON.stringify(configList));
  return configList
}

export default createConfig()