export default {
	testEnvironment: 'node',
	roots: ['<rootDir>/src/tests'],
	transform: {},
	setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
	testTimeout: 30000
};