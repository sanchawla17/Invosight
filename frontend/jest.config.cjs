module.exports = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest"
  },
  moduleNameMapper: {
    "^\\./apiPaths$": "<rootDir>/test/apiPathsMock.cjs",
    "^.+/utils/apiPaths$": "<rootDir>/test/apiPathsMock.cjs",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(png|jpe?g|gif|svg|webp)$": "<rootDir>/test/fileMock.js"
  }
};
