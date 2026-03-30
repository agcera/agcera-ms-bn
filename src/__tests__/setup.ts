jest.mock('@src/utils/sendEmail', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(true),
}));

jest.mock('@src/utils/cloudinary', () => ({
  handleUpload: jest.fn().mockResolvedValue('http://mocked.local/image.png'),
  handleDeleteUpload: jest.fn().mockResolvedValue(true),
}));

jest.setTimeout(120000);
process.env.NODE_ENV = 'test';
