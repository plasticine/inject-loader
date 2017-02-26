import inject from '../src';
import * as InjectorTasks from '../src/InjectorTasks.js'

describe('Index', () => {
  const context = {
    resourcePath: "mockModule"
  };
  describe('inject', () => {
    beforeEach(() => {
      context.cacheable = jest.fn()
      console.warn = jest.fn();
    });
    test('injecting without dependencies shows warning and continues', () => {
      InjectorTasks.getModuleDependencies = jest.fn().mockReturnValue([]);
      InjectorTasks.replaceDependencies = jest.fn().mockReturnValue("source with replaced dependencies");
      InjectorTasks.injectIntoWrapper = jest.fn().mockReturnValue("final source");

      const injectedCode = inject.call(context, `original source`);
      expect(context.cacheable).toHaveBeenCalled();
      expect(context.cacheable.mock.calls.length).toBe(1);
      expect(InjectorTasks.getModuleDependencies).toHaveBeenCalledWith("original source");
      expect(InjectorTasks.getModuleDependencies.mock.calls.length).toBe(1);
      expect(console.warn.mock.calls.length).toBe(1);
      expect(console.warn).toHaveBeenCalledWith("Inject Loader: The module you are trying to inject into ('mockModule') does not seem to have any dependencies, are you sure you want to do this?");
      expect(InjectorTasks.replaceDependencies).toHaveBeenCalledWith("original source");
      expect(InjectorTasks.injectIntoWrapper).toHaveBeenCalledWith([], "source with replaced dependencies");
      expect(injectedCode).toEqual("final source");
    });
    test('injecting with dependencies does not warn', () => {
      InjectorTasks.getModuleDependencies = jest.fn().mockReturnValue(["dependency", "anotherDependency"]);
      InjectorTasks.replaceDependencies = jest.fn().mockReturnValue("source with replaced dependencies");
      InjectorTasks.injectIntoWrapper = jest.fn().mockReturnValue("final source");

      const injectedCode = inject.call(context, `original source`);
      expect(context.cacheable).toHaveBeenCalled();
      expect(context.cacheable.mock.calls.length).toBe(1);
      expect(InjectorTasks.getModuleDependencies).toHaveBeenCalledWith("original source");
      expect(console.warn).not.toHaveBeenCalled();
      expect(InjectorTasks.getModuleDependencies.mock.calls.length).toBe(1);
      expect(InjectorTasks.replaceDependencies).toHaveBeenCalledWith("original source");
      expect(InjectorTasks.injectIntoWrapper).toHaveBeenCalledWith(["dependency", "anotherDependency"], "source with replaced dependencies");
      expect(injectedCode).toEqual("final source");
    });
    test('if the cacheable property does not exist, do not call it', () => {
      // This is a little difficult to test as something that doesn't exist can't be mocked.
      // Deleting the key and ensuring that it doesn't crash is the best we can do.
      delete context.cacheable;
      InjectorTasks.getModuleDependencies = jest.fn().mockReturnValue([]);
      InjectorTasks.replaceDependencies = jest.fn().mockReturnValue("source with replaced dependencies");
      InjectorTasks.injectIntoWrapper = jest.fn().mockReturnValue("final source");

      const injectedCode = inject.call(context, `original source`);
      expect(InjectorTasks.getModuleDependencies).toHaveBeenCalledWith("original source");
      expect(InjectorTasks.getModuleDependencies.mock.calls.length).toBe(1);
      expect(console.warn.mock.calls.length).toBe(1);
      expect(console.warn).toHaveBeenCalledWith("Inject Loader: The module you are trying to inject into ('mockModule') does not seem to have any dependencies, are you sure you want to do this?");
      expect(InjectorTasks.replaceDependencies).toHaveBeenCalledWith("original source");
      expect(InjectorTasks.injectIntoWrapper).toHaveBeenCalledWith([], "source with replaced dependencies");
      expect(injectedCode).toEqual("final source");
    });
  });
});
