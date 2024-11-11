import { expect } from 'chai';

describe('Stam test suit', () => {
  describe('test Array get sorted', () => {
    it('should return sorted array', () => {
      const names = ['adiel', 'yosi', 'ron'];
      expect(names.sort()).to.be.eql(['adiel', 'ron', 'yosi']);
    });
  });
});
