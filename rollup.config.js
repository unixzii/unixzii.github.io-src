import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import svelte from 'rollup-plugin-svelte';
import buble from 'rollup-plugin-buble';
import uglify from 'rollup-plugin-uglify';

const plugins = [
  commonjs(),
  replace({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  }),
  nodeResolve({
    jsnext: true
  }),
  svelte(),
  buble()
];

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  plugins.push(uglify());
}

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife'
  },
  plugins,
  sourcemap: !isProduction
};