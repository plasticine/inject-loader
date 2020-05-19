import {getValue as mainGetValue} from 'main';
import mainModuleInjector from 'inject-loader!main';

describe('Main', () => {
  it('works without injecting', () => {
    expect(mainGetValue()).toEqual(20);
  });

  describe('injecting code into module dependencies', () => {
    it('allows for injecting code into a subset of dependencies', () => {
      let mainModuleInjected = mainModuleInjector({
        bar: {BAR: 5},
      });
      expect(mainModuleInjected.getValue()).toEqual(50);

      mainModuleInjected = mainModuleInjector({
        getFoo: () => 10,
      });
      expect(mainModuleInjected.getValue()).toEqual(20);
    });

    it('allows for injecting code mulitple dependencies', () => {
      let mainModuleInjected = mainModuleInjector({
        getFoo: () => 5,
        bar: {BAR: 5},
      });
      expect(mainModuleInjected.getValue()).toEqual(25);
    });
  });
});
