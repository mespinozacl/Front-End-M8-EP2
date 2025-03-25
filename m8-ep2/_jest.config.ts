import type { Config } from 'jest';
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
  };

export default config;