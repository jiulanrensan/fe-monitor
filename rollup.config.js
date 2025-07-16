import dts from "rollup-plugin-dts";
import typescript from "rollup-plugin-typescript2";
import alias from '@rollup/plugin-alias';
import { resolve } from 'path';
import terser from '@rollup/plugin-terser';

/**
 * 需要打包的package
 */
const packageList = [
  'sdk',
  // 'shared'
]

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
    const plugins = [
      // 处理路径别名
      alias({
        entries: [
          { find: '@', replacement: resolve(`packages/${packageName}/src`) }
        ]
      }),
      typescript({
        tsconfig: `packages/${packageName}/tsconfig.json`,
        // 处理路径别名
        useTsconfigDeclarationDir: true,
        // 确保正确处理模块解析
        moduleResolution: 'bundler',
      }),
    ]

    // 生产环境添加混淆压缩
    if (isProd()) {
      plugins.push(
        terser({
          // compress: {},
          mangle: {
            // 混淆变量名
            toplevel: true,
          },
          format: {
            comments: false, // 移除注释
          },
        })
      )
    }

    const buildOpt = {
      input: `packages/${packageName}/src/index.ts`,
      output: {
        file: `packages/${packageName}/dist/index.js`,
        format: "es",
        sourcemap: !isProd(), // 生产环境不生成sourcemap
      },
      external: [
        // 微信小程序环境下的全局对象
        'wx',
        // 如果不想打包shared依赖，可以取消注释下面这行
        // '@fe-monitor/shared'
      ],
      plugins,
    }
    const dtsOpt = {
      input: `packages/${packageName}/src/index.ts`,
      output: {
        file: `packages/${packageName}/dist/index.d.ts`,
        format: "es",
      },
      external: [
        'wx',
        // '@fe-monitor/shared'
      ],
      plugins: [
        // 处理路径别名
        alias({
          entries: [
            { find: '@', replacement: resolve(`packages/${packageName}/src`) }
          ]
        }),
        dts({
          // 处理路径别名
          compilerOptions: {
            baseUrl: `packages/${packageName}`,
            paths: {
              '@/*': ['src/*']
            }
          }
        })
      ]
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