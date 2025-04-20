const useRouter = () => {
  return {
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn()
  };
};

const usePathname = () => '/';

const useSearchParams = () => new URLSearchParams();

module.exports = {
  useRouter,
  usePathname,
  useSearchParams
}; 