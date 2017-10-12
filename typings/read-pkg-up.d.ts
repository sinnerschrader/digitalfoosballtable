declare module "read-pkg-up" {
  namespace e {
    // breaks module import if namespace is missing
    interface ReadPkgUpOptions {
      cwd?: string;
      normalize?: boolean;
    }

    interface PkgData {
      name: string;
      [key: string]: PkgData[] | PkgData | string | number | boolean | null
    }

    function sync(options?: ReadPkgUpOptions): PkgData;
  }

  function e(options?: e.ReadPkgUpOptions): e.PkgData;

  export = e;
}
